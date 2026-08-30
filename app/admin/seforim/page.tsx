import ProductBreadcrumb from '../../componnent/ProductBreadcrumb';
import { requireChatGPTUser } from '../../chatgpt-auth';
import { listSeforim } from '../../lib/seforim';
import SeforimManager from './seforim-manager';
export const dynamic = 'force-dynamic';

const breadcrumbs = [
  { label: 'Dashboard', href: '/admin' },
  { label: 'Seforim Manager', href: '/admin/seforim' },
];

export default async function SeforimAdmin() {
  const user = await requireChatGPTUser('/admin/seforim');
  if (user.email.toLowerCase() !== 'mdemong87@gmail.com')
    return (
      <main className="adminPage">
        <div className="adminShell">
          <h1>Administrator access</h1>
          <p>This account is not authorized.</p>
        </div>
      </main>
    );
  const { env } = await import('cloudflare:workers');
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
