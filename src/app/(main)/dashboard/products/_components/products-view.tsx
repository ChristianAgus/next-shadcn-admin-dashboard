"use client";

import type { FormEvent } from "react";
import { useEffect, useMemo, useState } from "react";

import { EllipsisVertical, Eye, Package, Pencil, Plus, Trash2 } from "lucide-react";
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
import { Textarea } from "@/components/ui/textarea";
import { useListQuery } from "@/hooks/use-list-query";
import { formatDate, formatMoney, formatNumber } from "@/lib/format";
import { categoryService } from "@/services/category.service";
import { productService } from "@/services/product.service";
import type { Category } from "@/types/category";
import type { Product, ProductInput, ProductStatus } from "@/types/product";

interface ProductFormState {
  name: string;
  sku: string;
  categoryId: string;
  price: string;
  stock: string;
  status: ProductStatus;
  image: string;
  description: string;
}

function createFormState(categoryId = ""): ProductFormState {
  return {
    name: "",
    sku: "",
    categoryId,
    price: "",
    stock: "",
    status: "active",
    image: "",
    description: "",
  };
}

function toFormState(product: Product): ProductFormState {
  return {
    name: product.name,
    sku: product.sku,
    categoryId: product.categoryId,
    price: String(product.price),
    stock: String(product.stock),
    status: product.status,
    image: product.image ?? "",
    description: product.description ?? "",
  };
}

