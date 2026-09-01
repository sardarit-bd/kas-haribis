import { headers } from 'next/headers';
import { requireChatGPTUser } from '../../chatgpt-auth';
import ProductBreadcrumb from '../../componnent/ProductBreadcrumb';
import { ensureBankPremium } from '../../lib/bank-premium';
import { isOwnerEmail } from "../../lib/admin-access";
import { listBanksAdmin } from '../../lib/directories';
import BankManager from './bank-manager';
import PremiumMemberManager from './premium-member-manager';
export const dynamic = 'force-dynamic';

const breadcrumbs = [
  { label: 'Dashboard', href: '/admin' },
  { label: 'Kosher Banks', href: '/admin/banks' },
];

export default async function Page() {
  const user = await requireChatGPTUser('/admin/banks'),
    requestHeaders = await headers(),
    staffEmail = requestHeaders.get('x-kh-staff-email') || '';
  if (!isOwnerEmail(user.email))
    return (
      <main className="adminPage">
        <div className="adminShell">
          <h1>Not authorized</h1>
        </div>
      </main>
    );
  const { env } = await import('cloudflare:workers');
  const banks = await listBanksAdmin(env.DB);
  await ensureBankPremium(env.DB);
  const premiumMembers = !staffEmail
    ? (
        await env.DB.prepare(
          'SELECT id,email,name,active,access_type,expires_at,notes,created_at,updated_at,last_login_at,login_count FROM bank_premium_members ORDER BY active DESC,name COLLATE NOCASE,email COLLATE NOCASE',
        ).all()
      ).results
    : [];
  return (
    <main className="adminPage">
      <div className="adminShell">
        <ProductBreadcrumb breadcrumbs={breadcrumbs} backbtn={true} />
        <div className="adminHeading">
          <div>
            <h1>Bank Manager</h1>
            <p>
              Manage bank listings, protected full reports, access codes, and
              premium members.
            </p>
          </div>
          <a href="/bank-directory">View public directory →</a>
        </div>
        {!staffEmail && (
          <PremiumMemberManager initialMembers={premiumMembers as any} />
        )}
        <BankManager initialBanks={banks} />
      </div>
    </main>
  );
}
