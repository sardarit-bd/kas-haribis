import { requireChatGPTUser } from '../../chatgpt-auth';
import ProductBreadcrumb from '../../componnent/ProductBreadcrumb';
import { canAccessSection } from "../../lib/admin-access";
import { listEducationalResources } from '../../lib/directories';
import EducationalManager from './educational-manager';
export const dynamic = 'force-dynamic';

const breadcrumbs = [
  { label: 'Dashboard', href: '/admin' },
  { label: 'Educational Center', href: '/admin/educational-center' },
];

export default async function Page() {
  const { env } = await import('cloudflare:workers');
  const user = await requireChatGPTUser('/admin/educational-center');
  if (!(await canAccessSection(env.DB, user.email, 'educational-center')))
    return (
      <main className="adminPage">
        <div className="adminShell">
          <h1>Not authorized</h1>
        </div>
      </main>
    );
  return (
    <main className="adminPage">
      <div className="adminShell">
        <ProductBreadcrumb breadcrumbs={breadcrumbs} backbtn={true} />
        <div className="adminHeading">
          <div>
            <h1>Educational Center</h1>
            <p>
              Upload, edit, hide, feature, and publish coloring pages and PDF
              materials.
            </p>
          </div>
          <a href="/educational-center">View public page →</a>
        </div>
        <EducationalManager
          initialItems={(await listEducationalResources(env.DB, true)) as any}
        />
      </div>
    </main>
  );
}
