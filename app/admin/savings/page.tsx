import ProductBreadcrumb from '../../componnent/ProductBreadcrumb';
import { requireChatGPTUser } from '../../chatgpt-auth';
import { listSavingsAccounts } from '../../lib/directories';
import SavingsManager from './savings-manager';
export const dynamic = 'force-dynamic';

const breadcrumbs = [
  { label: 'Dashboard', href: '/admin' },
  { label: 'Savings Accounts', href: '/admin/savings' },
];

export default async function Page() {
  const u = await requireChatGPTUser('/admin/savings');
  if (u.email.toLowerCase() !== 'mdemong87@gmail.com')
    return (
      <main className="adminPage">
        <div className="adminShell">
          <h1>Not authorized</h1>
        </div>
      </main>
    );
  const { env } = await import('cloudflare:workers');
  return (
    <main className="adminPage">
      <div className="adminShell">
        <ProductBreadcrumb breadcrumbs={breadcrumbs} backbtn={true} />
        <div className="adminHeading">
          <div>
            <h1>High-Yield Savings Accounts</h1>
            <p>
              Manage account details, logos, kosher information, rates, and
              account-opening links.
            </p>
          </div>
          <a href="/savings">View public page →</a>
        </div>
        <SavingsManager
          initialItems={(await listSavingsAccounts(env.DB, true)) as any}
        />
      </div>
    </main>
  );
}
