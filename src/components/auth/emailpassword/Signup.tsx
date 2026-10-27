'use client';

import Link from 'next/link';
import { FormEvent, useState } from 'react';
import { api } from '@/lib/axios';
import AuthMessage from '@/components/auth/AuthMessage';
import Google from '@/components/auth/google/Google';
import {
  authDividerClass,
  authFormClass,
  authSubmitClass,
  authSwitchClass,
} from '@/components/auth/classes';

function responseMessage(error: unknown) {
  if (typeof error === 'object' && error && 'response' in error) {
    const message = (error as { response?: { data?: { message?: string } } }).response?.data
      ?.message;
    if (message) return message;
  }
  return 'Could not create your account. Check your connection and try again.';
}

export default function Signup() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [done, setDone] = useState('');
  const [busy, setBusy] = useState(false);
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');
    setBusy(true);
    try {
      const response = await api.post('/auth/signup', { name, email, password });
      setDone(response.data.message);
    } catch (reason) {
      setError(responseMessage(reason));
    } finally {
      setBusy(false);
    }
  }
  if (done)
    return (
      <div className="grid gap-3">
        <AuthMessage kind="success">{done}</AuthMessage>
        <p className="m-0 text-xs text-[#727994]">Once you verify your address, you can sign in.</p>
        <Link className={`${authSubmitClass} mt-5`} href="/auth/login">
          Go to sign in
        </Link>
      </div>
    );
  return (
    <>
      <Google />
      <div className={authDividerClass}>
        <span>or create an account with email</span>
      </div>
      <form className={authFormClass} onSubmit={submit}>
        <label>
          Your name
          <input
            autoComplete="name"
            value={name}
            onChange={(event) => setName(event.target.value)}
            required
            minLength={1}
            maxLength={100}
          />
        </label>
        <label>
          Email address
          <input
            autoComplete="email"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
            maxLength={254}
          />
        </label>
        <label>
          Password
          <input
            autoComplete="new-password"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
            minLength={10}
            maxLength={128}
          />
          <small>Use at least 10 characters.</small>
        </label>
        {error && <AuthMessage>{error}</AuthMessage>}
        <button className={authSubmitClass} type="submit" disabled={busy}>
          {busy ? 'Creating account…' : 'Create account'}
        </button>
      </form>
      <p className={authSwitchClass}>
        Already have an account? <Link href="/auth/login">Sign in</Link>
      </p>
    </>
  );
}
