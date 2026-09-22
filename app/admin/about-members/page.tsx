import ProductBreadcrumb from '../../componnent/ProductBreadcrumb';
import { requireChatGPTUser } from '../../chatgpt-auth';
import { listAboutMembers } from '../../lib/directories';
import { canAccessSection } from '../../lib/admin-access';
import AboutMembersManager from './about-members-manager';

export const dynamic = 'force-dynamic';

const breadcrumbs = [
  { label: 'Dashboard', href: '/admin' },
  { label: 'About Us Team', href: '/admin/about-members' },
];

export default async function AboutMembersAdminPage() {
  const user = await requireChatGPTUser('/admin/about-members');
  const { env } = await import('cloudflare:workers');

  if (!(await canAccessSection(env.DB, user.email, 'about-members'))) {
    return (
      <main className="adminPage">
        <div className="adminShell">
          <h1>Not authorized</h1>
          <p>You do not have permission to view or manage About Us Team members.</p>
        </div>
      </main>
    );
  }

  const items = await listAboutMembers(env.DB, true);

  return (
    <main className="adminPage">
      <div className="adminShell">
        <ProductBreadcrumb breadcrumbs={breadcrumbs} backbtn={true} />
        <div className="adminHeading">
          <div>
            <h1>About Us Team & Specialists</h1>
            <p>Add, edit, publish, and organize team members, research team, and specialists for the About Us page.</p>
          </div>
          <a href="/about-us" target="_blank" rel="noreferrer" className="text-amber-600 hover:text-amber-800 text-sm font-semibold">
            View public page →
          </a>
        </div>
        <AboutMembersManager initialItems={items as any[]} />
      </div>
    </main>
  );
}
