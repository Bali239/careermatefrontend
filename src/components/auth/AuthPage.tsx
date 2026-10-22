import Link from "next/link";
import { PropsWithChildren } from "react";

export default function AuthPage({ title, subtitle, children }: PropsWithChildren<{ title: string; subtitle: string }>) {
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
