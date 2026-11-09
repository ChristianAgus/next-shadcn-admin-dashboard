import { env } from "@/config/env";
import type { ApiErrorBody } from "@/types/common";

export class ApiError extends Error {
  readonly status: number;
  readonly code?: string;
  readonly details?: unknown;

  constructor(status: number, message: string, body?: ApiErrorBody) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = body?.code;
    this.details = body?.details;
  }
}

export interface ApiRequestOptions extends Omit<RequestInit, "body"> {
  /** Optional bearer token. Cookies are sent with `credentials: "include"` by default. */
  token?: string;
  /** JSON body. It is serialized automatically. */
  json?: unknown;
  body?: BodyInit | null;
}

function parseJson(text: string): unknown {
  try {
    return JSON.parse(text) as unknown;
  } catch {
    return undefined;
  }
}

function getErrorMessage(data: unknown, fallback: string) {
  if (data && typeof data === "object" && "message" in data && typeof data.message === "string") {
    return data.message;
  }

  return fallback;
}

/**
 * Thin fetch wrapper for the future backend.
 *
 * Expected conventions:
 * - JSON requests and responses.
 * - `Authorization: Bearer <token>` when a token is supplied.
 * - HTTP error bodies shaped like `{ message, code, details }`.
 */
export async function apiClient<T>(path: string, options: ApiRequestOptions = {}): Promise<T> {
  const { token, json, headers, body, ...requestInit } = options;
  const baseUrl = env.NEXT_PUBLIC_API_BASE_URL.replace(/\/$/, "");
  const url = path.startsWith("http") ? path : `${baseUrl}${path.startsWith("/") ? path : `/${path}`}`;

  const requestHeaders = new Headers(headers);
  if (json !== undefined) {
    requestHeaders.set("Content-Type", "application/json");
  }
  if (token) {
    requestHeaders.set("Authorization", `Bearer ${token}`);
  }

  let response: Response;

  try {
    response = await fetch(url, {
      ...requestInit,
      cache: requestInit.cache ?? "no-store",
      credentials: requestInit.credentials ?? "include",
      headers: requestHeaders,
      body: json !== undefined ? JSON.stringify(json) : body,
    });
  } catch (error) {
    throw new ApiError(0, error instanceof Error ? error.message : "Network request failed.");
  }

  const text = await response.text();
  const data = text ? parseJson(text) : undefined;

  if (!response.ok) {
    throw new ApiError(
      response.status,
      getErrorMessage(data, response.statusText || "Request failed."),
      data as ApiErrorBody | undefined,
    );
  }

  return data as T;
}
