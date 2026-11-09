"use client";

import type { FormEvent } from "react";
import { useMemo, useState } from "react";

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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
import { useListQuery } from "@/hooks/use-list-query";
import { formatDate, formatMoney, formatNumber } from "@/lib/format";
import { getInitials } from "@/lib/utils";
import { customerService } from "@/services/customer.service";
import type { Customer, CustomerInput, CustomerStatus } from "@/types/customer";

interface CustomerFormState {
  name: string;
  email: string;
  phone: string;
  city: string;
  country: string;
  status: CustomerStatus;
}

function createFormState(): CustomerFormState {
  return { name: "", email: "", phone: "", city: "", country: "", status: "active" };
}

function toFormState(customer: Customer): CustomerFormState {
  return {
    name: customer.name,
    email: customer.email,
    phone: customer.phone,
    city: customer.city,
    country: customer.country,
    status: customer.status,
  };
}

export function CustomersView() {
  const { can } = usePermission();
  const [status, setStatus] = useState("all");

  const filters = useMemo(() => ({ status: status === "all" ? undefined : status }), [status]);

  const query = useListQuery<Customer>({
    fetcher: customerService.list,
    initialSortBy: "createdAt",
    filters,
  });

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Customer | null>(null);
  const [form, setForm] = useState<CustomerFormState>(createFormState());
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [viewing, setViewing] = useState<Customer | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Customer | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const openCreate = () => {
    setEditing(null);
    setForm(createFormState());
    setErrors({});
    setFormOpen(true);
  };

  const openEdit = (customer: Customer) => {
    setEditing(customer);
    setForm(toFormState(customer));
    setErrors({});
    setFormOpen(true);
  };

  const updateField = <K extends keyof CustomerFormState>(key: K, value: CustomerFormState[K]) => {
    setForm((current) => ({ ...current, [key]: value }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const nextErrors: Record<string, string> = {};

    if (form.name.trim().length < 2) nextErrors.name = "Enter at least 2 characters.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) nextErrors.email = "Enter a valid email address.";
    if (form.phone.trim().length < 5) nextErrors.phone = "Enter a valid phone number.";
    if (!form.city.trim()) nextErrors.city = "City is required.";
    if (!form.country.trim()) nextErrors.country = "Country is required.";

    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    const input: CustomerInput = {
      name: form.name.trim(),
      email: form.email.trim(),
      phone: form.phone.trim(),
      city: form.city.trim(),
      country: form.country.trim(),
      status: form.status,
    };

    setIsSubmitting(true);

    try {
      if (editing) {
        await customerService.update(editing.id, input);
        toast.success("Customer updated", { description: input.name });
      } else {
        await customerService.create(input);
        toast.success("Customer created", { description: input.name });
      }
      setFormOpen(false);
      query.refresh();
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unable to save this customer.";
      setErrors({ form: message });
      toast.error("Save failed", { description: message });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;

    setIsDeleting(true);

    try {
      await customerService.remove(deleteTarget.id);
      toast.success("Customer deleted", { description: deleteTarget.name });
      setDeleteTarget(null);
      query.refresh();
    } catch (error) {
      toast.error("Delete failed", {
        description: error instanceof Error ? error.message : "Unable to delete this customer.",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const columns: DataTableColumn<Customer>[] = [
    {
      id: "name",
      header: "Customer",
      sortable: true,
      cell: (row) => (
        <div className="flex items-center gap-2.5">
          <Avatar className="size-9">
            <AvatarImage src={row.avatar} alt={row.name} />
            <AvatarFallback>{getInitials(row.name)}</AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <p className="max-w-48 truncate font-medium">{row.name}</p>
            <p className="text-muted-foreground max-w-48 truncate text-xs">{row.email}</p>
          </div>
        </div>
      ),
    },
    {
      id: "phone",
      header: "Phone",
      cell: (row) => <span className="text-muted-foreground text-xs">{row.phone}</span>,
    },
    {
      id: "city",
      header: "Location",
      cell: (row) => (
        <div>
          <p className="text-sm">{row.city}</p>
          <p className="text-muted-foreground text-xs">{row.country}</p>
        </div>
      ),
    },
    {
      id: "ordersCount",
      header: "Orders",
      sortable: true,
      className: "text-right",
      headerClassName: "text-right",
      cell: (row) => formatNumber(row.ordersCount),
    },
    {
      id: "totalSpent",
      header: "Spent",
      sortable: true,
      className: "text-right",
      headerClassName: "text-right",
      cell: (row) => <span className="font-medium">{formatMoney(row.totalSpent, undefined, 0)}</span>,
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
            <Button variant="ghost" size="icon-sm" aria-label={`Actions for ${row.name}`}>
              <EllipsisVertical />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-40">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuItem onSelect={() => setViewing(row)}>
              <Eye />
              View details
            </DropdownMenuItem>
            {can("customer:update") ? (
              <DropdownMenuItem onSelect={() => openEdit(row)}>
                <Pencil />
                Edit
              </DropdownMenuItem>
            ) : null}
            {can("customer:delete") ? (
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
        title="Customers"
        description="Browse customer profiles, spending, and account status."
        actions={
          can("customer:create") ? (
            <Button size="sm" onClick={openCreate}>
              <Plus data-icon="inline-start" />
              New customer
            </Button>
          ) : null
        }
      />

      <ListToolbar search={query.search} onSearchChange={query.setSearch} placeholder="Search customers…">
        <Select value={status} onValueChange={setStatus}>
          <SelectTrigger size="sm" className="w-36">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="blocked">Blocked</SelectItem>
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
        emptyTitle="No customers found"
        emptyDescription="Customer profiles will appear here after their first order."
        emptyAction={
          can("customer:create") ? (
            <Button size="sm" onClick={openCreate}>
              <Plus data-icon="inline-start" />
              New customer
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
        title={editing ? "Edit customer" : "New customer"}
        description={editing ? "Update this customer profile." : "Add a customer profile manually."}
        isSubmitting={isSubmitting}
        onSubmit={handleSubmit}
      >
        {errors.form ? <p className="text-destructive text-sm">{errors.form}</p> : null}
        <div className="grid gap-3 sm:grid-cols-2">
          <FormField label="Name" htmlFor="customer-name" error={errors.name}>
            <Input
              id="customer-name"
              value={form.name}
              onChange={(event) => updateField("name", event.target.value)}
              placeholder="Olivia Martin"
            />
          </FormField>
          <FormField label="Email" htmlFor="customer-email" error={errors.email}>
            <Input
              id="customer-email"
              type="email"
              value={form.email}
              onChange={(event) => updateField("email", event.target.value)}
              placeholder="olivia@example.com"
            />
          </FormField>
          <FormField label="Phone" htmlFor="customer-phone" error={errors.phone}>
            <Input
              id="customer-phone"
              value={form.phone}
              onChange={(event) => updateField("phone", event.target.value)}
              placeholder="+1 415 555 0101"
            />
          </FormField>
          <FormField label="Status">
            <Select value={form.status} onValueChange={(value) => updateField("status", value as CustomerStatus)}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="blocked">Blocked</SelectItem>
              </SelectContent>
            </Select>
          </FormField>
          <FormField label="City" htmlFor="customer-city" error={errors.city}>
            <Input
              id="customer-city"
              value={form.city}
              onChange={(event) => updateField("city", event.target.value)}
              placeholder="San Francisco"
            />
          </FormField>
          <FormField label="Country" htmlFor="customer-country" error={errors.country}>
            <Input
              id="customer-country"
              value={form.country}
              onChange={(event) => updateField("country", event.target.value)}
              placeholder="United States"
            />
          </FormField>
        </div>
      </FormDialog>

      <DetailDialog
        open={Boolean(viewing)}
        onOpenChange={(open) => {
          if (!open) setViewing(null);
        }}
        title={viewing?.name ?? "Customer"}
        description={viewing?.email}
      >
        {viewing ? (
          <>
            <div className="grid gap-3 sm:grid-cols-2">
              <DetailRow label="Status">
                <StatusBadge status={viewing.status} />
              </DetailRow>
              <DetailRow label="Phone">{viewing.phone}</DetailRow>
              <DetailRow label="Location">
                {viewing.city}, {viewing.country}
              </DetailRow>
              <DetailRow label="Orders placed">{formatNumber(viewing.ordersCount)}</DetailRow>
              <DetailRow label="Total spent">{formatMoney(viewing.totalSpent)}</DetailRow>
              <DetailRow label="Customer since">{formatDate(viewing.createdAt)}</DetailRow>
            </div>
            <DetailRow label="Last updated">{formatDate(viewing.updatedAt)}</DetailRow>
          </>
        ) : null}
      </DetailDialog>

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null);
        }}
        title="Delete customer?"
        description={
          deleteTarget
            ? `This will permanently remove “${deleteTarget.name}” and their profile data. This action cannot be undone.`
            : undefined
        }
        confirmLabel="Delete customer"
        isPending={isDeleting}
        destructive
        onConfirm={handleDelete}
      />
    </div>
  );
}
