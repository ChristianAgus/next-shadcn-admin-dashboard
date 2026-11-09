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
import { formatDate, formatDateTime } from "@/lib/format";
import { getInitials } from "@/lib/utils";
import { roleService } from "@/services/role.service";
import { userService } from "@/services/user.service";
import type { Role } from "@/types/role";
import type { AdminUser, AdminUserInput, AdminUserStatus } from "@/types/user";

interface UserFormState {
  name: string;
  email: string;
  roleId: string;
  status: AdminUserStatus;
  avatar: string;
}

function createFormState(roleId = ""): UserFormState {
  return { name: "", email: "", roleId, status: "invited", avatar: "" };
}

function toFormState(user: AdminUser): UserFormState {
  return {
    name: user.name,
    email: user.email,
    roleId: user.roleId,
    status: user.status,
    avatar: user.avatar ?? "",
  };
}

export function UsersView() {
  const { can } = usePermission();
  const [status, setStatus] = useState("all");
  const [roleId, setRoleId] = useState("all");
  const [roles, setRoles] = useState<Role[]>([]);

  const filters = useMemo(
    () => ({
      status: status === "all" ? undefined : status,
      roleId: roleId === "all" ? undefined : roleId,
    }),
    [status, roleId],
  );

  const query = useListQuery<AdminUser>({
    fetcher: userService.list,
    initialSortBy: "name",
    initialSortDir: "asc",
    filters,
  });

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<AdminUser | null>(null);
  const [form, setForm] = useState<UserFormState>(createFormState());
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [viewing, setViewing] = useState<AdminUser | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<AdminUser | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    let isActive = true;

    roleService
      .list({ pageSize: 100, sortBy: "name", sortDir: "asc" })
      .then((response) => {
        if (isActive) setRoles(response.data);
      })
      .catch(() => {
        if (isActive) setRoles([]);
      });

    return () => {
      isActive = false;
    };
  }, []);

  const openCreate = () => {
    setEditing(null);
    setForm(createFormState(roles[0]?.id ?? ""));
    setErrors({});
    setFormOpen(true);
  };

  const openEdit = (user: AdminUser) => {
    setEditing(user);
    setForm(toFormState(user));
    setErrors({});
    setFormOpen(true);
  };

  const updateField = <K extends keyof UserFormState>(key: K, value: UserFormState[K]) => {
    setForm((current) => ({ ...current, [key]: value }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const nextErrors: Record<string, string> = {};

    if (form.name.trim().length < 2) nextErrors.name = "Enter at least 2 characters.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) nextErrors.email = "Enter a valid email address.";
    if (!form.roleId) nextErrors.roleId = "Choose a role.";

    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    const input: AdminUserInput = {
      name: form.name.trim(),
      email: form.email.trim(),
      roleId: form.roleId,
      status: form.status,
      avatar: form.avatar.trim() || undefined,
    };

    setIsSubmitting(true);

    try {
      if (editing) {
        await userService.update(editing.id, input);
        toast.success("User updated", { description: input.email });
      } else {
        await userService.create(input);
        toast.success("User invited", { description: input.email });
      }
      setFormOpen(false);
      query.refresh();
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unable to save this user.";
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
      await userService.remove(deleteTarget.id);
      toast.success("User deleted", { description: deleteTarget.name });
      setDeleteTarget(null);
      query.refresh();
    } catch (error) {
      toast.error("Delete failed", {
        description: error instanceof Error ? error.message : "Unable to delete this user.",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const columns: DataTableColumn<AdminUser>[] = [
    {
      id: "name",
      header: "User",
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
      id: "roleName",
      header: "Role",
      sortable: true,
      cell: (row) => <span className="text-muted-foreground">{row.roleName}</span>,
    },
    {
      id: "status",
      header: "Status",
      cell: (row) => <StatusBadge status={row.status} />,
    },
    {
      id: "lastLoginAt",
      header: "Last login",
      sortable: true,
      cell: (row) => (
        <span className="text-muted-foreground text-xs">
          {row.lastLoginAt ? formatDateTime(row.lastLoginAt) : "Never"}
        </span>
      ),
    },
    {
      id: "createdAt",
      header: "Joined",
      cell: (row) => <span className="text-muted-foreground text-xs">{formatDate(row.createdAt)}</span>,
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
            {can("user:update") ? (
              <DropdownMenuItem onSelect={() => openEdit(row)}>
                <Pencil />
                Edit
              </DropdownMenuItem>
            ) : null}
            {can("user:delete") ? (
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
        title="Users"
        description="Invite administrators, assign roles, and control account access."
        actions={
          can("user:create") ? (
            <Button size="sm" onClick={openCreate}>
              <Plus data-icon="inline-start" />
              New user
            </Button>
          ) : null
        }
      />

      <ListToolbar search={query.search} onSearchChange={query.setSearch} placeholder="Search users by name or email…">
        <Select value={roleId} onValueChange={setRoleId}>
          <SelectTrigger size="sm" className="w-40">
            <SelectValue placeholder="Role" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All roles</SelectItem>
            {roles.map((role) => (
              <SelectItem key={role.id} value={role.id}>
                {role.name}
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
            <SelectItem value="invited">Invited</SelectItem>
            <SelectItem value="suspended">Suspended</SelectItem>
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
        emptyTitle="No users found"
        emptyDescription="Invite a teammate or adjust the filters to see more results."
        emptyAction={
          can("user:create") ? (
            <Button size="sm" onClick={openCreate}>
              <Plus data-icon="inline-start" />
              New user
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
        title={editing ? "Edit user" : "Invite user"}
        description={editing ? "Update this administrator's role and status." : "Add a new administrator account."}
        isSubmitting={isSubmitting}
        onSubmit={handleSubmit}
      >
        {errors.form ? <p className="text-destructive text-sm">{errors.form}</p> : null}
        <div className="grid gap-3 sm:grid-cols-2">
          <FormField label="Name" htmlFor="user-name" error={errors.name}>
            <Input
              id="user-name"
              value={form.name}
              onChange={(event) => updateField("name", event.target.value)}
              placeholder="Alex Morgan"
            />
          </FormField>
          <FormField label="Email" htmlFor="user-email" error={errors.email}>
            <Input
              id="user-email"
              type="email"
              value={form.email}
              onChange={(event) => updateField("email", event.target.value)}
              placeholder="alex@example.com"
            />
          </FormField>
          <FormField label="Role" error={errors.roleId}>
            <Select value={form.roleId} onValueChange={(value) => updateField("roleId", value)}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select role" />
              </SelectTrigger>
              <SelectContent>
                {roles.map((role) => (
                  <SelectItem key={role.id} value={role.id}>
                    {role.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FormField>
          <FormField label="Status">
            <Select value={form.status} onValueChange={(value) => updateField("status", value as AdminUserStatus)}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="invited">Invited</SelectItem>
                <SelectItem value="suspended">Suspended</SelectItem>
              </SelectContent>
            </Select>
          </FormField>
        </div>
        <FormField label="Avatar URL" htmlFor="user-avatar" hint="Optional. Leave empty to use initials.">
          <Input
            id="user-avatar"
            value={form.avatar}
            onChange={(event) => updateField("avatar", event.target.value)}
            placeholder="https://…"
          />
        </FormField>
      </FormDialog>

      <DetailDialog
        open={Boolean(viewing)}
        onOpenChange={(open) => {
          if (!open) setViewing(null);
        }}
        title={viewing?.name ?? "User"}
        description={viewing?.email}
      >
        {viewing ? (
          <div className="grid gap-3 sm:grid-cols-2">
            <DetailRow label="Role">{viewing.roleName}</DetailRow>
            <DetailRow label="Status">
              <StatusBadge status={viewing.status} />
            </DetailRow>
            <DetailRow label="Joined">{formatDate(viewing.createdAt)}</DetailRow>
            <DetailRow label="Last login">
              {viewing.lastLoginAt ? formatDateTime(viewing.lastLoginAt) : "Never"}
            </DetailRow>
            <DetailRow label="Last updated">{formatDate(viewing.updatedAt)}</DetailRow>
          </div>
        ) : null}
      </DetailDialog>

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null);
        }}
        title="Delete user?"
        description={
          deleteTarget
            ? `This will revoke access for “${deleteTarget.name}”. The last Super Admin cannot be removed.`
            : undefined
        }
        confirmLabel="Delete user"
        isPending={isDeleting}
        destructive
        onConfirm={handleDelete}
      />
    </div>
  );
}
