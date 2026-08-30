import ProductBreadcrumb from '../../componnent/ProductBreadcrumb';
import { requireChatGPTUser } from '../../chatgpt-auth';
import { ensureCertificationApplications } from '../../lib/certification-applications';
import CertificationAdmin from './certification-admin';
export const dynamic = 'force-dynamic';

const breadcrumbs = [
  { label: 'Dashboard', href: '/admin' },
  { label: 'Certification Applications', href: '/admin/certification' },
];

export default async function Page() {
  const user = await requireChatGPTUser('/admin/certification');
  if (user.email.toLowerCase() !== 'mdemong87@gmail.com')
    return (
      <main className="adminPage">
        <div className="adminShell">
          <h1>Not authorized</h1>
        </div>
      </main>
    );
  const { env } = await import('cloudflare:workers');
  await ensureCertificationApplications(env.DB);
  const result = await env.DB.prepare(
    'SELECT * FROM certification_applications ORDER BY created_at DESC',
  ).all();
  return (
    <main className="adminPage">
      <div className="adminShell">
        <ProductBreadcrumb breadcrumbs={breadcrumbs} backbtn={true} />
        <div className="adminHeading">
          <div>
            <h1>Certification applications</h1>
            <p>
              Review applications, supporting documents, outcomes, and private
              notes.
            </p>
          </div>
          <a href="/kosher-investment-certification">View public page →</a>
        </div>
        <CertificationAdmin initialItems={result.results as any} />
      </div>
    </main>
  );
}
