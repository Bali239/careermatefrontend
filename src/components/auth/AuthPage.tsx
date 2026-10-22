"use client";

import Link from "next/link";
import { PropsWithChildren, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/auth/AuthProvider";

export default function AuthPage({ title, subtitle, children }: PropsWithChildren<{ title: string; subtitle: string }>) {
  const { user, ready } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (ready && user) router.replace("/dashboard");
  }, [ready, user, router]);

  if (!ready) {
    return <main className="auth-shell" aria-live="polite">Checking your session…</main>;
  }

  if (user) {
    return (
      <main className="auth-shell" role="alert">
        <section className="auth-card">
          <div className="auth-heading"><h1>You’re already logged in</h1><p>Taking you to your dashboard…</p></div>
          <Link className="auth-submit auth-submit-link" href="/dashboard">Go to dashboard</Link>
        </section>
      </main>
    );
  }

  return (
    <main className="auth-shell">
      <Link href="/" className="brand auth-brand"><span className="brand-mark">✦</span><span>career<span className="brand-light">mate</span></span></Link>
      <section className="auth-card">
        <div className="auth-heading"><span className="auth-kicker">YOUR NEXT CHAPTER</span><h1>{title}</h1><p>{subtitle}</p></div>
        {children}
      </section>
      <Link href="/" className="auth-back">← Back to CareerMate</Link>
    </main>
  );
}
