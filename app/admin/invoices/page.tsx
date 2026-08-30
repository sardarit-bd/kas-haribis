import ProductBreadcrumb from '../../componnent/ProductBreadcrumb';
import { requireChatGPTUser } from '../../chatgpt-auth';
import { ensureInvoices } from '../../lib/invoices';
import InvoiceManager from './invoice-manager';
export const dynamic = 'force-dynamic';

const breadcrumbs = [
  { label: 'Dashboard', href: '/admin' },
  { label: 'Invoices & Receipts', href: '/admin/invoices' },
];

export default async function InvoiceAdmin() {
  const user = await requireChatGPTUser('/admin/invoices');
  if (user.email.toLowerCase() !== 'mdemong87@gmail.com')
    return (
      <main className="adminPage">
        <div className="adminShell">
          <h1>Not authorized</h1>
        </div>
      </main>
    );
  const { env } = await import('cloudflare:workers');
  await ensureInvoices(env.DB);
  const result = await env.DB.prepare(
    'SELECT * FROM invoices ORDER BY created_at DESC',
  ).all();
  return (
    <main className="adminPage invoiceAdminPage">
      <div className="adminShell">
        <ProductBreadcrumb breadcrumbs={breadcrumbs} backbtn={true} />
        <div className="adminHeading">
          <div>
            <h1>Invoices and donation receipts</h1>
            <p>
              Create polished invoices and official donation acknowledgment
              receipts from one place.
            </p>
          </div>
          <span className="countBadge">{result.results.length} records</span>
        </div>
        <InvoiceManager initialInvoices={result.results as any[]} />
      </div>
    </main>
  );
}
