"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/axios";
import { useAuth } from "@/components/auth/AuthProvider";
import AuthMessage from "@/components/auth/AuthMessage";
import Google from "@/components/auth/google/Google";

function messageFrom(error: unknown) {
  if (typeof error === "object" && error && "response" in error) {
    const data = (error as { response?: { data?: { message?: string } } }).response?.data;
    if (data?.message) return data.message;
  }
  return "Could not sign in. Check your connection and try again.";
}

export default function Login() {
  const router = useRouter();
  const { signIn } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setError(""); setSuccess(""); setBusy(true);
    try { await signIn(email, password); router.replace("/"); }
    catch (reason) { setError(messageFrom(reason)); }
    finally { setBusy(false); }
  }

  async function resendVerification() {
    setError(""); setSuccess(""); setBusy(true);
    try {
      const response = await api.post("/auth/verify-email/resend", { email });
      setSuccess(response.data.message);
    } catch { setError("Could not send the verification email. Try again later."); }
    finally { setBusy(false); }
  }

  return <>
    <Google />
    <div className="auth-divider"><span>or sign in with email</span></div>
    <form className="auth-form" onSubmit={submit}>
      <label>Email address<input autoComplete="email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} required maxLength={254} /></label>
      <label>Password<input autoComplete="current-password" type="password" value={password} onChange={(event) => setPassword(event.target.value)} required /></label>
      <div className="auth-inline"><span /> <Link href="/auth/forgot-password">Forgot password?</Link></div>
      {error && <AuthMessage>{error}</AuthMessage>}{success && <AuthMessage kind="success">{success}</AuthMessage>}
      {error.toLowerCase().includes("verify your email") && <button className="auth-link-button" type="button" onClick={() => void resendVerification()} disabled={busy}>Resend verification email</button>}
      <button className="auth-submit" type="submit" disabled={busy}>{busy ? "Signing in…" : "Sign in"}</button>
    </form>
    <p className="auth-switch">New to CareerMate? <Link href="/auth/signup">Create an account</Link></p>
  </>;
}
