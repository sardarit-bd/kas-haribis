import ProductBreadcrumb from '../../componnent/ProductBreadcrumb';
import { requireChatGPTUser } from '../../chatgpt-auth';
import { ensureHeterTables } from '../../lib/heter-documents';
import AccessCodeManager from './access-code-manager';
import HeterManager from './heter-manager';

export const dynamic = 'force-dynamic';

const breadcrumbs = [
  { label: 'Dashboard', href: '/admin' },
  { label: 'Heter Iska Manager', href: '/admin/heter-iska' },
];

export default async function HeterAdmin() {
  const user = await requireChatGPTUser('/admin/heter-iska');
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
  await ensureHeterTables(env.DB);
  await env.DB.prepare(
    'CREATE TABLE IF NOT EXISTS payment_records (id TEXT PRIMARY KEY, kind TEXT NOT NULL, amount REAL NOT NULL, name TEXT NOT NULL, email TEXT NOT NULL, dedication TEXT, anonymous INTEGER NOT NULL DEFAULT 0, status TEXT NOT NULL, reference TEXT, download_token TEXT, created_at TEXT NOT NULL)',
  ).run();
  const result = await env.DB.prepare(
    "SELECT amount,name,email,status,reference,created_at FROM payment_records WHERE kind='heter-iska' ORDER BY created_at DESC LIMIT 200",
  ).all();
  const rows = result.results as Array<Record<string, any>>;
  const docsResult = await env.DB.prepare(
    'SELECT id,title,description,filename,size,active FROM heter_documents ORDER BY created_at DESC',
  ).all();
  const documents = docsResult.results as Array<{
    id: string;
    title: string;
    description: string;
    filename: string;
    size: number;
    active: number;
  }>;
  const codesResult = await env.DB.prepare(
    'SELECT c.id,c.document_id,c.code_hint,c.label,c.code_type,c.active,c.use_count,c.created_at,c.last_used_at,d.title AS document_title FROM heter_access_codes c JOIN heter_documents d ON d.id=c.document_id ORDER BY c.created_at DESC',
  ).all();
  const codes = codesResult.results as Array<any>;
  return (
    <main className="adminPage">
      <div className="adminShell">
        <ProductBreadcrumb breadcrumbs={breadcrumbs} backbtn={true} />
        <div className="adminHeading">
          <div>
            <h1>Heter Iska manager</h1>
            <p>
              Upload one PDF at a time and review protected-download purchases.
            </p>
          </div>
          <span className="countBadge">{documents.length} documents</span>
        </div>
        <HeterManager initialDocuments={documents} />
        <AccessCodeManager
          documents={documents.map((document) => ({
            id: document.id,
            title: document.title,
          }))}
          initialCodes={codes}
        />
        <div className="adminHeading">
          <div>
            <h1>Purchases</h1>
          </div>
          <span className="countBadge">{rows.length} records</span>
        </div>
        {rows.length === 0 ? (
          <div className="emptyState">
            <b>No purchases yet</b>
            <p>Heter Iska purchases will appear here automatically.</p>
          </div>
        ) : (
          <div className="paymentRecords">
            {rows.map((row, index) => (
              <article key={`${row.reference}-${index}`}>
                <div>
                  <b>{row.name}</b>
                  <strong>${Number(row.amount).toFixed(2)}</strong>
                </div>
                <p>{row.email}</p>
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