export function ProductsView() {
  const { can } = usePermission();
  const [categories, setCategories] = useState<Category[]>([]);
  const [status, setStatus] = useState("all");
  const [categoryId, setCategoryId] = useState("all");

  const filters = useMemo(
    () => ({
      status: status === "all" ? undefined : status,
      categoryId: categoryId === "all" ? undefined : categoryId,
    }),
    [status, categoryId],
  );

  const query = useListQuery<Product>({
    fetcher: productService.list,
    initialSortBy: "createdAt",
    filters,
  });

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const [form, setForm] = useState<ProductFormState>(createFormState());
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [viewing, setViewing] = useState<Product | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Product | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    let isActive = true;

    categoryService
      .list({ pageSize: 100, sortBy: "name", sortDir: "asc" })
      .then((response) => {
        if (isActive) setCategories(response.data);
      })
      .catch(() => {
        if (isActive) setCategories([]);
      });

    return () => {
      isActive = false;
    };
  }, []);

  const openCreate = () => {
    setEditing(null);
    setForm(createFormState(categories[0]?.id ?? ""));
    setErrors({});
    setFormOpen(true);
  };

  const openEdit = (product: Product) => {
    setEditing(product);
    setForm(toFormState(product));
    setErrors({});
    setFormOpen(true);
  };

  const updateField = <K extends keyof ProductFormState>(key: K, value: ProductFormState[K]) => {
    setForm((current) => ({ ...current, [key]: value }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const nextErrors: Record<string, string> = {};
    const price = Number(form.price);
    const stock = Number(form.stock);

    if (form.name.trim().length < 2) nextErrors.name = "Enter at least 2 characters.";
    if (!form.sku.trim()) nextErrors.sku = "SKU is required.";
    if (!form.categoryId) nextErrors.categoryId = "Choose a category.";
    if (!Number.isFinite(price) || price < 0) nextErrors.price = "Enter a valid price.";
    if (!Number.isInteger(stock) || stock < 0) nextErrors.stock = "Enter a whole number of units.";

    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    const input: ProductInput = {
      name: form.name.trim(),
      sku: form.sku.trim(),
      categoryId: form.categoryId,
      price,
      stock,
      status: form.status,
      image: form.image.trim() || undefined,
      description: form.description.trim() || undefined,
    };

    setIsSubmitting(true);

    try {
      if (editing) {
        await productService.update(editing.id, input);
        toast.success("Product updated", { description: input.name });
      } else {
        await productService.create(input);
        toast.success("Product created", { description: input.name });
      }
      setFormOpen(false);
      query.refresh();
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unable to save this product.";
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
      await productService.remove(deleteTarget.id);
      toast.success("Product deleted", { description: deleteTarget.name });
      setDeleteTarget(null);
      query.refresh();
    } catch (error) {
      toast.error("Delete failed", {
        description: error instanceof Error ? error.message : "Unable to delete this product.",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const columns: DataTableColumn<Product>[] = [
    {
      id: "name",
      header: "Product",
      sortable: true,
      cell: (row) => (
        <div className="flex items-center gap-2.5">
          <Avatar className="size-9 rounded-md">
            <AvatarImage src={row.image} alt={row.name} />
            <AvatarFallback className="rounded-md">
              <Package className="size-4" />
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <p className="max-w-56 truncate font-medium">{row.name}</p>
            <p className="text-muted-foreground text-xs">{row.sku}</p>
          </div>
        </div>
      ),
    },
    {
      id: "categoryName",
      header: "Category",
      cell: (row) => <span className="text-muted-foreground">{row.categoryName}</span>,
    },
    {
      id: "price",
      header: "Price",
      sortable: true,
      className: "text-right",
      headerClassName: "text-right",
      cell: (row) => formatMoney(row.price),
    },
    {
      id: "stock",
      header: "Stock",
      sortable: true,
      className: "text-right",
      headerClassName: "text-right",
      cell: (row) => (
        <span className={row.stock <= 10 ? "font-medium text-amber-600 dark:text-amber-400" : undefined}>
          {formatNumber(row.stock)}
        </span>
      ),
    },
    {
      id: "sold",
      header: "Sold",
      sortable: true,
      className: "text-right",
      headerClassName: "text-right",
      cell: (row) => formatNumber(row.sold),
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
            {can("product:update") ? (
              <DropdownMenuItem onSelect={() => openEdit(row)}>
                <Pencil />
                Edit
              </DropdownMenuItem>
            ) : null}
            {can("product:delete") ? (
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
        title="Products"
        description="Manage product details, pricing, stock, and availability."
        actions={
          can("product:create") ? (
            <Button size="sm" onClick={openCreate}>
              <Plus data-icon="inline-start" />
              New product
            </Button>
          ) : null
        }
      />

      <ListToolbar search={query.search} onSearchChange={query.setSearch} placeholder="Search products or SKUs…">
        <Select value={categoryId} onValueChange={setCategoryId}>
          <SelectTrigger size="sm" className="w-40">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All categories</SelectItem>
            {categories.map((category) => (
              <SelectItem key={category.id} value={category.id}>
                {category.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={status} onValueChange={setStatus}>
          <SelectTrigger size="sm" className="w-36">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="draft">Draft</SelectItem>
            <SelectItem value="archived">Archived</SelectItem>
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
        emptyTitle="No products found"
        emptyDescription="Create your first product or adjust the filters to see more results."
        emptyAction={
          can("product:create") ? (
            <Button size="sm" onClick={openCreate}>
              <Plus data-icon="inline-start" />
              New product
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
        title={editing ? "Edit product" : "New product"}
        description={editing ? "Update the product details and availability." : "Add a new item to your catalog."}
        isSubmitting={isSubmitting}
        size="lg"
        onSubmit={handleSubmit}
      >
        {errors.form ? <p className="text-destructive text-sm">{errors.form}</p> : null}
        <div className="grid gap-3 sm:grid-cols-2">
          <FormField label="Name" htmlFor="product-name" error={errors.name}>
            <Input
              id="product-name"
              value={form.name}
              onChange={(event) => updateField("name", event.target.value)}
              placeholder="Relaxed Linen Shirt"
            />
          </FormField>
          <FormField label="SKU" htmlFor="product-sku" error={errors.sku}>
            <Input
              id="product-sku"
              value={form.sku}
              onChange={(event) => updateField("sku", event.target.value)}
              placeholder="CL-SHT-102"
            />
          </FormField>
          <FormField label="Category" error={errors.categoryId}>
            <Select value={form.categoryId} onValueChange={(value) => updateField("categoryId", value)}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FormField>
          <FormField label="Status">
            <Select value={form.status} onValueChange={(value) => updateField("status", value as ProductStatus)}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="archived">Archived</SelectItem>
              </SelectContent>
            </Select>
          </FormField>
          <FormField label="Price" htmlFor="product-price" error={errors.price}>
            <Input
              id="product-price"
              type="number"
              min="0"
              step="0.01"
              value={form.price}
              onChange={(event) => updateField("price", event.target.value)}
              placeholder="0.00"
            />
          </FormField>
          <FormField label="Stock" htmlFor="product-stock" error={errors.stock}>
            <Input
              id="product-stock"
              type="number"
              min="0"
              step="1"
              value={form.stock}
              onChange={(event) => updateField("stock", event.target.value)}
              placeholder="0"
            />
          </FormField>
        </div>
        <FormField label="Image URL" htmlFor="product-image" hint="Optional. Use a square image for best results.">
          <Input
            id="product-image"
            value={form.image}
            onChange={(event) => updateField("image", event.target.value)}
            placeholder="https://…"
          />
        </FormField>
        <FormField label="Description" htmlFor="product-description">
          <Textarea
            id="product-description"
            value={form.description}
            onChange={(event) => updateField("description", event.target.value)}
            placeholder="Short product description."
            rows={3}
          />
        </FormField>
      </FormDialog>

      <DetailDialog
        open={Boolean(viewing)}
        onOpenChange={(open) => {
          if (!open) setViewing(null);
        }}
        title={viewing?.name ?? "Product"}
        description={viewing?.sku}
      >
        {viewing ? (
          <>
            <div className="grid gap-3 sm:grid-cols-2">
              <DetailRow label="Status">
                <StatusBadge status={viewing.status} />
              </DetailRow>
              <DetailRow label="Category">{viewing.categoryName}</DetailRow>
              <DetailRow label="Price">{formatMoney(viewing.price)}</DetailRow>
              <DetailRow label="Stock">{formatNumber(viewing.stock)} units</DetailRow>
              <DetailRow label="Units sold">{formatNumber(viewing.sold)}</DetailRow>
              <DetailRow label="Last updated">{formatDate(viewing.updatedAt)}</DetailRow>
            </div>
            {viewing.description ? <DetailRow label="Description">{viewing.description}</DetailRow> : null}
          </>
        ) : null}
      </DetailDialog>

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null);
        }}
        title="Delete product?"
        description={
          deleteTarget
            ? `This will permanently remove “${deleteTarget.name}” from the catalog. This action cannot be undone.`
            : undefined
        }
        confirmLabel="Delete product"
        isPending={isDeleting}
        destructive
        onConfirm={handleDelete}
      />
    </div>
  );
}
