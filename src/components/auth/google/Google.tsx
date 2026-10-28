'use client';

export default function Google() {
  const apiBase = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:5000/api/v1';
  return (
    <a
      className="group flex h-12 w-full items-center justify-center gap-2.5 rounded-[12px] border border-[#e7e3f1] bg-white text-xs font-bold text-[#41465c] shadow-[0_5px_16px_#34236608] transition hover:-translate-y-0.5 hover:border-[#c7c1ea] hover:shadow-[0_10px_24px_#34236612]"
      href={`${apiBase}/auth/google`}
    >
      <svg
        className="size-[19px] transition group-hover:scale-110"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <path fill="#4285F4" d="M21.35 12.27c0-.72-.06-1.42-.18-2.09H12v3.96h5.24a4.48 4.48 0 0 1-1.94 2.94v2.45h3.14c1.84-1.7 2.91-4.2 2.91-7.26Z" />
        <path fill="#34A853" d="M12 21.6c2.63 0 4.84-.87 6.45-2.37l-3.14-2.45c-.87.58-1.98.92-3.31.92-2.54 0-4.69-1.72-5.46-4.03H3.3v2.53A9.74 9.74 0 0 0 12 21.6Z" />
        <path fill="#FBBC05" d="M6.54 13.67A5.85 5.85 0 0 1 6.23 12c0-.58.11-1.15.31-1.67V7.8H3.3A9.73 9.73 0 0 0 2.27 12c0 1.57.38 3.05 1.03 4.2l3.24-2.53Z" />
        <path fill="#EA4335" d="M12 6.3c1.43 0 2.71.49 3.72 1.45l2.79-2.79C16.84 3.39 14.63 2.4 12 2.4a9.74 9.74 0 0 0-8.7 5.4l3.24 2.53C7.31 8.02 9.46 6.3 12 6.3Z" />
      </svg>
      Continue with Google
    </a>
  );
}
