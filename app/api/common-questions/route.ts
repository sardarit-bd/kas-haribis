import { canAccessSection } from '../../lib/admin-access';
import { getRequestEmail } from '../../lib/request-auth';
import { ensureCommonQuestions, listCommonQuestions } from '../../lib/directories';

const clean = (v: unknown, n = 8000) =>
  String(v ?? '')
    .trim()
    .slice(0, n);

async function runtime() {
  return (await import('cloudflare:workers')).env;
}

async function checkAuth(request: Request, db: any) {
  const email = await getRequestEmail(request);
  return canAccessSection(db, email, 'common-questions');
}

export async function GET(request: Request) {
  const e = await runtime();
  const authorized = await checkAuth(request, e.DB);
  const questions = await listCommonQuestions(e.DB, authorized);
  return Response.json({ questions });
}

export async function POST(request: Request) {
  const e = await runtime();
  if (!(await checkAuth(request, e.DB))) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  await ensureCommonQuestions(e.DB);
  const body = (await request.json()) as any;

  const category = clean(body.category, 200) || 'Everyday situations';
  const question = clean(body.question, 1000);
  const answer = clean(body.answer, 10000);

  if (!question) {
    return Response.json({ error: 'Question text is required.' }, { status: 400 });
  }
  if (!answer) {
    return Response.json({ error: 'Answer text is required.' }, { status: 400 });
  }

  const id = clean(body.id, 80) || crypto.randomUUID();
  const now = new Date().toISOString();
  const published = body.published !== false && body.published !== 0 && body.published !== 'false' ? 1 : 0;
  const sortOrder = Number(body.sort_order) || 0;

  await e.DB.prepare(
    'INSERT INTO common_questions(id, category, question, answer, published, sort_order, created_at, updated_at) VALUES(?,?,?,?,?,?,?,?)',
  )
    .bind(id, category, question, answer, published, sortOrder, now, now)
    .run();

  return Response.json({ saved: true, id });
}

export async function PUT(request: Request) {
  const e = await runtime();
  if (!(await checkAuth(request, e.DB))) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  await ensureCommonQuestions(e.DB);
  const body = (await request.json()) as any;
  const id = clean(body.id, 80);

  if (!id) {
    return Response.json({ error: 'Question ID is required.' }, { status: 400 });
  }

  const category = clean(body.category, 200) || 'Everyday situations';
  const question = clean(body.question, 1000);
  const answer = clean(body.answer, 10000);

  if (!question) {
    return Response.json({ error: 'Question text is required.' }, { status: 400 });
  }
  if (!answer) {
    return Response.json({ error: 'Answer text is required.' }, { status: 400 });
  }

  const published = body.published ? 1 : 0;
  const sortOrder = Number(body.sort_order) || 0;

  await e.DB.prepare(
    'UPDATE common_questions SET category=?, question=?, answer=?, published=?, sort_order=?, updated_at=? WHERE id=?',
  )
    .bind(category, question, answer, published, sortOrder, new Date().toISOString(), id)
    .run();

  return Response.json({ saved: true });
}

export async function DELETE(request: Request) {
  const e = await runtime();
  if (!(await checkAuth(request, e.DB))) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const url = new URL(request.url);
  const id = clean(url.searchParams.get('id'), 80);

  if (!id) {
    return Response.json({ error: 'Missing question ID.' }, { status: 400 });
  }

  await ensureCommonQuestions(e.DB);
  await e.DB.prepare('DELETE FROM common_questions WHERE id=?').bind(id).run();

  return Response.json({ deleted: true });
}
