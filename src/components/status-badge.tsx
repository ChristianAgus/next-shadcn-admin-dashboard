import { cn } from "cn";

import { Badge } from "@/components/ui/badge";

type StatusTone = "success" | "warning" | "info" | "neutral" | "danger";

const toneClasses: Record<StatusTone, string> = {
  success:
    "border-emerald-600/20 bg-emerald-500/10 text-emerald-700 dark:border-emerald-400/25 dark:bg-emerald-400/10 dark:text-emerald-300",
  warning:
    "border-amber-600/20 bg-amber-500/10 text-amber-700 dark:border-amber-400/25 dark:bg-amber-400/10 dark:text-amber-300",
  info: "border-blue-600/20 bg-blue-500/10 text-blue-700 dark:border-blue-400/25 dark:bg-blue-400/10 dark:text-blue-300",
  neutral:
    "border-zinc-500/20 bg-zinc-500/10 text-zinc-600 dark:border-zinc-400/25 dark:bg-zinc-400/10 dark:text-zinc-300",
  danger: "border-red-600/20 bg-red-500/10 text-red-700 dark:border-red-400/25 dark:bg-red-400/10 dark:text-red-300",
};

const statusTones: Record<string, StatusTone> = {
  active: "success",
  completed: "success",
  paid: "success",
  pending: "warning",
  invited: "warning",
  shipped: "info",
  draft: "neutral",
  inactive: "neutral",
  archived: "neutral",
  cancelled: "danger",
  blocked: "danger",
  suspended: "danger",
};

function humanizeStatus(status: string) {
  return status.replace(/[_-]+/g, " ").replace(/\b\w/g, (character) => character.toUpperCase());
}

export function StatusBadge({ status, className }: { status: string; className?: string }) {
  const tone = statusTones[status.toLowerCase()] ?? "neutral";

  return (
    <Badge variant="outline" className={cn(toneClasses[tone], className)}>
      {humanizeStatus(status)}
    </Badge>
  );
}
