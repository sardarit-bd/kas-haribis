import ProductBreadcrumb from '../../componnent/ProductBreadcrumb';
import { requireChatGPTUser } from '../../chatgpt-auth';
import { ensureAlertSubscribers } from '../../lib/directories';
import Subscribers from './subscribers';
export const dynamic = 'force-dynamic';

const breadcrumbs = [
  { label: 'Dashboard', href: '/admin' },
  { label: 'Alert Subscribers', href: '/admin/alert-subscribers' },
];

export default async function Page() {
  const u = await requireChatGPTUser('/admin/alert-subscribers');
  if (u.email.toLowerCase() !== 'mdemong87@gmail.com')
    return (
      <main className="adminPage">
        <div className="adminShell">
          <h1>Not authorized</h1>
        </div>
      </main>
    );
  const { env } = await import('cloudflare:workers');
  await ensureAlertSubscribers(env.DB);
  const q = await env.DB.prepare(
    'SELECT * FROM alert_subscribers ORDER BY created_at DESC',
  ).all();
  return (
    <main className="adminPage">
      <div className="adminShell">
        <ProductBreadcrumb breadcrumbs={breadcrumbs} backbtn={true} />
        <div className="adminHeading">
          <div>
            <h1>Ribbis Alert Subscribers</h1>
            <p>People who requested new Ribbis Alerts by email.</p>
          </div>
          <a href="/ribis-alerts">View signup form →</a>
        </div>
        <Subscribers initialItems={q.results as any} />
      </div>
    </main>
  );
}
