import { getRequestEmail, isOwnerRequest } from '../../lib/request-auth';
import { ensureAlertTips } from '../../lib/directories';
const clean = (v: unknown, n = 8000) =>
    String(v ?? '')
      .trim()
      .slice(0, n);
async function runtime() {
  return (await import('cloudflare:workers')).env;
}
export async function GET(r: Request) {
  if (!(await isOwnerRequest(r)))
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  const e = await runtime();
  await ensureAlertTips(e.DB);
  const q = await e.DB.prepare(
    'SELECT * FROM alert_tips ORDER BY created_at DESC',
  ).all();
  return Response.json({ tips: q.results });
}
export async function POST(r: Request) {
  const e = await runtime(),
    b = (await r.json()) as any;
  await ensureAlertTips(e.DB);
  const tip = clean(b.tip, 12000);
  if (tip.length < 20)
    return Response.json(
      {
        error:
          'Please provide enough detail for Kav Haribis to review the tip.',
      },
      { status: 400 },
    );
  const id = crypto.randomUUID(),
    reference = `RA-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${Math.random().toString(36).slice(2, 7).toUpperCase()}`,
    now = new Date().toISOString();
  await e.DB.prepare(
    "INSERT INTO alert_tips(id,reference,name,email,phone,topic,organization,tip,source_url,status,notes,created_at,updated_at) VALUES(?,?,?,?,?,?,?,?,?,'New','',?,?)",
  )
    .bind(
      id,
      reference,
      clean(b.name, 200),
      clean(b.email, 300),
      clean(b.phone, 80),
      clean(b.topic, 200),
      clean(b.organization, 300),
      tip,
      clean(b.source_url, 1000),
      now,
      now,
    )
    .run();
  return Response.json({ submitted: true, reference });
}
export async function PUT(r: Request) {
  if (!(await isOwnerRequest(r)))
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  const e = await runtime(),
    b = (await r.json()) as any;
  await ensureAlertTips(e.DB);
  await e.DB.prepare(
    'UPDATE alert_tips SET status=?,notes=?,updated_at=? WHERE id=?',
  )
    .bind(
      clean(b.status, 50),
      clean(b.notes, 10000),
      new Date().toISOString(),
      clean(b.id, 100),
    )
    .run();
  return Response.json({ saved: true });
}
export async function DELETE(r: Request) {
  if (!(await isOwnerRequest(r)))
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  const e = await runtime();
  await ensureAlertTips(e.DB);
  await e.DB.prepare('DELETE FROM alert_tips WHERE id=?')
    .bind(clean(new URL(r.url).searchParams.get('id'), 100))
    .run();
  return Response.json({ deleted: true });
}
