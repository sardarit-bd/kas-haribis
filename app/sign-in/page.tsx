import { redirect } from 'next/navigation';
import { getCurrentUser } from '../lib/auth';
import { SiteFooter, SiteHeader } from '../shared/site-shell';
export const dynamic = 'force-dynamic';

const highlights = [
  {
    title: 'Member dashboard',
    text: 'Save preferences and access your Kav Haribis membership account.',
  },
  {
    title: 'Admin tools',
    text: 'Authorized staff can manage content, submissions, and site resources.',
  },
  {
    title: 'Secure access',
    text: 'Sign in with your verified Google account — no separate password needed.',
  },
];

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

export default async function SignInPage({
  searchParams,
}: {
  searchParams: Promise<{ return_to?: string }>;
}) {
  const params = await searchParams;
  const returnTo = params.return_to || '/';
  const user = await getCurrentUser();
  if (user) {
    redirect(returnTo.startsWith('/') ? returnTo : '/');
  }

  const googleHref = `/api/auth/google?return_to=${encodeURIComponent(returnTo)}`;

  return (
    <main className="flex min-h-screen flex-col bg-[#f7f3ea]">
      <SiteHeader />
      <div className="grid flex-1 lg:grid-cols-2  container my-20">
        <section className="relative flex flex-col justify-between overflow-hidden bg-gradient-to-br from-[#102a43] via-[#173f5f] to-[#0a2033] px-8 py-10 text-white sm:px-12 lg:px-14 lg:py-14 rounded-xl">
          <div className="pointer-events-none absolute -right-16 top-20 h-64 w-64 rounded-full bg-[#c69b46]/10 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-20 left-10 h-72 w-72 rounded-full bg-[#c69b46]/10 blur-3xl" />

          <div className="relative my-10 max-w-xl lg:my-0">
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#e3c176]">
              Welcome back
            </p>
            <h1 className="mt-4 font-serif text-3xl leading-tight sm:text-4xl lg:text-[2.65rem]">
              Torah guidance for responsible commerce
            </h1>
            <p className="mt-5 text-base leading-relaxed text-white/80 sm:text-lg">
              Kav Haribis provides practical Hilchos Ribbis resources, directories,
              learning materials, and community tools. Sign in to access member and
              staff features on this site.
            </p>

            <ul className="mt-8 space-y-4">
              {highlights.map((item) => (
                <li key={item.title} className="flex gap-3">
                  <span className="mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#c69b46]/20 text-sm text-[#e3c176]">
                    ✓
                  </span>
                  <span>
                    <span className="block font-semibold text-white">
                      {item.title}
                    </span>
                    <span className="mt-0.5 block text-sm leading-relaxed text-white/70">
                      {item.text}
                    </span>
                  </span>
                </li>
              ))}
            </ul>
          </div>

          <p className="relative text-sm text-white/55">
            בס״ד · Promoting awareness and observance of Hilchos Ribbis
          </p>
        </section>

        <section className="flex items-center justify-center px-6 py-12 sm:px-10 lg:px-16">
          <div className="w-full max-w-md">
            <div className="rounded-3xl border border-[#d9e0e7] bg-white p-8 shadow-[0_24px_60px_rgba(16,42,67,0.08)] sm:p-10">
              <div className="mb-8 text-center lg:text-left">
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#c69b46]">
                  Sign in required
                </p>
                <h2 className="mt-3 font-serif text-3xl text-[#102a43]">
                  Continue to Kav Haribis
                </h2>
                <p className="mt-3 text-sm leading-relaxed text-[#637282]">
                  To open this page, please sign in with your Google account.
                  This is the only login option available on this site.
                </p>
              </div>

              <a
                href={googleHref}
                className="group flex w-full items-center justify-center gap-3 rounded-2xl border border-[#d5dce3] bg-white px-5 py-4 text-base font-semibold text-[#172431] shadow-sm transition hover:border-[#c7d0d9] hover:bg-[#fafbfc] hover:shadow-md focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#c69b46]"
              >
                <GoogleIcon />
                <span>Continue with Google</span>
              </a>

              <p className="mt-4 text-center text-xs leading-relaxed text-[#637282] lg:text-left">
                Use the Google account you have been authorized to access this
                site with.
              </p>

              <div className="mt-8 rounded-2xl border border-[#efe7d4] bg-[#fbf7ef] px-4 py-3 text-sm text-[#5f4d2d]">
                <strong className="font-semibold text-[#102a43]">
                  How to sign in:
                </strong>{' '}
                Click the button above, choose your Google account, and you will
                be returned here automatically.
              </div>
            </div>
          </div>
        </section>
      </div>
      <SiteFooter />
    </main>
  );
}