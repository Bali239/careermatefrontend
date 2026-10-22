"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { api } from "@/lib/axios";
import AuthMessage from "@/components/auth/AuthMessage";

export default function VerifyEmail({ token }: { token?: string }) {
  const requested = useRef(false); const [status, setStatus] = useState(token ? "Checking your verification link…" : "This verification link is missing or invalid."); const [isError, setIsError] = useState(!token);
  useEffect(() => {
    if (requested.current) return;
    requested.current = true;
    if (!token) return;
    api.post("/auth/verify-email", { token }).then((response) => setStatus(response.data.message ?? "Email verified. You can now sign in."))
      .catch((error) => { setIsError(true); setStatus(error.response?.data?.message ?? "This verification link is invalid or expired."); });
  }, [token]);
  return <div className="auth-result"><AuthMessage kind={isError ? "error" : "success"}>{status}</AuthMessage>{!isError && status.startsWith("Checking") ? null : <Link className="auth-submit auth-submit-link" href="/auth/login">Continue to sign in</Link>}</div>;
}
