import { InteriorPage } from '../../shared/site-shell';
import { ensureBankReportTables, ensureBankResearch } from '../../lib/directories';
import { premiumMemberFromHeaders } from '../../lib/bank-premium';
import { getUserFromCookieHeader } from '../../lib/auth';
import { canAccessSection, isOwnerEmail } from '../../lib/admin-access';
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
  await ensureBankResearch(env.DB);

  const adminUser = await getUserFromCookieHeader(requestHeaders.get('cookie'));
  const isOwner = Boolean(adminUser?.email && isOwnerEmail(adminUser.email));
  const isStaff = Boolean(
    adminUser?.email && (await canAccessSection(env.DB, adminUser.email, 'banks')),
  );
  const premium = await premiumMemberFromHeaders(requestHeaders, env.DB);

  let record: any = null,
    targetBankId = bankId,
    valid = false;

  if ((isOwner || isStaff || premium) && targetBankId) {
    record = await env.DB.prepare(
      'SELECT id,title,full_report,last_updated FROM banks WHERE id=?',
    )
      .bind(targetBankId)
      .first();
    valid = Boolean(record);
  } else if (token) {
    const accessRow = (await env.DB.prepare(
      'SELECT a.created_at,a.bank_id,b.title,b.full_report,b.last_updated FROM bank_report_access a JOIN banks b ON b.id=a.bank_id WHERE a.token=?',
    )
      .bind(token)
      .first()) as any;
    if (
      accessRow?.created_at &&
      Date.now() - new Date(accessRow.created_at).getTime() <
        7 * 24 * 60 * 60 * 1000
    ) {
      record = accessRow;
      targetBankId = accessRow.bank_id;
      valid = true;
    }
  }

  let approvedSubmission: any = null;
  if (valid && targetBankId) {
    // 1. Query approved submission explicitly linked by published_bank_id
    approvedSubmission = await env.DB.prepare(
      "SELECT id,title,report_name,report_key,full_report,published_bank_id,last_updated FROM bank_research_submissions WHERE published_bank_id=? AND workflow_status='Approved' ORDER BY updated_at DESC LIMIT 1",
    )
      .bind(targetBankId)
      .first();

    // 2. If no submission has published_bank_id, check for an approved submission matching bank title
    if (!approvedSubmission && record?.title) {
      const cleanTitle = String(record.title).trim();
      const titleMatches = (
        await env.DB.prepare(
          "SELECT id,title,report_name,report_key,full_report,published_bank_id,last_updated FROM bank_research_submissions WHERE (published_bank_id IS NULL OR published_bank_id='') AND LOWER(TRIM(title))=LOWER(TRIM(?)) AND workflow_status='Approved' ORDER BY updated_at DESC",
        )
          .bind(cleanTitle)
          .all()
      ).results as any[];

      if (titleMatches.length > 0) {
        // Verify unambiguous bank association: exactly 1 bank with this title exists
        const countRow = (await env.DB.prepare(
          'SELECT COUNT(*) AS count FROM banks WHERE LOWER(TRIM(title))=LOWER(TRIM(?))',
        )
          .bind(cleanTitle)
          .first()) as { count?: number } | null;

        if (Number(countRow?.count || 0) === 1) {
          approvedSubmission = titleMatches[0];
          // Backfill association so future queries and token downloads use published_bank_id directly
          await env.DB.prepare(
            'UPDATE bank_research_submissions SET published_bank_id=? WHERE id=?',
          )
            .bind(targetBankId, approvedSubmission.id)
            .run();
        }
      }
    }
  }

  const fullReportText = String(
    record?.full_report || approvedSubmission?.full_report || '',
  ).trim();

  // If banks table full_report was empty but the approved submission has text, heal banks table
  if (!record?.full_report && approvedSubmission?.full_report && targetBankId) {
    await env.DB.prepare(
      'UPDATE banks SET full_report=? WHERE id=? AND (full_report IS NULL OR full_report="")',
    )
      .bind(approvedSubmission.full_report, targetBankId)
      .run();
  }

  const attachedFile =
    approvedSubmission?.report_key &&
    approvedSubmission.report_key.trim().length > 0
      ? {
          id: approvedSubmission.id,
          report_name:
            approvedSubmission.report_name ||
            'Download research report document',
          report_key: approvedSubmission.report_key,
        }
      : null;

  const hasReportContent = Boolean(fullReportText || attachedFile);

  if (!valid || !hasReportContent)
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

  const reportDate =
    record?.last_updated || approvedSubmission?.last_updated || '';
  const dateIntro = reportDate
    ? ` · Last updated ${new Date(`${reportDate}T00:00:00`).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}`
    : '';

  return (
    <InteriorPage
      eyebrow="PROTECTED FULL REPORT"
      title={record.title || 'Bank report'}
      intro={`Private Kav Haribis research report${dateIntro}.`}
    >
      <article className="protectedReport">
        <div className="protectedReportNotice">
          🔒{' '}
          {isOwner
            ? 'Administrator review access confirmed.'
            : isStaff
            ? 'Administrator staff review access confirmed.'
            : premium
            ? `Premium member access confirmed for ${premium.name || premium.email}.`
            : `Access confirmed · This private link expires seven days after it was issued.`}
        </div>
        {fullReportText ? (
          <div className="reportBody">
            {fullReportText
              .split(/\n{2,}/)
              .map((paragraph: string, index: number) => (
                <p key={index}>{paragraph}</p>
              ))}
          </div>
        ) : null}
        {attachedFile && (
          <div className="my-6 p-6 bg-slate-50 border border-slate-200 rounded-xl">
            <h3 className="text-base font-bold text-[#102a43] mb-1">
              Attached Research Document
            </h3>
            <p className="text-sm text-slate-600 mb-4">
              {attachedFile.report_name || 'Download research report document'}
            </p>
            <a
              href={`/api/bank-research-file?id=${encodeURIComponent(attachedFile.id)}&kind=report${token ? `&token=${encodeURIComponent(token)}` : ''}`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#102a43] hover:bg-[#1a385c] text-white text-xs font-bold rounded-lg transition-colors shadow-xs"
            >
              📄 Download Research Report
            </a>
          </div>
        )}
        <a href="/bank-directory">← Return to Bank Directory</a>
      </article>
    </InteriorPage>
  );
}
