"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { api } from "@/lib/axios";
import AuthMessage from "@/components/auth/AuthMessage";
import Google from "@/components/auth/google/Google";

function responseMessage(error: unknown) {
  if (typeof error === "object" && error && "response" in error) {
    const message = (error as { response?: { data?: { message?: string } } }).response?.data?.message;
    if (message) return message;
  }
  return "Could not create your account. Check your connection and try again.";
}

export default function Signup() {
  const [name, setName] = useState(""); const [email, setEmail] = useState(""); const [password, setPassword] = useState("");
  const [error, setError] = useState(""); const [done, setDone] = useState(""); const [busy, setBusy] = useState(false);
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setError(""); setBusy(true);
    try {
      const response = await api.post("/auth/signup", { name, email, password });
      setDone(response.data.message);
    } catch (reason) { setError(responseMessage(reason)); }
    finally { setBusy(false); }
  }
  if (done) return <div className="auth-result"><AuthMessage kind="success">{done}</AuthMessage><p>Once you verify your address, you can sign in.</p><Link className="auth-submit auth-submit-link" href="/auth/login">Go to sign in</Link></div>;
  return <>
    <Google />
    <div className="auth-divider"><span>or create an account with email</span></div>
    <form className="auth-form" onSubmit={submit}>
      <label>Your name<input autoComplete="name" value={name} onChange={(event) => setName(event.target.value)} required minLength={1} maxLength={100} /></label>
      <label>Email address<input autoComplete="email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} required maxLength={254} /></label>
      <label>Password<input autoComplete="new-password" type="password" value={password} onChange={(event) => setPassword(event.target.value)} required minLength={10} maxLength={128} /><small>Use at least 10 characters.</small></label>
      {error && <AuthMessage>{error}</AuthMessage>}
      <button className="auth-submit" type="submit" disabled={busy}>{busy ? "Creating account…" : "Create account"}</button>
    </form>
    <p className="auth-switch">Already have an account? <Link href="/auth/login">Sign in</Link></p>
  </>;
}
