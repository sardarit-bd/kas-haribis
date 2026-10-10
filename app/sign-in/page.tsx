import { redirect } from 'next/navigation';
import { getCurrentUser } from '../lib/auth';
import { SiteFooter, SiteHeader } from '../shared/site-shell';
import SignInForm from './sign-in-form';

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
    text: 'Sign in with your verified Google account or temporary staff password.',
  },
];

export default async function SignInPage({
  searchParams,
}: {
  searchParams: Promise<{ return_to?: string; error?: string }>;
}) {
  const params = await searchParams;
  const returnTo = params.return_to || '/';
  const initialError = params.error || '';
  const user = await getCurrentUser();
  if (user) {
    redirect(returnTo.startsWith('/') ? returnTo : '/');
  }

  const googleHref = `/api/auth/google?return_to=${encodeURIComponent(returnTo)}`;

  return (
    <main className="flex min-h-screen flex-col bg-[#f7f3ea]">
      <SiteHeader />
      <div className="mx-auto flex w-full max-w-6xl flex-1 items-center px-4 py-8 sm:px-6 md:py-12 lg:px-8 lg:py-16">
        <div className="grid w-full grid-cols-1 items-stretch gap-8 lg:grid-cols-2 lg:gap-10">
          {/* Left Welcome Panel */}
          <section className="relative flex flex-col justify-between overflow-hidden rounded-3xl bg-gradient-to-br from-[#102a43] via-[#173f5f] to-[#0a2033] p-7 text-white shadow-xl sm:p-9 lg:p-10">
            {/* Ambient gold glow elements */}
            <div className="pointer-events-none absolute -right-16 top-16 h-64 w-64 rounded-full bg-[#c69b46]/10 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-16 left-8 h-64 w-64 rounded-full bg-[#c69b46]/10 blur-3xl" />

            <div className="relative z-10">
              <span className="inline-block text-xs font-bold uppercase tracking-[0.24em] text-[#e3c176]">
                Welcome back
              </span>
              <h1 className="mt-3 font-serif text-2xl font-bold leading-snug sm:text-3xl lg:text-4xl text-white">
                Torah guidance for responsible commerce
              </h1>
              <p className="mt-4 text-sm sm:text-base leading-relaxed text-white/80">
                Kav Haribis provides practical Hilchos Ribbis resources, directories,
                learning materials, and community tools. Sign in to access member and
                staff features on this site.
              </p>

              <ul className="mt-6 sm:mt-8 space-y-4 sm:space-y-5">
                {highlights.map((item) => (
                  <li key={item.title} className="flex items-start gap-3.5">
                    <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#c69b46]/25 text-xs font-bold text-[#e3c176]">
                      ✓
                    </span>
                    <div>
                      <span className="block text-sm sm:text-base font-semibold text-white">
                        {item.title}
                      </span>
                      <span className="mt-0.5 block text-xs sm:text-sm leading-relaxed text-white/70">
                        {item.text}
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            <div className="relative z-10 mt-8 sm:mt-10 pt-4 border-t border-white/10">
              <p className="text-xs sm:text-sm text-white/60">
                בס״ד · Promoting awareness and observance of Hilchos Ribbis
              </p>
            </div>
          </section>

          {/* Right Sign-In Card */}
          <section className="flex items-center justify-center">
            <SignInForm
              googleHref={googleHref}
              returnTo={returnTo}
              initialError={initialError}
            />
          </section>
        </div>
      </div>
      <SiteFooter />
    </main>
  );
}