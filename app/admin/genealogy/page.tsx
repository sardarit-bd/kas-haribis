import { requireChatGPTUser } from '../../chatgpt-auth';
import ProductBreadcrumb from '../../componnent/ProductBreadcrumb';
import { ensureContactSubmissions } from '../../lib/contact-submissions';
import SubmissionInbox from '../submissions/submission-inbox';
import { isOwnerEmail } from "../../lib/admin-access";

export const dynamic = 'force-dynamic';

const breadcrumbs = [
  { label: 'Dashboard', href: '/admin' },
  { label: 'Genealogy Inquiries', href: '/admin/genealogy' },
];

export default async function GenealogyAdminPage() {
  const user = await requireChatGPTUser('/admin/genealogy');
  if (!isOwnerEmail(user.email))
    return (
      <main className="adminPage">
        <div className="adminShell">
          <h1>Not authorized</h1>
        </div>
      </main>
    );
  const { env } = await import('cloudflare:workers');
  await ensureContactSubmissions(env.DB);
  const result = await env.DB.prepare(
    'SELECT * FROM contact_submissions WHERE topic = ? ORDER BY created_at DESC',
  )
    .bind('Genealogy research request')
    .all();
  return (
    <main className="adminPage">
      <div className="adminShell">
        <ProductBreadcrumb breadcrumbs={breadcrumbs} backbtn={true} />
        <div className="adminHeading">
          <div>
            <h1>Genealogy requests</h1>
            <p>
              Review research inquiries, supporting documents, statuses, and
              private notes.
            </p>
          </div>
          <a href="/genealogy-services">View service page →</a>
        </div>
        <SubmissionInbox
          initialItems={result.results as any}
          mode="genealogy"
        />
      </div>
    </main>
  );
}
