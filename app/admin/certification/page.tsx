import { requireChatGPTUser } from '../../chatgpt-auth';
import ProductBreadcrumb from '../../componnent/ProductBreadcrumb';
import { ensureCertificationApplications } from '../../lib/certification-applications';
import CertificationAdmin from './certification-admin';
import { canAccessSection } from "../../lib/admin-access";
export const dynamic = 'force-dynamic';

const breadcrumbs = [
  { label: 'Dashboard', href: '/admin' },
  { label: 'Investment Certification', href: '/admin/certification' },
];

export default async function Page() {
  const { env } = await import('cloudflare:workers');
  const user = await requireChatGPTUser('/admin/certification');
  if (!(await canAccessSection(env.DB, user.email, 'certification')))
    return (
      <main className="adminPage">
        <div className="adminShell">
          <h1>Not authorized</h1>
        </div>
      </main>
    );
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
