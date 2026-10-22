"use client";

export default function Google() {
  const apiBase = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000/api/v1";
  return <a className="google-button" href={`${apiBase}/auth/google`}><span className="google-g">G</span>Continue with Google</a>;
}
