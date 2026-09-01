import ProductBreadcrumb from '../../componnent/ProductBreadcrumb';
import { requireChatGPTUser } from '../../chatgpt-auth';
import { listRibbisAlerts } from '../../lib/directories';
import { isOwnerEmail } from "../../lib/admin-access";
import Manager from './alert-manager';
export const dynamic = 'force-dynamic';

const breadcrumbs = [
  { label: 'Dashboard', href: '/admin' },
  { label: 'Ribbis Alerts', href: '/admin/alerts' },
];

export default async function Page() {
  const u = await requireChatGPTUser('/admin/alerts');
  if (!isOwnerEmail(u.email))
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
            <h1>Ribbis Alerts</h1>
            <p>
              Add, edit, prioritize, publish, or remove community alerts and
              updates.
            </p>
          </div>
          <a href="/ribis-alerts">View public page →</a>
        </div>
        <Manager initialItems={(await listRibbisAlerts(env.DB, true)) as any} />
      </div>
    </main>
  );
}
