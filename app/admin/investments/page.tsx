import ProductBreadcrumb from '../../componnent/ProductBreadcrumb';
import { requireChatGPTUser } from '../../chatgpt-auth';
import { listInvestments } from '../../lib/directories';
import Manager from './investment-manager';
export const dynamic = 'force-dynamic';

const breadcrumbs = [
  { label: 'Dashboard', href: '/admin' },
  { label: 'Investment Opportunities', href: '/admin/investments' },
];

export default async function Page() {
  const u = await requireChatGPTUser('/admin/investments');
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
            <h1>Investment Opportunities</h1>
            <p>
              Add, review, organize, and publish kosher investment
              opportunities.
            </p>
          </div>
          <a href="/kosher-investment-opportunities">View public page →</a>
        </div>
        <Manager initialItems={(await listInvestments(env.DB, true)) as any} />
      </div>
    </main>
  );
}
