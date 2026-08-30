import { getRequestEmail, isOwnerRequest } from '../../lib/request-auth';
import { ensureRibbisAlerts, listRibbisAlerts } from '../../lib/directories';
const clean = (v: unknown, n = 8000) =>
    String(v ?? '')
      .trim()
      .slice(0, n);
const fields = [
  'title',
  'alert_date',
  'category',
  'severity',
  'alert_status',
  'reviewed_by',
  'expires_at',
  'summary',
  'full_details',
  'action_label',
  'action_url',
];
async function runtime() {
  return (await import('cloudflare:workers')).env;
}
export async function GET(r: Request) {
  const e = await runtime();
  return Response.json({ alerts: await listRibbisAlerts(e.DB, (await isOwnerRequest(r))) });
}
export async function POST(r: Request) {
  if (!(await isOwnerRequest(r)))
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  const e = await runtime(),
    b = (await r.json()) as any;
  await ensureRibbisAlerts(e.DB);
  if (!clean(b.title, 250))
    return Response.json({ error: 'Enter the alert title.' }, { status: 400 });
  const id = crypto.randomUUID(),
    now = new Date().toISOString(),
    v = fields.map((f) =>
      clean(b[f], f === 'summary' || f === 'full_details' ? 10000 : 800),
    );
  await e.DB.prepare(
    `INSERT INTO ribbis_alerts(id,${fields.join(',')},published,featured,sort_order,created_at,updated_at) VALUES(${Array(
      fields.length + 6,
    )
      .fill('?')
      .join(',')})`,
  )
    .bind(
      id,
      ...v,
      b.published ? 1 : 0,
      b.featured ? 1 : 0,
      Number(b.sort_order) || 0,
      now,
      now,
    )
    .run();
  return Response.json({ saved: true, id });
}
export async function PUT(r: Request) {
  if (!(await isOwnerRequest(r)))
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  const e = await runtime(),
    b = (await r.json()) as any,
    id = clean(b.id, 100);
  await ensureRibbisAlerts(e.DB);
  if (!id || !clean(b.title, 250))
    return Response.json({ error: 'Enter the alert title.' }, { status: 400 });
  const v = fields.map((f) =>
    clean(b[f], f === 'summary' || f === 'full_details' ? 10000 : 800),
  );
  await e.DB.prepare(
    `UPDATE ribbis_alerts SET ${fields.map((f) => `${f}=?`).join(',')},published=?,featured=?,sort_order=?,updated_at=? WHERE id=?`,
  )
    .bind(
      ...v,
      b.published ? 1 : 0,
      b.featured ? 1 : 0,
      Number(b.sort_order) || 0,
      new Date().toISOString(),
      id,
    )
    .run();
  return Response.json({ saved: true });
}
export async function DELETE(r: Request) {
  if (!(await isOwnerRequest(r)))
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  const e = await runtime(),
    id = clean(new URL(r.url).searchParams.get('id'), 100);
  await ensureRibbisAlerts(e.DB);
  await e.DB.prepare('DELETE FROM ribbis_alerts WHERE id=?').bind(id).run();
  return Response.json({ deleted: true });
}
