import { requireChatGPTUser } from '../../chatgpt-auth';
import ProductBreadcrumb from '../../componnent/ProductBreadcrumb';
import { canAccessSection } from "../../lib/admin-access";
import { ensureContactSubmissions } from '../../lib/contact-submissions';
import SubmissionInbox from './submission-inbox';
export const dynamic = 'force-dynamic';

const breadcrumbs = [
  { label: 'Dashboard', href: '/admin' },
  { label: 'Submissions & Inquiries', href: '/admin/submissions' },
];

export default async function SubmissionsPage() {
  const { env } = await import('cloudflare:workers');
  const user = await requireChatGPTUser('/admin/submissions');
  if (!(await canAccessSection(env.DB, user.email, 'submissions')))
    return (
      <main className="adminPage">
        <div className="adminShell">
          <h1>Not authorized</h1>
        </div>
      </main>
    );

  let result: any;
  try {
    result = await env.DB.prepare(
      'SELECT * FROM contact_submissions ORDER BY created_at DESC',
    ).all();
  } catch (err: any) {
    if (String(err).toLowerCase().includes('no such table')) {
      await ensureContactSubmissions(env.DB);
      result = await env.DB.prepare(
        'SELECT * FROM contact_submissions ORDER BY created_at DESC',
      ).all();
    } else {
      throw err;
    }
  }
  return (
    <main className="adminPage">
      <div className="adminShell">

        <ProductBreadcrumb breadcrumbs={breadcrumbs} backbtn={true}/>


        <div className="adminHeading">
          <div>
            <h1>Submission inbox</h1>
            <p>
              Review messages, documents, bank updates, program requests, and
              service inquiries.
            </p>
          </div>
          <a href="/contact">View contact hub →</a>
        </div>
        <SubmissionInbox initialItems={result.results as any} />
      </div>
    </main>
  );
}
