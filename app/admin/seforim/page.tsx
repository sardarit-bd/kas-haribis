import ProductBreadcrumb from '../../componnent/ProductBreadcrumb';
import { requireChatGPTUser } from '../../chatgpt-auth';
import { listSeforim } from '../../lib/seforim';
import { canAccessSection } from "../../lib/admin-access";
import SeforimManager from './seforim-manager';
export const dynamic = 'force-dynamic';

const breadcrumbs = [
  { label: 'Dashboard', href: '/admin' },
  { label: 'Seforim Catalog', href: '/admin/seforim' },
];

export default async function SeforimAdmin() {
  const user = await requireChatGPTUser('/admin/seforim');
  const { env } = await import('cloudflare:workers');
  if (!(await canAccessSection(env.DB, user.email, 'seforim')))
    return (
      <main className="adminPage">
        <div className="adminShell">
          <h1>Administrator access</h1>
          <p>This account is not authorized to access this section.</p>
        </div>
      </main>
    );
  const books = await listSeforim(env.DB);
  return (
    <main className="adminPage">
      <div className="adminShell">
        <ProductBreadcrumb breadcrumbs={breadcrumbs} backbtn={true} />
        <div className="adminHeading">
          <div>
            <h1>Seforim Manager</h1>
            <p>
              Manage printed books and protected PDF editions, including
              separate prices, cover images, and PDF files.
            </p>
          </div>
          <a href="/seforim">View public catalog →</a>
        </div>
        <SeforimManager initialBooks={books} />
      </div>
    </main>
  );
}
