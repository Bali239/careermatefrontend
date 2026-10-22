"use client";

import Link from "next/link";
import { useAuth } from "./AuthProvider";

export default function AuthLinks() {
  const { user, ready, signOut } = useAuth();
  if (!ready) return <div className="auth-nav-placeholder" aria-hidden="true" />;
  if (!user) return <div className="auth-nav"><Link href="/auth/login">Log in</Link><Link className="auth-nav-cta" href="/auth/signup">Get started</Link></div>;
  return <div className="auth-nav"><span className="auth-nav-user">Hi, {user.name.split(" ")[0]}</span><button className="auth-nav-button" onClick={() => void signOut()}>Sign out</button></div>;
}
