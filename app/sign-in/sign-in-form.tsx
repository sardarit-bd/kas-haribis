'use client';

import { useRouter } from 'next/navigation';
import { FormEvent, useState } from 'react';

function GoogleIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5 shrink-0">
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      />
    </svg>
  );
}

export default function SignInForm({
  googleHref,
  returnTo,
  initialError,
}: {
  googleHref: string;
  returnTo: string;
  initialError?: string;
}) {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState(
    initialError === 'no_staff_access'
      ? 'You have not staff access to access dashboard'
      : initialError || '',
  );

  async function handlePasswordLogin(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, returnTo }),
      });

      const data = (await res.json()) as any;
      if (!res.ok) {
        setErrorMsg(data.error || 'Failed to sign in.');
        setLoading(false);
        return;
      }

      const redirectTarget = data.redirectUrl || returnTo || '/admin';
      router.push(redirectTarget);
      router.refresh();
    } catch {
      setErrorMsg('An unexpected error occurred. Please try again.');
      setLoading(false);
    }
  }

  return (
    <div className="w-full max-w-md">
      <div className="rounded-3xl border border-[#d9e0e7] bg-white p-8 shadow-[0_24px_60px_rgba(16,42,67,0.08)] sm:p-10">
        <div className="mb-6 text-center lg:text-left">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#c69b46]">
            Sign in required
          </p>
          <h2 className="mt-3 font-serif text-3xl text-[#102a43]">
            Continue to Kav Haribis
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-[#637282]">
            Sign in with your Google account or staff email and password.
          </p>
        </div>

        {errorMsg && (
          <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-800 shadow-sm flex items-start gap-3">
            <div className="w-6 h-6 rounded-full bg-red-100 border border-red-300 text-red-600 flex items-center justify-center shrink-0 font-bold text-xs mt-0.5">
              ✕
            </div>
            <div>
              <strong className="block font-semibold text-red-900">
                Access Restricted
              </strong>
              <span>{errorMsg}</span>
            </div>
          </div>
        )}

        {/* Google OAuth Option */}
        <a
          href={googleHref}
          className="group flex w-full items-center justify-center gap-3 rounded-2xl border border-[#d5dce3] bg-white px-5 py-3.5 text-base font-semibold text-[#172431] shadow-sm transition hover:border-[#c7d0d9] hover:bg-[#fafbfc] hover:shadow-md focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#c69b46]"
        >
          <GoogleIcon />
          <span>Continue with Google</span>
        </a>

        <div className="relative my-6 flex items-center justify-center">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-[#e2e8f0]" />
          </div>
          <span className="relative bg-white px-4 text-xs font-semibold uppercase tracking-wider text-[#94a3b8]">
            Or sign in with Password
          </span>
        </div>

        {/* Email & Password Form */}
        <form onSubmit={handlePasswordLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-[#475569] mb-1">
              Email Address
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="staff@email.com"
              className="w-full rounded-xl border border-[#cbd5e1] px-4 py-3 text-sm text-[#0f172a] placeholder-[#94a3b8] focus:border-[#c69b46] focus:outline-none focus:ring-2 focus:ring-[#c69b46]/20 transition"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-[#475569] mb-1">
              Password / Temporary Password
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              className="w-full rounded-xl border border-[#cbd5e1] px-4 py-3 text-sm text-[#0f172a] placeholder-[#94a3b8] focus:border-[#c69b46] focus:outline-none focus:ring-2 focus:ring-[#c69b46]/20 transition"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-[#102a43] hover:bg-[#173f5f] active:bg-[#0a2033] py-3.5 px-4 font-semibold text-white shadow-md transition disabled:opacity-50 text-sm"
          >
            {loading ? 'Signing in…' : 'Sign in with Password'}
          </button>
        </form>

        <div className="mt-6 rounded-2xl border border-[#efe7d4] bg-[#fbf7ef] px-4 py-3 text-xs leading-relaxed text-[#5f4d2d]">
          <strong className="font-semibold text-[#102a43]">
            Authorized Staff Access:
          </strong>{' '}
          Please use your authorized Google account or temporary password provided by site administrator.
        </div>
      </div>
    </div>
  );
}
