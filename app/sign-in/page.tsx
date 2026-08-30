import { getCurrentUser, signInPath } from '../lib/auth';
import { redirect } from 'next/navigation';
import { SiteFooter, SiteHeader } from '../shared/site-shell';

export const dynamic = 'force-dynamic';

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
    <main className="min-h-screen bg-slate-50">
      <SiteHeader />
      <section className="mx-auto flex max-w-lg flex-col items-center px-4 py-20 text-center">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-amber-700">
          Kav Haribis
        </p>
        <h1 className="mt-3 text-3xl font-serif text-slate-900">Sign in</h1>
        <p className="mt-3 text-slate-600">
          Continue with your Google account to access membership and admin
          features.
        </p>
        <a
          className="mt-8 inline-flex items-center gap-3 rounded-xl border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-800 shadow-sm transition hover:bg-slate-100"
          href={googleHref}
        >
          <span className="text-lg">G</span>
          <span>Continue with Google</span>
        </a>
      </section>
      <SiteFooter />
    </main>
  );
}
