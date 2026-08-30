import ProductBreadcrumb from '../../componnent/ProductBreadcrumb';
import { requireChatGPTUser } from '../../chatgpt-auth';
import { ensureBankResearch } from '../../lib/directories';
import { ensureResearchAccess } from '../../lib/research-access';
import BankResearchReview from './review-manager';
export const dynamic = 'force-dynamic';

const breadcrumbs = [
  { label: 'Dashboard', href: '/admin' },
  { label: 'Bank Research Review', href: '/admin/bank-research' },
];

export default async function BankResearchAdmin() {
  const user = await requireChatGPTUser('/admin/bank-research'),
    email = user.email.toLowerCase(),
    owner = email === 'mdemong87@gmail.com';
  const { env } = await import('cloudflare:workers');
  await Promise.all([ensureBankResearch(env.DB), ensureResearchAccess(env.DB)]);
  const reviewer =
    owner ||
    Boolean(
      await env.DB.prepare(
        'SELECT email FROM bank_research_reviewers WHERE email=? AND active=1',
      )
        .bind(email)
        .first(),
    );
  if (!reviewer)
    return (
      <main className="adminPage">
        <div className="adminShell">
          <h1>Not authorized</h1>
          <p>Your account does not have bank-research review access.</p>
        </div>
      </main>
    );
  const [submissions, researchers, reviewers] = await Promise.all([
    env.DB.prepare(
      "SELECT * FROM bank_research_submissions ORDER BY CASE workflow_status WHEN 'Submitted' THEN 0 WHEN 'Reviewer approved' THEN 1 WHEN 'Changes requested' THEN 2 WHEN 'Draft' THEN 3 ELSE 4 END,updated_at DESC",
    ).all(),
    owner
      ? env.DB.prepare(
          'SELECT r.*,CASE WHEN c.email IS NULL THEN 0 ELSE 1 END AS code_configured,c.access_type,c.expires_at,c.updated_at AS code_updated_at FROM bank_researchers r LEFT JOIN bank_researcher_credentials c ON c.email=r.email ORDER BY r.active DESC,r.name COLLATE NOCASE,r.email COLLATE NOCASE',
        ).all()
      : Promise.resolve({ results: [] }),
    owner
      ? env.DB.prepare(
          'SELECT * FROM bank_research_reviewers ORDER BY active DESC,name COLLATE NOCASE,email COLLATE NOCASE',
        ).all()
      : Promise.resolve({ results: [] }),
  ]);
  return (
    <main className="adminPage">
      <div className="adminShell">
        <ProductBreadcrumb breadcrumbs={breadcrumbs} backbtn={true} />
        <div className="adminHeading">
          <div>
            <h1>Bank Research Review</h1>
            <p>
              {owner
                ? 'Review lender research, manage the research team, and control what is published live.'
                : 'Review submitted lender research and forward completed records for final owner approval.'}
            </p>
          </div>
          <a href="/research/lenders">Open researcher workspace →</a>
        </div>
        <BankResearchReview
          initialItems={submissions.results as any}
          initialResearchers={researchers.results as any}
          initialReviewers={reviewers.results as any}
          currentUser={{
            email,
            name: user.fullName || user.displayName || email,
          }}
          owner={owner}
        />
      </div>
    </main>
  );
}
