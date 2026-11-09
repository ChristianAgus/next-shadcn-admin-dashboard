import type { ListParams, PaginatedResponse, SortDirection } from "@/types/common";

export async function mockDelay(ms = 280): Promise<void> {
  await new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

function compareValues(a: unknown, b: unknown): number {
  if (typeof a === "number" && typeof b === "number") {
    return a - b;
  }

  return String(a ?? "").localeCompare(String(b ?? ""), undefined, { numeric: true, sensitivity: "base" });
}

export function sortItems<T>(
  items: T[],
  sortBy: string | undefined,
  sortDir: SortDirection | undefined,
  selector: (item: T, key: string) => unknown,
) {
  if (!sortBy) {
    return items;
  }

  const direction = sortDir === "asc" ? 1 : -1;

  return [...items].sort((left, right) => compareValues(selector(left, sortBy), selector(right, sortBy)) * direction);
}

export function matchesSearch(search: string | undefined, values: Array<string | undefined | null>): boolean {
  if (!search?.trim()) {
    return true;
  }

  const query = search.trim().toLowerCase();
  return values.some((value) => value?.toLowerCase().includes(query));
}

export function paginate<T>(items: T[], params: ListParams = {}): PaginatedResponse<T> {
  const page = Math.max(params.page ?? 1, 1);
  const pageSize = Math.max(params.pageSize ?? 10, 1);
  const total = items.length;
  const totalPages = Math.max(Math.ceil(total / pageSize), 1);
  const start = (page - 1) * pageSize;

  return {
    data: items.slice(start, start + pageSize),
    total,
    page,
    pageSize,
    totalPages,
  };
}

export function makeId(prefix: string): string {
  return `${prefix}-${globalThis.crypto.randomUUID()}`;
}

export function nowIso(): string {
  return new Date().toISOString();
}
