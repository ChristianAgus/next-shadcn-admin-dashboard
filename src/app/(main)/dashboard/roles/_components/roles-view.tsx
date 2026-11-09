"use client";

import type { FormEvent } from "react";
import { useEffect, useMemo, useState } from "react";

import { cn } from "cn";
import { Check, EllipsisVertical, Eye, Lock, Pencil, Plus, ShieldCheck, Trash2, Users, X } from "lucide-react";
import { toast } from "sonner";

import { usePermission } from "@/components/auth/auth-provider";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { DetailDialog } from "@/components/detail-dialog";
import { FormDialog } from "@/components/form-dialog";
import { FormField } from "@/components/form-field";
import { PageHeader } from "@/components/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { PERMISSION_GROUPS, PERMISSIONS, type Permission } from "@/config/roles.config";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import { formatDate, formatNumber } from "@/lib/format";
import { roleService } from "@/services/role.service";
import type { Role, RoleInput } from "@/types/role";

interface RoleFormState {
  name: string;
  description: string;
  permissions: Permission[];
}

function createFormState(): RoleFormState {
  return { name: "", description: "", permissions: [] };
}

function toFormState(role: Role): RoleFormState {
  return { name: role.name, description: role.description, permissions: [...role.permissions] };
}

function RolePermissions({
  role,
  editable = false,
  form,
  onToggle,
}: {
  role: Role;
  editable?: boolean;
  form?: RoleFormState;
  onToggle?: (permission: Permission, checked: boolean) => void;
}) {
  const selected = new Set(editable && form ? form.permissions : role.permissions);

  return (
    <div className="space-y-4">
      {PERMISSION_GROUPS.map((group) => {
        const groupPermissions = PERMISSIONS.filter((permission) => permission.group === group);
        const grantedInGroup = groupPermissions.filter((permission) => selected.has(permission.id)).length;

        return (
          <div key={group} className="space-y-2">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-medium">{group}</h4>
              <span className="text-muted-foreground text-xs tabular-nums">
                {grantedInGroup}/{groupPermissions.length}
              </span>
            </div>
            <div className="grid gap-1.5 sm:grid-cols-2">
              {groupPermissions.map((permission) => {
                const granted = selected.has(permission.id);

                if (editable && form && onToggle) {
                  return (
                    <label
                      key={permission.id}
                      htmlFor={`permission-${permission.id}`}
                      className={cn(
                        "flex cursor-pointer items-center gap-2 rounded-md border px-2 py-1.5 text-sm transition-colors",
                        granted ? "border-primary/30 bg-primary/5" : "hover:bg-muted/50",
                      )}
                    >
                      <Checkbox
                        id={`permission-${permission.id}`}
                        checked={granted}
                        onCheckedChange={(checked) => onToggle(permission.id, Boolean(checked))}
                      />
                      <span className="flex-1">{permission.label}</span>
                      <code className="text-muted-foreground text-[10px]">{permission.id}</code>
                    </label>
                  );
                }

                return (
                  <div
                    key={permission.id}
                    className={cn(
                      "flex items-center gap-2 rounded-md border px-2 py-1.5 text-sm",
                      granted ? "border-primary/20 bg-primary/5" : "text-muted-foreground",
                    )}
                  >
                    {granted ? (
                      <Check className="size-3.5 text-emerald-600 dark:text-emerald-400" />
                    ) : (
                      <X className="size-3.5 opacity-60" />
                    )}
                    <span className="flex-1">{permission.label}</span>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}

export function RolesView() {
  const { can } = usePermission();
  const [roles, setRoles] = useState<Role[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);
  const debouncedSearch = useDebouncedValue(search, 250);

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Role | null>(null);
  const [form, setForm] = useState<RoleFormState>(createFormState());
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [viewing, setViewing] = useState<Role | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Role | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // biome-ignore lint/correctness/useExhaustiveDependencies: refreshKey forces a refetch after mutations.
  useEffect(() => {
    let isActive = true;

    setIsLoading(true);
    setError(null);

    roleService
      .list({ pageSize: 100, sortBy: "name", sortDir: "asc" })
      .then((response) => {
        if (isActive) setRoles(response.data);
      })
      .catch((caught: unknown) => {
        if (isActive) {
          setError(caught instanceof Error ? caught.message : "Unable to load roles.");
        }
      })
      .finally(() => {
        if (isActive) setIsLoading(false);
      });

    return () => {
      isActive = false;
    };
  }, [refreshKey]);

  const filteredRoles = useMemo(() => {
    const query = debouncedSearch.trim().toLowerCase();

    if (!query) return roles;

    return roles.filter(
      (role) => role.name.toLowerCase().includes(query) || role.description.toLowerCase().includes(query),
    );
  }, [roles, debouncedSearch]);

  const refresh = () => setRefreshKey((key) => key + 1);

  const openCreate = () => {
    setEditing(null);
    setForm(createFormState());
    setErrors({});
    setFormOpen(true);
  };

  const openEdit = (role: Role) => {
    setEditing(role);
    setForm(toFormState(role));
    setErrors({});
    setFormOpen(true);
  };

  const togglePermission = (permission: Permission, checked: boolean) => {
    setForm((current) => ({
      ...current,
      permissions: checked
        ? [...current.permissions, permission]
        : current.permissions.filter((item) => item !== permission),
    }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const nextErrors: Record<string, string> = {};

    if (form.name.trim().length < 2) nextErrors.name = "Enter at least 2 characters.";
    if (form.description.trim().length < 8) nextErrors.description = "Add a short description.";
    if (form.permissions.length === 0) nextErrors.permissions = "Select at least one permission.";

    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    const input: RoleInput = {
      name: form.name.trim(),
      description: form.description.trim(),
      permissions: form.permissions,
    };

    setIsSubmitting(true);

    try {
      if (editing) {
        await roleService.update(editing.id, input);
        toast.success("Role updated", { description: input.name });
      } else {
        await roleService.create(input);
        toast.success("Role created", { description: input.name });
      }
      setFormOpen(false);
      refresh();
    } catch (caught) {
      const message = caught instanceof Error ? caught.message : "Unable to save this role.";
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
      await roleService.remove(deleteTarget.id);
      toast.success("Role deleted", { description: deleteTarget.name });
      setDeleteTarget(null);
      refresh();
    } catch (caught) {
      toast.error("Delete failed", {
        description: caught instanceof Error ? caught.message : "Unable to delete this role.",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-4">
      <PageHeader
        title="Roles & permissions"
        description="Review built-in roles and tune the permission matrix that drives menus and route guards."
        actions={
          can("role:create") ? (
            <Button size="sm" onClick={openCreate}>
              <Plus data-icon="inline-start" />
              New role
            </Button>
          ) : null
        }
      />

      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:max-w-xs">
          <Input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search roles…"
            aria-label="Search roles"
          />
        </div>
        <p className="text-muted-foreground text-sm">
          {formatNumber(filteredRoles.length)} of {formatNumber(roles.length)} roles
        </p>
      </div>

      {error ? (
        <Card>
          <CardContent className="flex flex-col items-start gap-2 py-6">
            <p className="text-destructive text-sm">{error}</p>
            <Button size="sm" variant="outline" onClick={refresh}>
              Try again
            </Button>
          </CardContent>
        </Card>
      ) : null}

      {isLoading ? (
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <Card key={`role-skeleton-${String(index)}`} size="sm">
              <CardHeader>
                <Skeleton className="h-5 w-32" />
                <Skeleton className="h-4 w-full" />
              </CardHeader>
              <CardContent className="space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-40" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {filteredRoles.map((role) => (
            <Card key={role.id} size="sm" className="flex flex-col">
              <CardHeader className="flex flex-row items-start justify-between gap-2">
                <div className="min-w-0 space-y-1">
                  <CardTitle className="flex items-center gap-2">
                    <ShieldCheck className="text-muted-foreground size-4" />
                    <span className="truncate">{role.name}</span>
                  </CardTitle>
                  <CardDescription className="line-clamp-2">{role.description}</CardDescription>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon-sm" aria-label={`Actions for ${role.name}`}>
                      <EllipsisVertical />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-44">
                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                    <DropdownMenuItem onSelect={() => setViewing(role)}>
                      <Eye />
                      View permissions
                    </DropdownMenuItem>
                    {can("role:update") ? (
                      <DropdownMenuItem onSelect={() => openEdit(role)}>
                        <Pencil />
                        Edit role
                      </DropdownMenuItem>
                    ) : null}
                    {can("role:delete") && !role.isSystem ? (
                      <>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem variant="destructive" onSelect={() => setDeleteTarget(role)}>
                          <Trash2 />
                          Delete
                        </DropdownMenuItem>
                      </>
                    ) : null}
                  </DropdownMenuContent>
                </DropdownMenu>
              </CardHeader>
              <CardContent className="mt-auto space-y-3">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="outline" className="gap-1">
                    <Users className="size-3" />
                    {formatNumber(role.userCount)} users
                  </Badge>
                  <Badge variant="outline" className="gap-1">
                    {formatNumber(role.permissions.length)} permissions
                  </Badge>
                  {role.isSystem ? (
                    <Badge variant="secondary" className="gap-1">
                      <Lock className="size-3" />
                      System
                    </Badge>
                  ) : null}
                </div>
                <p className="text-muted-foreground text-xs">Updated {formatDate(role.updatedAt)}</p>
                <Button variant="outline" size="sm" className="w-full" onClick={() => setViewing(role)}>
                  <Eye data-icon="inline-start" />
                  View permission matrix
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {!isLoading && filteredRoles.length === 0 ? (
        <Card>
          <CardContent className="py-10 text-center">
            <p className="font-medium">No roles found</p>
            <p className="text-muted-foreground mt-1 text-sm">Try a different search term.</p>
          </CardContent>
        </Card>
      ) : null}

      <FormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        title={editing ? "Edit role" : "New role"}
        description="Choose the permissions this role should grant. Changes apply to new sign-ins."
        isSubmitting={isSubmitting}
        size="xl"
        onSubmit={handleSubmit}
      >
        {errors.form ? <p className="text-destructive text-sm">{errors.form}</p> : null}
        <div className="grid gap-3 sm:grid-cols-2">
          <FormField label="Name" htmlFor="role-name" error={errors.name}>
            <Input
              id="role-name"
              value={form.name}
              onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
              placeholder="Catalog Editor"
            />
          </FormField>
          <FormField label="Description" htmlFor="role-description" error={errors.description}>
            <Textarea
              id="role-description"
              value={form.description}
              onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))}
              placeholder="What can this role do?"
              rows={2}
            />
          </FormField>
        </div>
        {errors.permissions ? <p className="text-destructive text-sm">{errors.permissions}</p> : null}
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Permissions</span>
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              size="xs"
              onClick={() =>
                setForm((current) => ({
                  ...current,
                  permissions: PERMISSIONS.map((permission) => permission.id),
                }))
              }
            >
              Select all
            </Button>
            <Button
              type="button"
              variant="outline"
              size="xs"
              onClick={() => setForm((current) => ({ ...current, permissions: [] }))}
            >
              Clear
            </Button>
          </div>
        </div>
        <RolePermissions
          role={editing ?? { ...emptyRole, permissions: form.permissions }}
          editable
          form={form}
          onToggle={togglePermission}
        />
      </FormDialog>

      <DetailDialog
        open={Boolean(viewing)}
        onOpenChange={(open) => {
          if (!open) setViewing(null);
        }}
        title={viewing?.name ?? "Role"}
        description={viewing?.description}
        className="sm:max-w-2xl"
      >
        {viewing ? (
          <div className="max-h-[60vh] space-y-4 overflow-y-auto pr-1">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="outline">{formatNumber(viewing.permissions.length)} permissions</Badge>
              <Badge variant="outline">{formatNumber(viewing.userCount)} users</Badge>
              {viewing.isSystem ? <Badge variant="secondary">System role</Badge> : null}
            </div>
            <RolePermissions role={viewing} />
          </div>
        ) : null}
      </DetailDialog>

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null);
        }}
        title="Delete role?"
        description={
          deleteTarget
            ? `This will permanently remove the “${deleteTarget.name}” role. System roles cannot be deleted.`
            : undefined
        }
        confirmLabel="Delete role"
        isPending={isDeleting}
        destructive
        onConfirm={handleDelete}
      />
    </div>
  );
}

const emptyRole: Role = {
  id: "",
  name: "",
  description: "",
  permissions: [],
  isSystem: false,
  userCount: 0,
  createdAt: "",
  updatedAt: "",
};
