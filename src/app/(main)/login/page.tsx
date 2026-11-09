import { createMetadata } from "@/lib/metadata";

import { LoginForm } from "./_components/login-form";

export const metadata = createMetadata({
  title: "Sign in",
  description: "Sign in to the e-commerce admin dashboard.",
  path: "/login",
  noIndex: true,
});

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ from?: string }> }) {
  const { from } = await searchParams;

  return <LoginForm redirectTo={from} />;
}
