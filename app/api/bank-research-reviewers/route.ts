import { getRequestEmail, isOwnerRequest } from '../../lib/request-auth';
import { ADMIN_OWNER } from '../../lib/admin-access';
import { ensureBankResearch } from '../../lib/directories';
const OWNER = ADMIN_OWNER;
const clean = (v: unknown, n = 300) =>
  String(v ?? '')
    .trim()
    .slice(0, n);
async function runtime() {
  const { env } = await import('cloudflare:workers');
  await ensureBankResearch(env.DB);
  return env;
}
export async function GET(request: Request) {
  if (!(await isOwnerRequest(request)))
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  const env = await runtime(),
    result = await env.DB.prepare(
      'SELECT * FROM bank_research_reviewers ORDER BY active DESC,name COLLATE NOCASE,email COLLATE NOCASE',
    ).all();
  return Response.json({ reviewers: result.results });
}
export async function POST(request: Request) {
  if (!(await isOwnerRequest(request)))
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  const env = await runtime(),
    b = (await request.json()) as any,
    email = clean(b.email).toLowerCase(),
    name = clean(b.name, 200);
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
    return Response.json(
      { error: 'Enter a valid reviewer email.' },
      { status: 400 },
    );
  if (email === OWNER)
    return Response.json(
      { error: 'The owner already has full review and publishing access.' },
      { status: 400 },
    );
  await env.DB.prepare(
    'INSERT INTO bank_research_reviewers(email,name,active,created_at) VALUES(?,?,1,?) ON CONFLICT(email) DO UPDATE SET name=excluded.name,active=1',
  )
    .bind(email, name, new Date().toISOString())
    .run();
  return Response.json({ saved: true });
}
export async function PUT(request: Request) {
  if (!(await isOwnerRequest(request)))
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  const env = await runtime(),
    b = (await request.json()) as any;
  await env.DB.prepare(
    'UPDATE bank_research_reviewers SET name=?,active=? WHERE email=?',
  )
    .bind(clean(b.name, 200), b.active ? 1 : 0, clean(b.email).toLowerCase())
    .run();
  return Response.json({ saved: true });
}
export async function DELETE(request: Request) {
  if (!(await isOwnerRequest(request)))
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  const env = await runtime(),
    email = clean(new URL(request.url).searchParams.get('email')).toLowerCase();
  await env.DB.prepare('DELETE FROM bank_research_reviewers WHERE email=?')
    .bind(email)
    .run();
  return Response.json({ deleted: true });
}
