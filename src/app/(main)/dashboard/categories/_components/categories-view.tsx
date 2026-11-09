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
import { formatDate, formatNumber } from "@/lib/format";
import { categoryService } from "@/services/category.service";
import type { Category, CategoryInput, CategoryStatus } from "@/types/category";

interface CategoryFormState {
  name: string;
  slug: string;
  description: string;
  status: CategoryStatus;
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function createFormState(): CategoryFormState {
  return { name: "", slug: "", description: "", status: "active" };
}

function toFormState(category: Category): CategoryFormState {
  return {
    name: category.name,
    slug: category.slug,
    description: category.description ?? "",
    status: category.status,
  };
}

export function CategoriesView() {
  const { can } = usePermission();
  const [status, setStatus] = useState("all");

  const filters = useMemo(() => ({ status: status === "all" ? undefined : status }), [status]);

  const query = useListQuery<Category>({
    fetcher: categoryService.list,
    initialSortBy: "name",
    initialSortDir: "asc",
    filters,
  });

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Category | null>(null);
  const [form, setForm] = useState<CategoryFormState>(createFormState());
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [viewing, setViewing] = useState<Category | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Category | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const openCreate = () => {
    setEditing(null);
    setForm(createFormState());
    setErrors({});
    setFormOpen(true);
  };

  const openEdit = (category: Category) => {
    setEditing(category);
    setForm(toFormState(category));
    setErrors({});
    setFormOpen(true);
  };

  const updateField = <K extends keyof CategoryFormState>(key: K, value: CategoryFormState[K]) => {
    setForm((current) => ({ ...current, [key]: value }));
  };

  const handleNameChange = (value: string) => {
    setForm((current) => {
      const shouldSyncSlug = !editing && (current.slug === "" || current.slug === slugify(current.name));

      return {
        ...current,
        name: value,
        slug: shouldSyncSlug ? slugify(value) : current.slug,
      };
    });
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const nextErrors: Record<string, string> = {};

    if (form.name.trim().length < 2) nextErrors.name = "Enter at least 2 characters.";
    if (!form.slug.trim()) {
      nextErrors.slug = "Slug is required.";
    } else if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(form.slug.trim())) {
      nextErrors.slug = "Use lowercase letters, numbers, and hyphens only.";
    }

    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    const input: CategoryInput = {
      name: form.name.trim(),
      slug: form.slug.trim(),
      description: form.description.trim() || undefined,
      status: form.status,
    };

    setIsSubmitting(true);

    try {
      if (editing) {
        await categoryService.update(editing.id, input);
        toast.success("Category updated", { description: input.name });
      } else {
        await categoryService.create(input);
        toast.success("Category created", { description: input.name });
      }
      setFormOpen(false);
      query.refresh();
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unable to save this category.";
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
      await categoryService.remove(deleteTarget.id);
      toast.success("Category deleted", { description: deleteTarget.name });
      setDeleteTarget(null);
      query.refresh();
    } catch (error) {
      toast.error("Delete failed", {
        description: error instanceof Error ? error.message : "Unable to delete this category.",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const columns: DataTableColumn<Category>[] = [
    {
      id: "name",
      header: "Category",
      sortable: true,
      cell: (row) => (
        <div className="min-w-0">
          <p className="max-w-56 truncate font-medium">{row.name}</p>
          <p className="text-muted-foreground text-xs">/{row.slug}</p>
        </div>
      ),
    },
    {
      id: "description",
      header: "Description",
      cell: (row) => (
        <span className="text-muted-foreground line-clamp-1 max-w-80 text-sm">{row.description ?? "—"}</span>
      ),
    },
    {
      id: "productCount",
      header: "Products",
      sortable: true,
      className: "text-right",
      headerClassName: "text-right",
      cell: (row) => formatNumber(row.productCount),
    },
    {
      id: "status",
      header: "Status",
      cell: (row) => <StatusBadge status={row.status} />,
    },
    {
      id: "updatedAt",
      header: "Updated",
      cell: (row) => <span className="text-muted-foreground text-xs">{formatDate(row.updatedAt)}</span>,
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
            {can("category:update") ? (
              <DropdownMenuItem onSelect={() => openEdit(row)}>
                <Pencil />
                Edit
              </DropdownMenuItem>
            ) : null}
            {can("category:delete") ? (
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
        title="Categories"
        description="Group products into shoppable catalog categories."
        actions={
          can("category:create") ? (
            <Button size="sm" onClick={openCreate}>
              <Plus data-icon="inline-start" />
              New category
            </Button>
          ) : null
        }
      />

      <ListToolbar search={query.search} onSearchChange={query.setSearch} placeholder="Search categories…">
        <Select value={status} onValueChange={setStatus}>
          <SelectTrigger size="sm" className="w-36">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
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
        emptyTitle="No categories found"
        emptyDescription="Create a category to start organizing your catalog."
        emptyAction={
          can("category:create") ? (
            <Button size="sm" onClick={openCreate}>
              <Plus data-icon="inline-start" />
              New category
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
        title={editing ? "Edit category" : "New category"}
        description={editing ? "Update how this category appears in your catalog." : "Create a new catalog category."}
        isSubmitting={isSubmitting}
        onSubmit={handleSubmit}
      >
        {errors.form ? <p className="text-destructive text-sm">{errors.form}</p> : null}
        <FormField label="Name" htmlFor="category-name" error={errors.name}>
          <Input
            id="category-name"
            value={form.name}
            onChange={(event) => handleNameChange(event.target.value)}
            placeholder="Home & Living"
          />
        </FormField>
        <FormField label="Slug" htmlFor="category-slug" error={errors.slug} hint="Used in storefront URLs.">
          <Input
            id="category-slug"
            value={form.slug}
            onChange={(event) => updateField("slug", event.target.value)}
            placeholder="home-living"
          />
        </FormField>
        <FormField label="Description" htmlFor="category-description">
          <Textarea
            id="category-description"
            value={form.description}
            onChange={(event) => updateField("description", event.target.value)}
            placeholder="Short description of the category."
            rows={3}
          />
        </FormField>
        <FormField label="Status">
          <Select value={form.status} onValueChange={(value) => updateField("status", value as CategoryStatus)}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
            </SelectContent>
          </Select>
        </FormField>
      </FormDialog>

      <DetailDialog
        open={Boolean(viewing)}
        onOpenChange={(open) => {
          if (!open) setViewing(null);
        }}
        title={viewing?.name ?? "Category"}
        description={viewing ? `/${viewing.slug}` : undefined}
      >
        {viewing ? (
          <>
            <div className="grid gap-3 sm:grid-cols-2">
              <DetailRow label="Status">
                <StatusBadge status={viewing.status} />
              </DetailRow>
              <DetailRow label="Products">{formatNumber(viewing.productCount)}</DetailRow>
              <DetailRow label="Created">{formatDate(viewing.createdAt)}</DetailRow>
              <DetailRow label="Updated">{formatDate(viewing.updatedAt)}</DetailRow>
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
        title="Delete category?"
        description={
          deleteTarget
            ? `This will permanently remove “${deleteTarget.name}”. Categories with products cannot be deleted.`
            : undefined
        }
        confirmLabel="Delete category"
        isPending={isDeleting}
        destructive
        onConfirm={handleDelete}
      />
    </div>
  );
}
