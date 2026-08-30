import { getRequestEmail, isOwnerRequest } from '../../lib/request-auth';
import { ensureAlertSubscribers } from '../../lib/directories';
const clean = (v: unknown, n = 300) =>
  String(v ?? '')
    .trim()
    .slice(0, n);
export async function POST(r: Request) {
  const { env } = await import('cloudflare:workers'),
    b = (await r.json()) as any,
    email = clean(b.email).toLowerCase();
  await ensureAlertSubscribers(env.DB);
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
    return Response.json(
      { error: 'Enter a valid email address.' },
      { status: 400 },
    );
  await env.DB.prepare(
    'INSERT INTO alert_subscribers(id,email,name,active,created_at) VALUES(?,?,?,1,?) ON CONFLICT(email) DO UPDATE SET name=excluded.name,active=1',
  )
    .bind(
      crypto.randomUUID(),
      email,
      clean(b.name, 200),
      new Date().toISOString(),
    )
    .run();
  return Response.json({ subscribed: true });
}
export async function GET(r: Request) {
  if (
    !(await isOwnerRequest(r))
  )
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  const { env } = await import('cloudflare:workers');
  await ensureAlertSubscribers(env.DB);
  const q = await env.DB.prepare(
    'SELECT * FROM alert_subscribers ORDER BY created_at DESC',
  ).all();
  return Response.json({ subscribers: q.results });
}
export async function DELETE(r: Request) {
  if (
    !(await isOwnerRequest(r))
  )
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  const { env } = await import('cloudflare:workers'),
    id = new URL(r.url).searchParams.get('id') || '';
  await ensureAlertSubscribers(env.DB);
  await env.DB.prepare('DELETE FROM alert_subscribers WHERE id=?')
    .bind(id)
    .run();
  return Response.json({ deleted: true });
}
