'use client';

import Link from 'next/link';
import { PropsWithChildren, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/auth/AuthProvider';

export default function AuthPage({
  title,
  subtitle,
  children,
}: PropsWithChildren<{ title: string; subtitle: string }>) {
  const { user, ready } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (ready && user) router.replace('/dashboard');
  }, [ready, user, router]);

  if (!ready) {
    return (
      <main
        className="flex min-h-dvh items-center justify-center bg-[#fbfaff] px-5 py-[42px] text-sm text-[#727994]"
        aria-live="polite"
      >
        Checking your session…
      </main>
    );
  }

  if (user) {
    return (
      <main
        className="flex min-h-dvh flex-col items-center justify-center bg-[radial-gradient(ellipse_at_50%_0%,#f1eeff_0,#fbfaff_42%,#fff_78%)] px-5 py-[42px]"
        role="alert"
      >
        <section className="w-full max-w-[450px] rounded-[20px] border border-[#eeecf6] bg-white px-6 py-[30px] shadow-[0_24px_80px_#3024600d] sm:px-[42px] sm:py-[38px]">
          <div className="mb-[25px] text-center">
            <h1 className="my-3 text-[27px] font-bold tracking-[-1px]">You’re already logged in</h1>
            <p className="m-0 text-xs leading-[1.7] text-[#727994]">
              Taking you to your dashboard…
            </p>
          </div>
          <Link
            className="mt-5 flex min-h-11 items-center justify-center rounded-[9px] bg-[#6958d6] px-4 text-xs font-bold text-white hover:bg-[#5949c5]"
            href="/dashboard"
          >
            Go to dashboard
          </Link>
        </section>
      </main>
    );
  }

  return (
    <main className="relative min-h-dvh overflow-hidden bg-[#fbfaff] px-5 py-6 sm:py-10">
      <div className="public-grid pointer-events-none absolute inset-0 opacity-70" />
      <div className="pointer-events-none absolute -left-32 top-[-180px] size-[430px] rounded-full bg-[#dcd5ff]/45 blur-3xl" />
      <div className="pointer-events-none absolute -right-40 bottom-[-190px] size-[460px] rounded-full bg-[#d8f5ef]/50 blur-3xl" />
      <div className="relative mx-auto flex min-h-[calc(100dvh-3rem)] max-w-[1180px] flex-col items-center justify-center">
      <Link
        href="/"
        className="mb-7 inline-flex items-center gap-2.5 text-xl font-extrabold tracking-[-1px] text-[#1e2440] sm:mb-9"
      >
        <span className="grid size-9 place-items-center rounded-[12px] bg-gradient-to-br from-[#917ff3] to-[#5b47ca] text-white shadow-[0_8px_20px_#6958d640]">
          ✦
        </span>
        <span>
          career<span className="text-[#6958d6]">mate</span>
        </span>
      </Link>
      <section className="reveal-up w-full max-w-[465px] rounded-[24px] border border-white/80 bg-white/90 px-6 py-8 shadow-[0_30px_90px_#30246018,0_2px_8px_#30246008] backdrop-blur-xl sm:px-11 sm:py-10">
        <div className="mb-7 text-center">
          <span className="text-[9px] font-extrabold tracking-[1.5px] text-[#6958d6]">
            YOUR NEXT CHAPTER
          </span>
          <h1 className="mb-2 mt-[11px] text-[29px] font-bold tracking-[-1.2px] text-[#1e1b35]">{title}</h1>
          <p className="m-0 text-xs leading-[1.8] text-[#77758e]">{subtitle}</p>
        </div>
        {children}
      </section>
      <Link href="/" className="mt-6 text-[11px] text-[#85899d] transition hover:text-[#6958d6]">
        ← Back to CareerMate
      </Link>
      </div>
    </main>
  );
}
