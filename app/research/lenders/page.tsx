import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { ensureBankResearch } from '../../lib/directories';
import { researchIdentityFromHeaders } from '../../lib/research-access';
import LenderResearchWorkspace from './research-workspace';
import SpreadsheetGrid from './spreadsheet-grid';
import SpreadsheetImport from './spreadsheet-import';
export const dynamic = 'force-dynamic';
export default async function LenderResearchPage() {
  const { env } = await import('cloudflare:workers');
  await ensureBankResearch(env.DB);
  const identity = await researchIdentityFromHeaders(await headers(), env.DB);
  if (!identity) redirect('/bank-directory?research-access=1');
  const { email, name: researcherName, owner } = identity;
  const result = owner
    ? await env.DB.prepare(
        'SELECT * FROM bank_research_submissions ORDER BY updated_at DESC',
      ).all()
    : await env.DB.prepare(
        'SELECT * FROM bank_research_submissions WHERE researcher_email=? ORDER BY updated_at DESC',
      )
        .bind(email)
        .all();
  return (
    <main className="researchPortal">
      <div className="researchPortalShell">
        <header className="researchPortalHead">
          <a href="/">
            <span>KH</span>
            <b>Kav Haribis</b>
          </a>
          <div>
            <small>PRIVATE RESEARCH WORKSPACE</small>
            <h1>Bank & Lender Research</h1>
            <p>
              Bulk upload a list, type into the quick chart, or use the detailed
              form—then submit the research for approval.
            </p>
          </div>
          <a href={owner ? '/admin/bank-research' : '/bank-directory'}>
            {owner ? 'Administrator review' : 'View website'} →
          </a>
        </header>
        <SpreadsheetImport researcherName={researcherName} />
        <SpreadsheetGrid researcherName={researcherName} />
        <LenderResearchWorkspace
          initialItems={result.results as any}
          researcherName={researcherName}
        />
      </div>
    </main>
  );
}
