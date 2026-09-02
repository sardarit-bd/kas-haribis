import { ADMIN_OWNER } from '../../lib/admin-access';
import { getRequestEmail, isOwnerRequest } from '../../lib/request-auth';
import sendEmail from '../../lib/sendEmail';

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
  const name = body.name?.trim() || '';
  const email = body.email?.trim() || '';
  const question = body.question?.trim() || '';
  const phone = body.phone?.trim() || '';
  const topic = body.topic?.trim() || 'Other';

  if (!name || !email || !question) {
    return Response.json(
      { error: 'Name, email and question are required.' },
      { status: 400 },
    );
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return Response.json(
      { error: 'Enter a valid email address.' },
      { status: 400 },
    );
  }

  const reference = `KH-Q-${crypto.randomUUID().slice(0, 8).toUpperCase()}`;
  const now = new Date().toISOString();
  const db = await database();

  await db
    .prepare(
      'INSERT INTO questions (reference,name,email,phone,topic,question,status,created_at) VALUES (?,?,?,?,?,?,?,?)',
    )
    .bind(
      reference,
      name,
      email,
      phone || null,
      topic,
      question,
      'New',
      now,
    )
    .run();

  const emailData = {
    id: reference,
    reference,
    name,
    email,
    phone: phone || 'N/A',
    topic,
    question,
    created_at: now,
  };

  try {
    await sendEmail(
      ADMIN_OWNER,
      `New Bais Horaah Question (${reference})`,
      emailData,
      'bais-horaah-question',
    );
  } catch (err) {
    console.error('Error sending Bais Horaah question email notification:', err);
  }

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
