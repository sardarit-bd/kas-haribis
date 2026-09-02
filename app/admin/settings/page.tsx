import ProductBreadcrumb from '../../componnent/ProductBreadcrumb';
import { requireChatGPTUser } from '../../chatgpt-auth';
import { canAccessSection } from "../../lib/admin-access";
import PaymentSettingsForm from './settings-form';
export const dynamic = 'force-dynamic';

const breadcrumbs = [
  { label: 'Dashboard', href: '/admin' },
  { label: 'Payment Settings', href: '/admin/settings' },
];

export default async function Settings() {
  const { env } = await import('cloudflare:workers');
  const user = await requireChatGPTUser('/admin/settings');
  if (!(await canAccessSection(env.DB, user.email, 'settings')))
    return (
      <main className="adminPage">
        <div className="adminShell">
          <h1>Not authorized</h1>
        </div>
      </main>
    );
  return (
    <main className="adminPage">
      <div className="adminShell">
        <ProductBreadcrumb breadcrumbs={breadcrumbs} backbtn={true} />
        <div className="adminHeading">
          <div>
            <h1>Payment settings</h1>
            <p>
              Saved credentials are encrypted and are never displayed again.
            </p>
          </div>
        </div>
        <PaymentSettingsForm />
      </div>
    </main>
  );
}
