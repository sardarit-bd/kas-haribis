'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FormEvent, useEffect, useState } from 'react';
import { SiteFooter, SiteHeader } from '../../shared/site-shell';

export default function AdminVerifyPage() {
  const router = useRouter();

  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);
  const [hasSession, setHasSession] = useState(false);
  const [adminEmail, setAdminEmail] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    async function checkPendingSession() {
      try {
        const res = await fetch('/api/auth/verify-owner-password');
        const data = (await res.json()) as { valid?: boolean; email?: string };
        if (data.valid && data.email) {
          setHasSession(true);
          setAdminEmail(data.email);
        } else {
          setHasSession(false);
        }
      } catch {
        setHasSession(false);
      } finally {
        setCheckingSession(false);
      }
    }
    checkPendingSession();
  }, []);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErrorMsg('');

    if (!password.trim()) {
      setErrorMsg('Administrator password is required.');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/auth/verify-owner-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });

      const data = (await res.json()) as {
        error?: string;
        success?: boolean;
        redirectUrl?: string;
      };

      if (!res.ok || !data.success) {
        setErrorMsg(data.error || 'Password verification failed.');
        setLoading(false);
        return;
      }

      const destination = data.redirectUrl || '/admin';
      window.location.href = destination;
    } catch {
      setErrorMsg('A network error occurred during password verification.');
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen flex-col bg-[#f7f3ea]">
      <SiteHeader />
      <div className="mx-auto flex w-full max-w-lg flex-1 items-center px-4 py-12 sm:px-6 lg:px-8">
        <div className="w-full rounded-3xl bg-white p-7 sm:p-9 shadow-xl border border-slate-200/80">
          {checkingSession ? (
            <div className="flex flex-col items-center justify-center py-12 text-slate-500">
              <span className="w-8 h-8 border-3 border-amber-600/30 border-t-amber-600 rounded-full animate-spin mb-3" />
              <p className="text-sm">Verifying sign-in session...</p>
            </div>
          ) : !hasSession ? (
            <div className="text-center py-6">
              <div className="w-14 h-14 mx-auto rounded-full bg-amber-100 border border-amber-300 text-amber-900 flex items-center justify-center font-bold text-xl mb-4">
                !
              </div>
              <h1 className="text-xl font-bold font-serif text-slate-900 mb-2">
                Session Expired or Missing
              </h1>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed max-w-sm mx-auto mb-6">
                No pending Super Admin verification was found. This verification step is only required after completing Google authentication.
              </p>
              <Link
                href="/sign-in"
                className="inline-flex items-center justify-center px-5 py-2.5 rounded-xl bg-amber-600 text-white font-semibold text-sm hover:bg-amber-700 transition-colors shadow-xs"
              >
                Return to Sign In
              </Link>
            </div>
          ) : (
            <div>
              <div className="text-center mb-6">
                <div className="w-14 h-14 mx-auto rounded-2xl bg-amber-50 border border-amber-200 text-amber-800 flex items-center justify-center shadow-xs mb-3">
                  <svg
                    className="w-7 h-7"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                    />
                  </svg>
                </div>
                <h1 className="text-2xl font-bold font-serif text-slate-900">
                  Super Admin Verification
                </h1>
                <p className="text-xs sm:text-sm text-slate-600 mt-1 leading-relaxed">
                  Additional password verification is configured for{' '}
                  <span className="font-semibold font-mono text-slate-800 break-all">
                    {adminEmail}
                  </span>
                </p>
              </div>

              {errorMsg && (
                <div className="mb-5 rounded-xl border border-red-200 bg-red-50 p-3.5 text-xs text-red-800 flex items-start gap-2">
                  <span className="font-bold text-red-600 text-sm leading-none shrink-0">
                    ✕
                  </span>
                  <span className="leading-relaxed">{errorMsg}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label
                    htmlFor="verify-admin-password"
                    className="block text-xs font-semibold text-slate-700 mb-1"
                  >
                    Administrator Password
                  </label>
                  <div className="relative">
                    <input
                      id="verify-admin-password"
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter Super Admin password"
                      disabled={loading}
                      autoFocus
                      required
                      autoComplete="current-password"
                      className="w-full text-sm font-mono px-3.5 py-2.5 pr-12 border border-slate-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 px-3 flex items-center text-xs text-slate-400 hover:text-slate-600 font-medium"
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? 'Hide' : 'Show'}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading || !password}
                  className="w-full mt-2 inline-flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-semibold text-sm text-white bg-amber-600 hover:bg-amber-700 transition-colors shadow-xs disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <>
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Verifying Password...
                    </>
                  ) : (
                    'Verify & Elevate Session'
                  )}
                </button>
              </form>

              <div className="mt-6 pt-4 border-t border-slate-100 text-center">
                <Link
                  href="/sign-in"
                  className="text-xs font-medium text-slate-500 hover:text-slate-800 transition-colors"
                >
                  ← Cancel and return to Sign In
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
      <SiteFooter />
    </main>
  );
}
