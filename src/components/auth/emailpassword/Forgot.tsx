"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { api } from "@/lib/axios";
import AuthMessage from "@/components/auth/AuthMessage";
import { authFormClass, authSubmitClass, authSwitchClass } from "@/components/auth/classes";

export default function Forgot() {
  const [email, setEmail] = useState(""); const [done, setDone] = useState(false); const [error, setError] = useState(""); const [busy, setBusy] = useState(false);
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setError(""); setBusy(true);
    try { await api.post("/auth/forgot-password", { email }); setDone(true); }
    catch { setError("Could not submit your request. Please try again later."); }
    finally { setBusy(false); }
  }
  return <>
    <p className="mb-5 text-xs leading-[1.7] text-[#727994]">Enter your account email. If it matches an account, we’ll send a password reset link.</p>
    {done ? <AuthMessage kind="success">If an account exists for that email, password reset instructions will be sent.</AuthMessage> : <form className={authFormClass} onSubmit={submit}>
      <label>Email address<input autoComplete="email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} required maxLength={254} /></label>
      {error && <AuthMessage>{error}</AuthMessage>}
      <button className={authSubmitClass} type="submit" disabled={busy}>{busy ? "Sending…" : "Send reset link"}</button>
    </form>}
    <p className={authSwitchClass}><Link href="/auth/login">Back to sign in</Link></p>
  </>;
}
