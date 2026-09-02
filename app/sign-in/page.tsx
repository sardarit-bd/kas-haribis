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
      <div className="grid flex-1 lg:grid-cols-2 container my-20">
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
          <SignInForm
            googleHref={googleHref}
            returnTo={returnTo}
            initialError={initialError}
          />
        </section>
      </div>
      <SiteFooter />
    </main>
  );
}