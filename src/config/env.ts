import { z } from "zod";

/**
 * Public environment variables.
 *
 * Only variables prefixed with `NEXT_PUBLIC_` are allowed in this schema
 * because they are bundled into the browser build.
 */
const publicEnvSchema = z.object({
  NEXT_PUBLIC_APP_NAME: z.string().trim().min(1, "NEXT_PUBLIC_APP_NAME is required.").default("Store Admin"),
  NEXT_PUBLIC_APP_URL: z.url("NEXT_PUBLIC_APP_URL must be a valid URL.").default("http://localhost:3000"),
  NEXT_PUBLIC_API_BASE_URL: z.url("NEXT_PUBLIC_API_BASE_URL must be a valid URL.").default("http://localhost:3000/api"),
  NEXT_PUBLIC_USE_MOCK_API: z
    .string()
    .default("true")
    .transform((value) => value === "true"),
  NEXT_PUBLIC_DEFAULT_LOCALE: z.string().trim().min(2).default("en-US"),
  NEXT_PUBLIC_CURRENCY: z.string().trim().min(3).max(3).default("USD"),
});

function formatIssues(error: z.ZodError) {
  return error.issues.map((issue) => `- ${issue.path.join(".") || "env"}: ${issue.message}`).join("\n");
}

function parsePublicEnv() {
  const parsed = publicEnvSchema.safeParse({
    NEXT_PUBLIC_APP_NAME: process.env.NEXT_PUBLIC_APP_NAME,
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
    NEXT_PUBLIC_API_BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL,
    NEXT_PUBLIC_USE_MOCK_API: process.env.NEXT_PUBLIC_USE_MOCK_API,
    NEXT_PUBLIC_DEFAULT_LOCALE: process.env.NEXT_PUBLIC_DEFAULT_LOCALE,
    NEXT_PUBLIC_CURRENCY: process.env.NEXT_PUBLIC_CURRENCY,
  });

  if (!parsed.success) {
    throw new Error(
      `Invalid public environment variables. Copy .env.example to .env.local.\n${formatIssues(parsed.error)}`,
    );
  }

  return parsed.data;
}

/**
 * Server-only environment variables.
 *
 * Call `getServerEnv()` from server code only (Route Handlers, Server Actions,
 * Server Components, proxy) so these values never end up in the browser bundle.
 */
const serverEnvSchema = z.object({
  AUTH_SECRET: z.string().min(16, "AUTH_SECRET must be at least 16 characters long."),
  SESSION_COOKIE_NAME: z.string().trim().min(1, "SESSION_COOKIE_NAME is required.").default("store_admin_session"),
  SESSION_MAX_AGE: z.coerce
    .number()
    .int()
    .positive()
    .default(60 * 60 * 24 * 7),
});

export type ServerEnv = z.infer<typeof serverEnvSchema>;

export function getServerEnv(): ServerEnv {
  const parsed = serverEnvSchema.safeParse({
    AUTH_SECRET: process.env.AUTH_SECRET,
    SESSION_COOKIE_NAME: process.env.SESSION_COOKIE_NAME,
    SESSION_MAX_AGE: process.env.SESSION_MAX_AGE,
  });

  if (!parsed.success) {
    throw new Error(
      `Invalid server environment variables. Copy .env.example to .env.local.\n${formatIssues(parsed.error)}`,
    );
  }

  return parsed.data;
}

export const env = parsePublicEnv();

export type PublicEnv = typeof env;
