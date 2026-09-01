import { requireChatGPTUser } from '../../chatgpt-auth';
import ProductBreadcrumb from '../../componnent/ProductBreadcrumb';
import { isOwnerEmail } from "../../lib/admin-access";
import { ensureContactSubmissions } from '../../lib/contact-submissions';
import SubmissionInbox from './submission-inbox';
export const dynamic = 'force-dynamic';

const breadcrumbs = [
  { label: 'Dashboard', href: '/admin' },
  { label: 'Submissions & Inquiries', href: '/admin/submissions' },
];

export default async function SubmissionsPage() {
  const { env } = await import('cloudflare:workers');
  await ensureContactSubmissions(env.DB);

  const user = await requireChatGPTUser('/admin/submissions');
  console.log(user);
  if (!isOwnerEmail(user.email))
    return (
      <main className="adminPage">
        <div className="adminShell">
          <h1>Not authorized</h1>
        </div>
      </main>
    );


  // const { env } = await import('cloudflare:workers');
  // await ensureContactSubmissions(env.DB);
  const result = await env.DB.prepare(
    'SELECT * FROM contact_submissions ORDER BY created_at DESC',
  ).all();
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
