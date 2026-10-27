'use client';

import Link from 'next/link';
import { FormEvent, useState } from 'react';
import { api } from '@/lib/axios';
import AuthMessage from '@/components/auth/AuthMessage';
import { authFormClass, authSubmitClass } from '@/components/auth/classes';

export default function ResetPassword({ token }: { token?: string }) {
  const [password, setPassword] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);
  const [busy, setBusy] = useState(false);
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');
    if (!token) {
      setError('This password reset link is missing or invalid.');
      return;
    }
    if (password !== confirmation) {
      setError('The passwords do not match.');
      return;
    }
    setBusy(true);
    try {
      await api.post('/auth/reset-password', { token, password });
      setDone(true);
    } catch (reason) {
      setError(
        typeof reason === 'object' && reason && 'response' in reason
          ? ((reason as { response?: { data?: { message?: string } } }).response?.data?.message ??
              'This link is invalid or expired.')
          : 'Could not update your password. Try again.'
      );
    } finally {
      setBusy(false);
    }
  }
  return done ? (
    <div className="grid gap-3">
      <AuthMessage kind="success">Password updated. Sign in with your new password.</AuthMessage>
      <Link className={`${authSubmitClass} mt-5`} href="/auth/login">
        Continue to sign in
      </Link>
    </div>
  ) : (
    <form className={authFormClass} onSubmit={submit}>
      <label>
        New password
        <input
          autoComplete="new-password"
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          required
          minLength={10}
          maxLength={128}
        />
      </label>
      <label>
        Confirm new password
        <input
          autoComplete="new-password"
          type="password"
          value={confirmation}
          onChange={(event) => setConfirmation(event.target.value)}
          required
          minLength={10}
          maxLength={128}
        />
      </label>
      {error && <AuthMessage>{error}</AuthMessage>}
      <button className={authSubmitClass} type="submit" disabled={busy}>
        {busy ? 'Updating…' : 'Update password'}
      </button>
    </form>
  );
}
