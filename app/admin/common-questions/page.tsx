import ProductBreadcrumb from '../../componnent/ProductBreadcrumb';
import { requireChatGPTUser } from '../../chatgpt-auth';
import { listCommonQuestions } from '../../lib/directories';
import { canAccessSection } from '../../lib/admin-access';
import CommonQuestionsManager from './common-questions-manager';

export const dynamic = 'force-dynamic';

const breadcrumbs = [
  { label: 'Dashboard', href: '/admin' },
  { label: 'Common Questions', href: '/admin/common-questions' },
];

export default async function CommonQuestionsAdminPage() {
  const user = await requireChatGPTUser('/admin/common-questions');
  const { env } = await import('cloudflare:workers');

  if (!(await canAccessSection(env.DB, user.email, 'common-questions'))) {
    return (
      <main className="adminPage">
        <div className="adminShell">
          <h1>Not authorized</h1>
          <p>You do not have permission to view or manage Common Questions.</p>
        </div>
      </main>
    );
  }

  const items = await listCommonQuestions(env.DB, true);

  return (
    <main className="adminPage">
      <div className="adminShell">
        <ProductBreadcrumb breadcrumbs={breadcrumbs} backbtn={true} />
        <div className="adminHeading">
          <div>
            <h1>Common Questions</h1>
            <p>Add, edit, publish, and organize public FAQ and common halacha questions.</p>
          </div>
          <a href="/questions" target="_blank" rel="noreferrer" className="text-amber-600 hover:text-amber-800 text-sm font-semibold">
            View public page →
          </a>
        </div>
        <CommonQuestionsManager initialItems={items as any[]} />
      </div>
    </main>
  );
}
