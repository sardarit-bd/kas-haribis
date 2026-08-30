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
    <main className="memberAccountPage">
      <SiteHeader />
      <section className="memberAccountHero">
        <div>
          <p className="eyebrow">KAV HARIBIS MEMBERSHIP</p>
          <h1>Welcome, {member.name || user.displayName}</h1>
          <p>
            Manage your Kav Haribis profile, communication preferences, and
            order history.
          </p>
        </div>
        <a href="/api/auth/signout?return_to=/membership">Sign out</a>
      </section>
      <MembershipDashboard initialMember={member} orders={orders} />
      <SiteFooter />
    </main>
  );
}
