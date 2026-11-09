"use client";

import type { FormEvent } from "react";
import { useEffect, useMemo, useState } from "react";

import { EllipsisVertical, Eye, Pencil, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { usePermission } from "@/components/auth/auth-provider";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { DataTable, type DataTableColumn } from "@/components/data-table/data-table";
import { ListPagination } from "@/components/data-table/list-pagination";
import { ListToolbar } from "@/components/data-table/list-toolbar";
import { DetailDialog, DetailRow } from "@/components/detail-dialog";
import { FormDialog } from "@/components/form-dialog";
import { FormField } from "@/components/form-field";
import { PageHeader } from "@/components/page-header";
import { StatusBadge } from "@/components/status-badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Spinner } from "@/components/ui/spinner";
import { Textarea } from "@/components/ui/textarea";
import { useListQuery } from "@/hooks/use-list-query";
import { formatDate, formatMoney, formatNumber } from "@/lib/format";
import { customerService } from "@/services/customer.service";
import { orderService } from "@/services/order.service";
import type { Customer } from "@/types/customer";
import type { Order, OrderInput, OrderStatus } from "@/types/order";

const ORDER_STATUSES: OrderStatus[] = ["pending", "paid", "shipped", "completed", "cancelled"];

interface OrderFormState {
  customerId: string;
  itemCount: string;
  total: string;
  status: OrderStatus;
  shippingAddress: string;
}

function createFormState(customerId = ""): OrderFormState {
  return {
    customerId,
    itemCount: "1",
    total: "",
    status: "pending",
    shippingAddress: "",
  };
}

function toFormState(order: Order): OrderFormState {
  return {
    customerId: order.customerId,
    itemCount: String(order.itemCount),
    total: String(order.total),
    status: order.status,
    shippingAddress: order.shippingAddress,
  };
}

export function OrdersView() {
  const { can } = usePermission();
  const [status, setStatus] = useState("all");
  const [customers, setCustomers] = useState<Customer[]>([]);

  const filters = useMemo(() => ({ status: status === "all" ? undefined : status }), [status]);

  const query = useListQuery<Order>({
    fetcher: orderService.list,
    initialSortBy: "createdAt",
    filters,
  });

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Order | null>(null);
  const [form, setForm] = useState<OrderFormState>(createFormState());
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [viewing, setViewing] = useState<Order | null>(null);
  const [statusDraft, setStatusDraft] = useState<OrderStatus>("pending");
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Order | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    let isActive = true;

    customerService
      .list({ pageSize: 100, sortBy: "name", sortDir: "asc" })
      .then((response) => {
        if (isActive) setCustomers(response.data);
      })
      .catch(() => {
        if (isActive) setCustomers([]);
      });

    return () => {
      isActive = false;
    };
  }, []);

  const openCreate = () => {
    setEditing(null);
    setForm(createFormState(customers[0]?.id ?? ""));
    setErrors({});
    setFormOpen(true);
  };

  const openEdit = (order: Order) => {
    setEditing(order);
    setForm(toFormState(order));
    setErrors({});
    setFormOpen(true);
  };

  const openView = (order: Order) => {
    setViewing(order);
    setStatusDraft(order.status);
  };

  const updateField = <K extends keyof OrderFormState>(key: K, value: OrderFormState[K]) => {
    setForm((current) => ({ ...current, [key]: value }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const nextErrors: Record<string, string> = {};
    const itemCount = Number(form.itemCount);
    const total = Number(form.total);

    if (!form.customerId) nextErrors.customerId = "Choose a customer.";
    if (!Number.isInteger(itemCount) || itemCount < 1) nextErrors.itemCount = "Enter at least one item.";
    if (!Number.isFinite(total) || total < 0) nextErrors.total = "Enter a valid order total.";
    if (form.shippingAddress.trim().length < 3) nextErrors.shippingAddress = "Enter a shipping address.";

    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    const input: OrderInput = {
      customerId: form.customerId,
      itemCount,
      total,
      status: form.status,
      shippingAddress: form.shippingAddress.trim(),
    };

    setIsSubmitting(true);

    try {
      if (editing) {
        await orderService.update(editing.id, input);
        toast.success("Order updated", { description: editing.orderNumber });
      } else {
        const created = await orderService.create(input);
        toast.success("Order created", { description: created.orderNumber });
      }
      setFormOpen(false);
      query.refresh();
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unable to save this order.";
      setErrors({ form: message });
      toast.error("Save failed", { description: message });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStatusUpdate = async () => {
    if (!viewing) return;

    setIsUpdatingStatus(true);

    try {
      const updated = await orderService.updateStatus(viewing.id, statusDraft);
      setViewing(updated);
      toast.success("Status updated", { description: `${updated.orderNumber} is now ${updated.status}.` });
      query.refresh();
    } catch (error) {
      toast.error("Update failed", {
        description: error instanceof Error ? error.message : "Unable to update the order status.",
      });
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;

    setIsDeleting(true);

    try {
      await orderService.remove(deleteTarget.id);
      toast.success("Order deleted", { description: deleteTarget.orderNumber });
      setDeleteTarget(null);
      query.refresh();
    } catch (error) {
      toast.error("Delete failed", {
        description: error instanceof Error ? error.message : "Unable to delete this order.",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const columns: DataTableColumn<Order>[] = [
    {
      id: "orderNumber",
      header: "Order",
      sortable: true,
      cell: (row) => (
        <div>
          <p className="font-medium">{row.orderNumber}</p>
          <p className="text-muted-foreground text-xs">{formatDate(row.createdAt)}</p>
        </div>
      ),
    },
    {
      id: "customerName",
      header: "Customer",
      cell: (row) => (
        <div className="min-w-0">
          <p className="max-w-48 truncate">{row.customerName}</p>
          <p className="text-muted-foreground max-w-48 truncate text-xs">{row.customerEmail}</p>
        </div>
      ),
    },
    {
      id: "itemCount",
      header: "Items",
      className: "text-right",
      headerClassName: "text-right",
      cell: (row) => formatNumber(row.itemCount),
    },
    {
      id: "total",
      header: "Total",
      sortable: true,
      className: "text-right",
      headerClassName: "text-right",
      cell: (row) => <span className="font-medium">{formatMoney(row.total, row.currency)}</span>,
    },
    {
      id: "status",
      header: "Status",
      cell: (row) => <StatusBadge status={row.status} />,
    },
    {
      id: "actions",
      header: "",
      headerClassName: "text-right",
      className: "text-right",
      cell: (row) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon-sm" aria-label={`Actions for ${row.orderNumber}`}>
              <EllipsisVertical />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-40">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuItem onSelect={() => openView(row)}>
              <Eye />
              View details
            </DropdownMenuItem>
            {can("order:update") ? (
              <DropdownMenuItem onSelect={() => openEdit(row)}>
                <Pencil />
                Edit
              </DropdownMenuItem>
            ) : null}
            {can("order:delete") ? (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuItem variant="destructive" onSelect={() => setDeleteTarget(row)}>
                  <Trash2 />
                  Delete
                </DropdownMenuItem>
              </>
            ) : null}
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <PageHeader
        title="Orders"
        description="Track orders, update fulfillment status, and review order value."
        actions={
          can("order:create") ? (
            <Button size="sm" onClick={openCreate}>
              <Plus data-icon="inline-start" />
              New order
            </Button>
          ) : null
        }
      />

      <ListToolbar search={query.search} onSearchChange={query.setSearch} placeholder="Search orders or customers…">
        <Select value={status} onValueChange={setStatus}>
          <SelectTrigger size="sm" className="w-36">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            {ORDER_STATUSES.map((item) => (
              <SelectItem key={item} value={item} className="capitalize">
                {item}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </ListToolbar>

      <DataTable
        columns={columns}
        data={query.rows}
        getRowId={(row) => row.id}
        isLoading={query.isLoading}
        error={query.error}
        onRetry={query.refresh}
        sortBy={query.sortBy}
        sortDir={query.sortDir}
        onSort={query.toggleSort}
        emptyTitle="No orders found"
        emptyDescription="Orders will appear here as customers check out, or adjust the filters."
        emptyAction={
          can("order:create") ? (
            <Button size="sm" onClick={openCreate}>
              <Plus data-icon="inline-start" />
              New order
            </Button>
          ) : null
        }
      />

      <ListPagination
        page={query.page}
        pageSize={query.pageSize}
        total={query.total}
        totalPages={query.totalPages}
        onPageChange={query.setPage}
        isLoading={query.isLoading}
      />

      <FormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        title={editing ? "Edit order" : "New order"}
        description={editing ? "Update the order details and status." : "Record a new order for an existing customer."}
        isSubmitting={isSubmitting}
        onSubmit={handleSubmit}
      >
        {errors.form ? <p className="text-destructive text-sm">{errors.form}</p> : null}
        <FormField label="Customer" error={errors.customerId}>
          <Select value={form.customerId} onValueChange={(value) => updateField("customerId", value)}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select customer" />
            </SelectTrigger>
            <SelectContent>
              {customers.map((customer) => (
                <SelectItem key={customer.id} value={customer.id}>
                  {customer.name} · {customer.email}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </FormField>
        <div className="grid gap-3 sm:grid-cols-2">
          <FormField label="Item count" htmlFor="order-items" error={errors.itemCount}>
            <Input
              id="order-items"
              type="number"
              min="1"
              step="1"
              value={form.itemCount}
              onChange={(event) => updateField("itemCount", event.target.value)}
            />
          </FormField>
          <FormField label="Total" htmlFor="order-total" error={errors.total}>
            <Input
              id="order-total"
              type="number"
              min="0"
              step="0.01"
              value={form.total}
              onChange={(event) => updateField("total", event.target.value)}
              placeholder="0.00"
            />
          </FormField>
        </div>
        <FormField label="Status">
          <Select value={form.status} onValueChange={(value) => updateField("status", value as OrderStatus)}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select status" />
            </SelectTrigger>
            <SelectContent>
              {ORDER_STATUSES.map((item) => (
                <SelectItem key={item} value={item} className="capitalize">
                  {item}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </FormField>
        <FormField label="Shipping address" htmlFor="order-address" error={errors.shippingAddress}>
          <Textarea
            id="order-address"
            value={form.shippingAddress}
            onChange={(event) => updateField("shippingAddress", event.target.value)}
            placeholder="Street, city, country"
            rows={2}
          />
        </FormField>
      </FormDialog>

      <DetailDialog
        open={Boolean(viewing)}
        onOpenChange={(open) => {
          if (!open) setViewing(null);
        }}
        title={viewing?.orderNumber ?? "Order"}
        description={viewing ? `Placed ${formatDate(viewing.createdAt)}` : undefined}
      >
        {viewing ? (
          <>
            <div className="grid gap-3 sm:grid-cols-2">
              <DetailRow label="Customer">{viewing.customerName}</DetailRow>
              <DetailRow label="Email">{viewing.customerEmail}</DetailRow>
              <DetailRow label="Items">{formatNumber(viewing.itemCount)}</DetailRow>
              <DetailRow label="Total">{formatMoney(viewing.total, viewing.currency)}</DetailRow>
              <DetailRow label="Current status">
                <StatusBadge status={viewing.status} />
              </DetailRow>
              <DetailRow label="Last updated">{formatDate(viewing.updatedAt)}</DetailRow>
            </div>
            <DetailRow label="Shipping address">{viewing.shippingAddress}</DetailRow>
            {can("order:update") ? (
              <div className="bg-muted/40 grid gap-2 rounded-lg border p-3">
                <span className="text-sm font-medium">Update fulfillment status</span>
                <div className="flex flex-wrap items-center gap-2">
                  <Select value={statusDraft} onValueChange={(value) => setStatusDraft(value as OrderStatus)}>
                    <SelectTrigger size="sm" className="w-36">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {ORDER_STATUSES.map((item) => (
                        <SelectItem key={item} value={item} className="capitalize">
                          {item}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button
                    size="sm"
                    onClick={handleStatusUpdate}
                    disabled={isUpdatingStatus || statusDraft === viewing.status}
                  >
                    {isUpdatingStatus ? <Spinner data-icon="inline-start" /> : null}
                    Save status
                  </Button>
                </div>
              </div>
            ) : null}
          </>
        ) : null}
      </DetailDialog>

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null);
        }}
        title="Delete order?"
        description={
          deleteTarget
            ? `This will permanently remove order ${deleteTarget.orderNumber}. This action cannot be undone.`
            : undefined
        }
        confirmLabel="Delete order"
        isPending={isDeleting}
        destructive
        onConfirm={handleDelete}
      />
    </div>
  );
}
