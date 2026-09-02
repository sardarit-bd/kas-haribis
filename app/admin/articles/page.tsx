import ProductBreadcrumb from '../../componnent/ProductBreadcrumb';
import { requireChatGPTUser } from '../../chatgpt-auth';
import { listArticles } from '../../lib/directories';
import { canAccessSection } from "../../lib/admin-access";
import ArticleManager from './article-manager';
export const dynamic = 'force-dynamic';

const breadcrumbs = [
  { label: 'Dashboard', href: '/admin' },
  { label: 'Articles & Gilyonos', href: '/admin/articles' },
];

export default async function Page() {
  const u = await requireChatGPTUser('/admin/articles');
  const { env } = await import('cloudflare:workers');
  if (!(await canAccessSection(env.DB, u.email, 'articles')))
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
            <h1>Articles & Gilyonos</h1>
            <p>Upload and manage complete PDF publications.</p>
          </div>
          <a href="/articles">View public library →</a>
        </div>
        <ArticleManager
          initialItems={(await listArticles(env.DB, true)) as any}
        />
      </div>
    </main>
  );
}
