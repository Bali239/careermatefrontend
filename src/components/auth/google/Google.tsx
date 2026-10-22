"use client";

export default function Google() {
  const apiBase = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000/api/v1";
  return <a className="flex h-11 w-full items-center justify-center gap-2.5 rounded-[9px] border border-[#e6e5ef] bg-white text-xs font-bold text-[#41465c] hover:border-[#c7c1ea] hover:bg-[#fbfaff]" href={`${apiBase}/auth/google`}><span className="text-base font-extrabold text-[#4285f4]">G</span>Continue with Google</a>;
}
