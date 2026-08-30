import { getRequestEmail, isOwnerRequest } from '../../lib/request-auth';
async function database() {
  const { env } = await import('cloudflare:workers');
  return env.DB;
}

async function ensureTable() {
  const db = await database();
  await db
    .prepare(
      `CREATE TABLE IF NOT EXISTS questions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    reference TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT,
    topic TEXT NOT NULL,
    question TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'New',
    notes TEXT,
    created_at TEXT NOT NULL
  )`,
    )
    .run();
}

export async function POST(request: Request) {
  await ensureTable();
  const body = (await request.json()) as Record<string, string>;
  if (!body.name?.trim() || !body.email?.trim() || !body.question?.trim()) {
    return Response.json(
      { error: 'Name, email and question are required.' },
      { status: 400 },
    );
  }
  const reference = `KH-${crypto.randomUUID().slice(0, 8).toUpperCase()}`;
  const db = await database();
  await db
    .prepare(
      'INSERT INTO questions (reference,name,email,phone,topic,question,status,created_at) VALUES (?,?,?,?,?,?,?,?)',
    )
    .bind(
      reference,
      body.name.trim(),
      body.email.trim(),
      body.phone?.trim() || null,
      body.topic || 'Other',
      body.question.trim(),
      'New',
      new Date().toISOString(),
    )
    .run();
  return Response.json({ reference });
}

export async function GET(request: Request) {
  if (!(await isOwnerRequest(request)))
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  await ensureTable();
  const db = await database();
  const result = await db
    .prepare('SELECT * FROM questions ORDER BY id DESC')
    .all();
  return Response.json({ questions: result.results });
}
