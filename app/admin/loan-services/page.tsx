import ProductBreadcrumb from '../../componnent/ProductBreadcrumb';
import { requireChatGPTUser } from '../../chatgpt-auth';
import { listLoanServices } from '../../lib/directories';
import LoanServiceManager from './loan-service-manager';
export const dynamic = 'force-dynamic';

const breadcrumbs = [
  { label: 'Dashboard', href: '/admin' },
  { label: 'Kosher Loan Services', href: '/admin/loan-services' },
];

export default async function Page() {
  const u = await requireChatGPTUser('/admin/loan-services');
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
            <h1>Kosher Loan Services</h1>
            <p>
              Manage brokers, loan professionals, service areas, and halachic
              oversight.
            </p>
          </div>
          <a href="/kosher-loan-service">View public page →</a>
        </div>
        <LoanServiceManager
          initialItems={(await listLoanServices(env.DB, true)) as any}
        />
      </div>
    </main>
  );
}
