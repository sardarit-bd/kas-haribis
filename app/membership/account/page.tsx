import { requireChatGPTUser } from '../../chatgpt-auth';
import { getOrCreateMember, listMemberOrders } from '../../lib/members';
import { SiteFooter, SiteHeader } from '../../shared/site-shell';
import MembershipDashboard from './membership-dashboard';

export const dynamic = 'force-dynamic';

export default async function MembershipAccountPage() {
  const user = await requireChatGPTUser('/membership/account');
  const { env } = await import('cloudflare:workers');
  const member = await getOrCreateMember(
    env.DB,
    user.email.toLowerCase(),
    user.fullName || '',
  );
  const orders = await listMemberOrders(env.DB, member.email);
  return (
    <main className="min-h-screen bg-[#f7f3ea] text-slate-900 flex flex-col font-sans">
      <SiteHeader />
      <section className="max-w-[1440px] mx-auto px-4 sm:px-8 py-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 w-full">
        <div>
          <p className="text-[#a37828] text-xs font-bold tracking-widest uppercase mb-2">KAV HARIBIS MEMBERSHIP</p>
          <h1 className="text-3xl sm:text-4xl font-serif font-bold text-[#102a43] mb-2">Welcome, {member.name || user.displayName}</h1>
          <p className="text-slate-600 text-sm max-w-xl">
            Manage your Kav Haribis profile, communication preferences, and
            order history.
          </p>
        </div>
        <a className="inline-flex items-center px-4 py-2 rounded-xl border border-slate-300 hover:border-slate-400 bg-white text-slate-700 hover:text-slate-900 font-semibold text-xs transition shadow-sm" href="/api/auth/signout?return_to=/membership">Sign out</a>
      </section>
      <div className="max-w-[1440px] mx-auto px-4 sm:px-8 py-10 w-full">
        <MembershipDashboard initialMember={member} orders={orders} />
      </div>
      <SiteFooter />
    </main>
  );
}

