import { requireChatGPTUser } from '../../chatgpt-auth';
import ProductBreadcrumb from '../../componnent/ProductBreadcrumb';
import { canAccessSection } from "../../lib/admin-access";

export const dynamic = 'force-dynamic';

const breadcrumbs = [
  { label: 'Dashboard', href: '/admin' },
  { label: 'Halacha Questions', href: '/admin/questions' },
];

export default async function QuestionsAdmin() {
  const user = await requireChatGPTUser('/admin/questions');
  const { env } = await import('cloudflare:workers');
  if (!(await canAccessSection(env.DB, user.email, 'questions')))
    return (
      <main className="adminPage">
        <div className="adminShell">
          <h1>Not authorized</h1>
        </div>
      </main>
    );
  await env.DB.prepare(
    `CREATE TABLE IF NOT EXISTS questions (id INTEGER PRIMARY KEY AUTOINCREMENT, reference TEXT NOT NULL UNIQUE, name TEXT NOT NULL, email TEXT NOT NULL, phone TEXT, topic TEXT NOT NULL, question TEXT NOT NULL, status TEXT NOT NULL DEFAULT 'New', notes TEXT, created_at TEXT NOT NULL)`,
  ).run();
  const result = await env.DB.prepare(
    'SELECT * FROM questions ORDER BY id DESC',
  ).all();
  const rows = result.results as Array<Record<string, string>>;
  return (
    <main className="adminPage">
      <div className="adminShell">
        <ProductBreadcrumb breadcrumbs={breadcrumbs} backbtn={true} />
        <div className="adminHeading">
          <div>
            <h1>Question inbox</h1>
          </div>
          <span className="countBadge">{rows.length} submissions</span>
        </div>
        {rows.length === 0 ? (
          <div className="emptyState">
            <b>No questions yet</b>
            <p>New website submissions will appear here automatically.</p>
          </div>
        ) : (
          <div className="questionList">
            {rows.map((row) => (
              <article key={row.id}>
                <div>
                  <b>{row.reference}</b>
                  <span>{row.status}</span>
                </div>
                <h2>{row.topic}</h2>
                <p>{row.question}</p>
                <small>
                  {row.name} · {row.email}
                  {row.phone ? ` · ${row.phone}` : ''}
                </small>
              </article>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
