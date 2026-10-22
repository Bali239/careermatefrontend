"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { exchangeGoogleHandoff } from "@/lib/axios";
import { useAuth } from "@/components/auth/AuthProvider";
import AuthMessage from "@/components/auth/AuthMessage";

export default function GoogleCallback() {
  const router = useRouter(); const { acceptSession } = useAuth(); const attempted = useRef(false); const [error, setError] = useState("");
  useEffect(() => {
    if (attempted.current) return;
    attempted.current = true;
    const params = new URLSearchParams(window.location.hash.slice(1));
    const handoff = params.get("handoff"); const failure = params.get("error");
    window.history.replaceState(null, "", window.location.pathname);
    async function finishSignIn() {
      await Promise.resolve();
      if (failure) { setError(failure === "account_conflict" ? "That email is linked to a different Google account." : "Google sign-in could not be completed. Please try again."); return; }
      if (!handoff) { setError("Google sign-in link is missing or expired. Please try again."); return; }
      try {
        const session = await exchangeGoogleHandoff(handoff);
        acceptSession(session); router.replace("/");
      } catch { setError("Google sign-in link is invalid or expired. Please try again."); }
    }
    void finishSignIn();
  }, [acceptSession, router]);
  return error ? <div className="auth-result"><AuthMessage>{error}</AuthMessage><a className="auth-submit auth-submit-link" href="/auth/login">Back to sign in</a></div> : <p className="auth-copy">Completing Google sign-in…</p>;
}
