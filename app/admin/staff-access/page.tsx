import ProductBreadcrumb from '../../componnent/ProductBreadcrumb';
import { requireChatGPTUser } from '../../chatgpt-auth';
import {
  ADMIN_OWNER,
  ADMIN_SECTIONS,
  ensureAdminStaff,
} from '../../lib/admin-access';
import StaffAccessManager from './staff-access-manager';
export const dynamic = 'force-dynamic';

const breadcrumbs = [
  { label: 'Dashboard', href: '/admin' },
  { label: 'Staff Access Control', href: '/admin/staff-access' },
];

export default async function StaffAccessPage() {
  const user = await requireChatGPTUser('/admin/staff-access');
  if (user.email.toLowerCase() !== ADMIN_OWNER)
    return (
      <main className="adminPage">
        <div className="adminShell">
          <h1>Not authorized</h1>
        </div>
      </main>
    );
  const { env } = await import('cloudflare:workers');
  await ensureAdminStaff(env.DB);
  const result = await env.DB.prepare(
    'SELECT * FROM admin_staff_access ORDER BY active DESC,name COLLATE NOCASE,email COLLATE NOCASE',
  ).all();
  return (
    <main className="adminPage">
      <div className="adminShell">
        <ProductBreadcrumb breadcrumbs={breadcrumbs} backbtn={true} />
        <div className="adminHeading">
          <div>
            <h1>Staff Access</h1>
            <p>
              Choose exactly which parts of the administration each person may
              use.
            </p>
          </div>
        </div>
        <StaffAccessManager
          initialStaff={result.results as any}
          sections={ADMIN_SECTIONS as any}
        />
      </div>
    </main>
  );
}
