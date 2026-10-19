'use client';

import { FormEvent, Suspense, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { SiteFooter, SiteHeader } from '../shared/site-shell';

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token') || '';

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!token) {
    return (
      <div className="text-center py-4">
        <div className="w-12 h-12 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center mx-auto mb-4 font-bold text-lg">
          !
        </div>
        <h2 className="font-serif text-xl sm:text-2xl font-bold text-[#102a43]">
          Missing Reset Token
        </h2>
        <p className="mt-2 text-xs sm:text-sm text-[#637282] leading-relaxed">
          This password reset link is invalid or incomplete. Please request a new
          password reset link from the account recovery page.
        </p>
        <div className="mt-6">
          <Link
            href="/forgot-password"
            className="inline-flex items-center justify-center h-10 px-5 rounded-xl bg-[#102a43] text-white text-xs sm:text-sm font-semibold hover:bg-[#173f5f] transition"
          >
            Request New Reset Link
          </Link>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="text-center py-4">
        <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto mb-4 font-bold text-lg">
          ✓
        </div>
        <h2 className="font-serif text-xl sm:text-2xl font-bold text-[#102a43]">
          Password Reset Complete
        </h2>
        <p className="mt-2 text-xs sm:text-sm text-[#637282] leading-relaxed">
          Your account password has been successfully updated. You can now sign
          in using your new password.
        </p>
        <div className="mt-6">
          <Link
            href="/sign-in"
            className="inline-flex items-center justify-center h-11 px-6 rounded-xl bg-[#102a43] text-white text-sm font-semibold hover:bg-[#173f5f] transition shadow-xs"
          >
            Continue to Sign In →
          </Link>
        </div>
      </div>
    );
  }

  async function handleReset(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErrorMsg('');

    if (password.length < 10) {
      setErrorMsg('Password must be at least 10 characters long.');
      return;
    }

    if (password.length > 128) {
      setErrorMsg('Password must not exceed 128 characters.');
      return;
    }

    if (!password.trim()) {
      setErrorMsg('Password cannot be empty or only whitespace.');
      return;
    }

    if (password !== confirmPassword) {
      setErrorMsg('Passwords do not match. Please re-enter your new password.');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password }),
      });

      const data = (await res.json()) as any;
      if (!res.ok) {
        setErrorMsg(data.error || 'Failed to reset password.');
        setLoading(false);
        return;
      }

      setSuccess(true);
    } catch {
      setErrorMsg('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <div className="mb-6 text-center">
        <p className="text-xs font-bold uppercase tracking-[0.22em] text-[#c69b46]">
          Secure Update
        </p>
        <h1 className="mt-2 font-serif text-2xl sm:text-3xl font-bold text-[#102a43]">
          Choose New Password
        </h1>
        <p className="mt-2 text-xs sm:text-sm leading-relaxed text-[#637282]">
          Enter your new password below. It must be between 10 and 128 characters.
        </p>
      </div>

      {errorMsg && (
        <div className="mb-5 rounded-xl border border-red-200 bg-red-50 p-3.5 sm:p-4 text-xs sm:text-sm text-red-800 flex items-start gap-3">
          <div className="w-5 h-5 rounded-full bg-red-100 border border-red-300 text-red-600 flex items-center justify-center shrink-0 font-bold text-xs mt-0.5">
            ✕
          </div>
          <div>
            <strong className="block font-semibold text-red-900">
              Reset Failed
            </strong>
            <span>{errorMsg}</span>
          </div>
        </div>
      )}

      <form onSubmit={handleReset} className="space-y-4">
        <div>
          <label
            htmlFor="new-password"
            className="block text-xs font-semibold uppercase tracking-wider text-[#475569] mb-1.5"
          >
            New Password
          </label>
          <input
            id="new-password"
            type="password"
            required
            minLength={10}
            maxLength={128}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="At least 10 characters"
            disabled={loading}
            className="w-full h-11 sm:h-12 rounded-xl border border-[#cbd5e1] px-4 text-sm text-[#0f172a] placeholder-[#94a3b8] focus:border-[#c69b46] focus:outline-none focus:ring-2 focus:ring-[#c69b46]/20 transition"
          />
          <p className="mt-1 text-[11px] text-[#64748b]">
            Minimum 10 characters, maximum 128 characters.
          </p>
        </div>

        <div>
          <label
            htmlFor="confirm-password"
            className="block text-xs font-semibold uppercase tracking-wider text-[#475569] mb-1.5"
          >
            Confirm New Password
          </label>
          <input
            id="confirm-password"
            type="password"
            required
            minLength={10}
            maxLength={128}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Repeat new password"
            disabled={loading}
            className="w-full h-11 sm:h-12 rounded-xl border border-[#cbd5e1] px-4 text-sm text-[#0f172a] placeholder-[#94a3b8] focus:border-[#c69b46] focus:outline-none focus:ring-2 focus:ring-[#c69b46]/20 transition"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full h-11 sm:h-12 rounded-xl bg-[#102a43] hover:bg-[#173f5f] active:bg-[#0a2033] font-semibold text-white shadow-sm transition disabled:opacity-50 text-sm tracking-wide flex items-center justify-center"
        >
          {loading ? 'Updating password…' : 'Save New Password'}
        </button>
      </form>

      <div className="mt-6 border-t border-[#e2e8f0] pt-4 text-center">
        <Link
          href="/sign-in"
          className="text-xs sm:text-sm font-medium text-[#102a43] hover:text-[#c69b46] transition inline-flex items-center gap-1.5"
        >
          ← Return to Sign In
        </Link>
      </div>
    </>
  );
}

export default function ResetPasswordPage() {
  return (
    <main className="flex min-h-screen flex-col bg-[#f7f3ea]">
      <SiteHeader />
      <div className="mx-auto flex w-full max-w-lg flex-1 items-center justify-center px-4 py-12 sm:px-6">
        <div className="w-full rounded-3xl border border-[#d9e0e7] bg-white p-7 sm:p-9 shadow-[0_20px_50px_rgba(16,42,67,0.07)]">
          <Suspense
            fallback={
              <div className="text-center py-8 text-sm text-[#64748b]">
                Loading reset page…
              </div>
            }
          >
            <ResetPasswordForm />
          </Suspense>
        </div>
      </div>
      <SiteFooter />
    </main>
  );
}
