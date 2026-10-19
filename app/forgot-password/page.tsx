'use client';

import { FormEvent, useState } from 'react';
import Link from 'next/link';
import { SiteFooter, SiteHeader } from '../shared/site-shell';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = (await res.json()) as any;
      if (!res.ok) {
        setErrorMsg(data.error || 'Failed to submit request.');
        setLoading(false);
        return;
      }

      setSuccessMsg(
        data.message ||
          'If an account matches that email address, a password reset link has been sent.',
      );
      setEmail('');
    } catch {
      setErrorMsg('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen flex-col bg-[#f7f3ea]">
      <SiteHeader />
      <div className="mx-auto flex w-full max-w-lg flex-1 items-center justify-center px-4 py-12 sm:px-6">
        <div className="w-full rounded-3xl border border-[#d9e0e7] bg-white p-7 sm:p-9 shadow-[0_20px_50px_rgba(16,42,67,0.07)]">
          <div className="mb-6 text-center">
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-[#c69b46]">
              Account Recovery
            </p>
            <h1 className="mt-2 font-serif text-2xl sm:text-3xl font-bold text-[#102a43]">
              Forgot Password
            </h1>
            <p className="mt-2 text-xs sm:text-sm leading-relaxed text-[#637282]">
              Enter your account email address. If an eligible account exists, we
              will send a secure password reset link valid for 1 hour.
            </p>
          </div>

          {errorMsg && (
            <div className="mb-5 rounded-xl border border-red-200 bg-red-50 p-3.5 sm:p-4 text-xs sm:text-sm text-red-800 flex items-start gap-3">
              <div className="w-5 h-5 rounded-full bg-red-100 border border-red-300 text-red-600 flex items-center justify-center shrink-0 font-bold text-xs mt-0.5">
                ✕
              </div>
              <div>
                <strong className="block font-semibold text-red-900">
                  Request Failed
                </strong>
                <span>{errorMsg}</span>
              </div>
            </div>
          )}

          {successMsg && (
            <div className="mb-5 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-xs sm:text-sm text-emerald-900 flex items-start gap-3">
              <div className="w-5 h-5 rounded-full bg-emerald-100 border border-emerald-300 text-emerald-700 flex items-center justify-center shrink-0 font-bold text-xs mt-0.5">
                ✓
              </div>
              <div>
                <strong className="block font-semibold text-emerald-950">
                  Reset Link Dispatched
                </strong>
                <p className="mt-1 leading-relaxed text-emerald-800">
                  {successMsg}
                </p>
                <p className="mt-2 text-[11px] text-emerald-700">
                  Please check your inbox as well as your spam or junk folder. The
                  link will expire in 60 minutes.
                </p>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="forgot-email"
                className="block text-xs font-semibold uppercase tracking-wider text-[#475569] mb-1.5"
              >
                Email Address
              </label>
              <input
                id="forgot-email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@email.com"
                disabled={loading}
                className="w-full h-11 sm:h-12 rounded-xl border border-[#cbd5e1] px-4 text-sm text-[#0f172a] placeholder-[#94a3b8] focus:border-[#c69b46] focus:outline-none focus:ring-2 focus:ring-[#c69b46]/20 transition"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full h-11 sm:h-12 rounded-xl bg-[#102a43] hover:bg-[#173f5f] active:bg-[#0a2033] font-semibold text-white shadow-sm transition disabled:opacity-50 text-sm tracking-wide flex items-center justify-center"
            >
              {loading ? 'Sending link…' : 'Send Password Reset Link'}
            </button>
          </form>

          <div className="mt-6 border-t border-[#e2e8f0] pt-4 text-center">
            <Link
              href="/sign-in"
              className="text-xs sm:text-sm font-medium text-[#102a43] hover:text-[#c69b46] transition inline-flex items-center gap-1.5"
            >
              ← Back to Sign In
            </Link>
          </div>
        </div>
      </div>
      <SiteFooter />
    </main>
  );
}
