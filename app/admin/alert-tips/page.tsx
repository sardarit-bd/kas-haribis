import { requireChatGPTUser } from '../../chatgpt-auth';
import ProductBreadcrumb from '../../componnent/ProductBreadcrumb';
import { ensureAlertTips } from '../../lib/directories';
import { canAccessSection } from "../../lib/admin-access";
import TipInbox from './tip-inbox';
export const dynamic = 'force-dynamic';

const breadcrumbs = [
  { label: 'Dashboard', href: '/admin' },
  { label: 'Alert Tips', href: '/admin/alert-tips' },
];

export default async function Page() {
  const { env } = await import('cloudflare:workers');
  const u = await requireChatGPTUser('/admin/alert-tips');
  if (!(await canAccessSection(env.DB, u.email, 'alert-tips')))
    return (
      <main className="adminPage">
        <div className="adminShell">
          <h1>Not authorized</h1>
        </div>
      </main>
    );
  await ensureAlertTips(env.DB);
  const q = await env.DB.prepare(
    'SELECT * FROM alert_tips ORDER BY created_at DESC',
  ).all();
  return (
    <main className="adminPage">
      <div className="adminShell">
        <ProductBreadcrumb breadcrumbs={breadcrumbs} backbtn={true} />
        <div className="adminHeading">
          <div>
            <h1>Ribbis Alert Tips</h1>
            <p>
              Review information submitted through the dedicated form on the
              Alerts page.
            </p>
          </div>
          <a href="/ribis-alerts">View submission form →</a>
        </div>
        <TipInbox initialItems={q.results as any} />
      </div>
    </main>
  );
}
