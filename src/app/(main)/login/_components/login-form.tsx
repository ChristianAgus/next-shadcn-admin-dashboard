"use client";

import { useState } from "react";

import { useRouter } from "next/navigation";

import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";

import { AppLogo } from "@/components/app-logo";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Field, FieldContent, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { APP_CONFIG } from "@/config/app.config";
import { DEMO_ACCOUNTS } from "@/config/demo.config";
import { type LoginValues, loginSchema } from "@/lib/validation/auth";
import { loginAction } from "@/server/auth-actions";

const productHighlights = [
  "Mock data for products, orders, customers, users, and roles",
  "Role-based menus with route-level permission guards",
  "One config file for branding, navigation, and metadata",
];

export function LoginForm({ redirectTo }: { redirectTo?: string }) {
  const router = useRouter();
  const [serverError, setServerError] = useState<string>();
  const form = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
      remember: false,
    },
  });

  const onSubmit = form.handleSubmit(async (values) => {
    setServerError(undefined);

    const result = await loginAction({ ...values, redirectTo });

    if (!result.ok) {
      setServerError(result.error);
      toast.error("Sign in failed", { description: result.error });
      return;
    }

    toast.success("Welcome back!");
    router.replace(result.redirectTo);
    router.refresh();
  });

  const fillDemoAccount = (email: string, password: string) => {
    form.setValue("email", email, { shouldValidate: true });
    form.setValue("password", password, { shouldValidate: true });
    setServerError(undefined);
  };

  return (
    <div className="grid min-h-dvh lg:grid-cols-[1.05fr_1fr]">
      <div className="bg-primary text-primary-foreground relative hidden flex-col justify-between overflow-hidden p-10 lg:flex">
        <div className="absolute -top-28 -right-28 size-96 rounded-full bg-white/10 blur-3xl" />
        <div className="absolute -bottom-40 -left-20 size-96 rounded-full bg-white/10 blur-3xl" />

        <div className="relative flex items-center gap-3">
          <span className="grid size-10 place-items-center rounded-xl bg-white/15">
            <AppLogo className="size-6" />
          </span>
          <span className="text-lg font-semibold">{APP_CONFIG.name}</span>
        </div>

        <div className="relative max-w-lg space-y-6">
          <h1 className="text-4xl leading-tight font-semibold tracking-tight">
            Run your store from one focused workspace.
          </h1>
          <p className="text-primary-foreground/75 text-base leading-relaxed">{APP_CONFIG.description}</p>
          <ul className="space-y-3 text-sm">
            {productHighlights.map((highlight) => (
              <li key={highlight} className="flex items-start gap-3">
                <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-current" />
                <span className="text-primary-foreground/85">{highlight}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="text-primary-foreground/65 relative flex items-center justify-between text-xs">
          <span>{APP_CONFIG.copyright}</span>
          <span>
            {APP_CONFIG.language.toUpperCase()} · {APP_CONFIG.currency}
          </span>
        </div>
      </div>

      <div className="bg-background flex items-center justify-center px-4 py-10 sm:px-8 lg:px-12">
        <div className="w-full max-w-md space-y-8">
          <div className="flex items-center gap-3 lg:hidden">
            <span className="bg-primary text-primary-foreground grid size-10 place-items-center rounded-xl">
              <AppLogo className="size-6" />
            </span>
            <span className="text-lg font-semibold">{APP_CONFIG.name}</span>
          </div>

          <div className="space-y-2">
            <p className="text-muted-foreground text-sm font-medium">Welcome back</p>
            <h2 className="text-3xl font-semibold tracking-tight">Sign in to your account</h2>
            <p className="text-muted-foreground text-sm">
              Use one of the demo accounts below or enter your own credentials.
            </p>
          </div>

          {serverError ? (
            <Alert variant="destructive">
              <AlertTitle>Unable to sign in</AlertTitle>
              <AlertDescription>{serverError}</AlertDescription>
            </Alert>
          ) : null}

          <form noValidate onSubmit={onSubmit} className="space-y-5">
            <FieldGroup className="gap-4">
              <Controller
                control={form.control}
                name="email"
                render={({ field, fieldState }) => (
                  <Field className="gap-1.5" data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="login-email">Email address</FieldLabel>
                    <Input
                      {...field}
                      id="login-email"
                      type="email"
                      placeholder="you@example.com"
                      autoComplete="email"
                      aria-invalid={fieldState.invalid}
                    />
                    {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                  </Field>
                )}
              />
              <Controller
                control={form.control}
                name="password"
                render={({ field, fieldState }) => (
                  <Field className="gap-1.5" data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="login-password">Password</FieldLabel>
                    <Input
                      {...field}
                      id="login-password"
                      type="password"
                      placeholder="••••••••"
                      autoComplete="current-password"
                      aria-invalid={fieldState.invalid}
                    />
                    {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                  </Field>
                )}
              />
              <Controller
                control={form.control}
                name="remember"
                render={({ field, fieldState }) => (
                  <Field orientation="horizontal" data-invalid={fieldState.invalid}>
                    <Checkbox
                      id="login-remember"
                      name={field.name}
                      checked={field.value}
                      onCheckedChange={(checked) => field.onChange(Boolean(checked))}
                      aria-invalid={fieldState.invalid}
                    />
                    <FieldContent>
                      <FieldLabel htmlFor="login-remember" className="font-normal">
                        Remember me for 30 days
                      </FieldLabel>
                      {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                    </FieldContent>
                  </Field>
                )}
              />
            </FieldGroup>
            <Button className="w-full" type="submit" disabled={form.formState.isSubmitting}>
              {form.formState.isSubmitting ? "Signing in…" : "Sign in"}
            </Button>
          </form>

          <div className="space-y-3 rounded-xl border p-4">
            <div className="space-y-1">
              <p className="text-sm font-medium">Demo accounts</p>
              <p className="text-muted-foreground text-xs">
                Click an account to fill the form. Each role sees a different menu.
              </p>
            </div>
            <div className="grid gap-2">
              {DEMO_ACCOUNTS.map((account) => (
                <Button
                  key={account.email}
                  type="button"
                  variant="outline"
                  className="h-auto justify-between py-2.5"
                  onClick={() => fillDemoAccount(account.email, account.password)}
                >
                  <span className="text-left">
                    <span className="block text-sm font-medium">{account.role}</span>
                    <span className="text-muted-foreground block text-xs">{account.email}</span>
                  </span>
                  <span className="text-muted-foreground text-xs">{account.password}</span>
                </Button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
