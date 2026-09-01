import ProductBreadcrumb from '../../componnent/ProductBreadcrumb';
import { requireChatGPTUser } from '../../chatgpt-auth';
import { listBusinesses } from '../../lib/directories';
import BusinessManager from './business-manager';
import { isOwnerEmail } from "../../lib/admin-access";
export const dynamic = 'force-dynamic';

const breadcrumbs = [
  { label: 'Dashboard', href: '/admin' },
  { label: 'Heter Iska Businesses', href: '/admin/businesses' },
];

export default async function Page() {
  const user = await requireChatGPTUser('/admin/businesses');
  if (!isOwnerEmail(user.email))
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
            <h1>Businesses With a Heter Iska</h1>
            <p>
              Add complete business information, logos, verification details,
              and choose what is published.
            </p>
          </div>
          <a href="/businesses-with-a-heter-iska">View public page →</a>
        </div>
        <BusinessManager
          initialBusinesses={(await listBusinesses(env.DB, true)) as any}
        />
      </div>
    </main>
  );
}
