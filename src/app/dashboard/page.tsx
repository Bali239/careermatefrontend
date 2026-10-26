"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/auth/AuthProvider";

export default function DashboardPage() {
  const { user, ready } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!ready) return;
    if (!user) router.replace("/auth/login");
    else router.replace("/dashboard/profile");
  }, [ready, user, router]);

  if (!ready || !user) {
    return <main className="flex min-h-[50vh] items-center justify-center text-sm text-slate-500" aria-live="polite">Checking your session…</main>;
  }

  return null;
}
