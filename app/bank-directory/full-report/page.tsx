import { InteriorPage } from '../../shared/site-shell';
import { ensureBankReportTables } from '../../lib/directories';
import { premiumMemberFromHeaders } from '../../lib/bank-premium';
import { headers } from 'next/headers';

export const dynamic = 'force-dynamic';

export default async function FullBankReport({
  searchParams,
}: {
  searchParams: Promise<{ token?: string; bankId?: string }>;
}) {
  const { token = '', bankId = '' } = await searchParams,
    { env } = await import('cloudflare:workers'),
    requestHeaders = await headers();
  await ensureBankReportTables(env.DB);
  const premium = await premiumMemberFromHeaders(requestHeaders, env.DB);
  let record: any = null,
    valid = false;
  if (premium && bankId) {
    record = await env.DB.prepare(
      'SELECT title,full_report,last_updated FROM banks WHERE id=? AND length(full_report)>0',
    )
      .bind(bankId)
      .first();
    valid = Boolean(record);
  } else if (token) {
    record = await env.DB.prepare(
      'SELECT a.created_at,b.title,b.full_report,b.last_updated FROM bank_report_access a JOIN banks b ON b.id=a.bank_id WHERE a.token=?',
    )
      .bind(token)
      .first();
    valid = Boolean(
      record?.created_at &&
      Date.now() - new Date(record.created_at).getTime() <
        7 * 24 * 60 * 60 * 1000,
    );
  }
  if (!valid || !record?.full_report)
    return (
      <InteriorPage
        eyebrow="PROTECTED BANK REPORT"
        title="Report access unavailable"
        intro="This viewing link is invalid or has expired. Return to the Bank Directory to purchase access, enter a valid code, or sign in as a premium member."
      >
        <section className="protectedReport">
          <a className="primary" href="/bank-directory">
            ← Return to Bank Directory
          </a>
        </section>
      </InteriorPage>
    );
  return (
    <InteriorPage
      eyebrow="PROTECTED FULL REPORT"
      title={record.title || 'Bank report'}
      intro={`Private Kav Haribis research report${record.last_updated ? ` · Last updated ${new Date(`${record.last_updated}T00:00:00`).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}` : ''}.`}
    >
      <article className="protectedReport">
        <div className="protectedReportNotice">
          🔒{' '}
          {premium
            ? `Premium member access confirmed for ${premium.name || premium.email}.`
            : `Access confirmed · This private link expires seven days after it was issued.`}
        </div>
        <div className="reportBody">
          {record.full_report
            .split(/\n{2,}/)
            .map((paragraph: string, index: number) => (
              <p key={index}>{paragraph}</p>
            ))}
        </div>
        <a href="/bank-directory">← Return to Bank Directory</a>
      </article>
    </InteriorPage>
  );
}
