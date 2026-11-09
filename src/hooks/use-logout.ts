"use client";

import { useTransition } from "react";

import { useRouter } from "next/navigation";

import { logoutAction } from "@/server/auth-actions";

export function useLogout() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const logout = () => {
    startTransition(async () => {
      await logoutAction();
      router.replace("/login");
      router.refresh();
    });
  };

  return { logout, isPending };
}
