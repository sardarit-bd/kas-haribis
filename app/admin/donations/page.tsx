import ProductBreadcrumb from '../../componnent/ProductBreadcrumb';
import { requireChatGPTUser } from '../../chatgpt-auth';

export const dynamic = 'force-dynamic';

const breadcrumbs = [
  { label: 'Dashboard', href: '/admin' },
  { label: 'Donation Records', href: '/admin/donations' },
];

export default async function DonationsAdmin() {
  const user = await requireChatGPTUser('/admin/donations');
  if (user.email.toLowerCase() !== 'mdemong87@gmail.com')
    return (
      <main className="adminPage">
        <div className="adminShell">
          <h1>Administrator access</h1>
          <p>This account is not authorized.</p>
        </div>
      </main>
    );
  const { env } = await import('cloudflare:workers');
  await env.DB.prepare(
    'CREATE TABLE IF NOT EXISTS payment_records (id TEXT PRIMARY KEY, kind TEXT NOT NULL, amount REAL NOT NULL, name TEXT NOT NULL, email TEXT NOT NULL, dedication TEXT, anonymous INTEGER NOT NULL DEFAULT 0, status TEXT NOT NULL, reference TEXT, download_token TEXT, created_at TEXT NOT NULL)',
  ).run();
  const result = await env.DB.prepare(
    "SELECT amount,name,email,dedication,anonymous,status,reference,created_at FROM payment_records WHERE kind='donation' ORDER BY created_at DESC LIMIT 200",
  ).all();
  const rows = result.results as Array<Record<string, any>>;
  return (
    <main className="adminPage">
      <div className="adminShell">
        <ProductBreadcrumb breadcrumbs={breadcrumbs} backbtn={true} />
        <div className="adminHeading">
          <div>
            <h1>Donations</h1>
            <p>Approved and declined Cardknox donation attempts.</p>
          </div>
          <span className="countBadge">{rows.length} records</span>
        </div>
        {rows.length === 0 ? (
          <div className="emptyState">
            <b>No donations yet</b>
            <p>Successful donations will appear here automatically.</p>
          </div>
        ) : (
          <div className="paymentRecords">
            {rows.map((row, index) => (
              <article key={`${row.reference}-${index}`}>
                <div>
                  <b>{row.anonymous ? 'Anonymous' : row.name}</b>
                  <strong>${Number(row.amount).toFixed(2)}</strong>
                </div>
                <p>{row.email}</p>
                {row.dedication && <blockquote>{row.dedication}</blockquote>}
                <small>
                  <span className={row.status === 'Paid' ? 'paid' : 'declined'}>
                    {row.status}
                  </span>{' '}
                  {row.reference || 'No reference'} ·{' '}
                  {new Date(row.created_at).toLocaleString('en-US')}
                </small>
              </article>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
