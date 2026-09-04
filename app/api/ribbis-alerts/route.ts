import { getRequestEmail, isOwnerRequest } from '../../lib/request-auth';
import { ensureRibbisAlerts, ensureAlertSubscribers, listRibbisAlerts } from '../../lib/directories';
import sendEmail from '../../lib/sendEmail';

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

  let emailsSent = 0;
  try {
    await ensureAlertSubscribers(e.DB);
    const subRes = await e.DB.prepare('SELECT email, name FROM alert_subscribers WHERE active=1').all();
    const emails = (subRes.results || []).map((s: any) => String(s.email).trim()).filter(Boolean);
    if (emails.length > 0) {
      const alertData = {
        title: clean(b.title, 250),
        alert_date: clean(b.alert_date, 50),
        category: clean(b.category, 100),
        severity: clean(b.severity, 100),
        alert_status: clean(b.alert_status, 100),
        summary: clean(b.summary, 10000),
        full_details: clean(b.full_details, 10000),
        action_label: clean(b.action_label, 200),
        action_url: clean(b.action_url, 1000),
      };
      await sendEmail(emails, `Ribbis Alert: ${alertData.title}`, alertData, 'ribbis-alert');
      emailsSent = emails.length;
    }
  } catch (err: any) {
    console.error('Failed to send alert emails to subscribers:', err?.message || err);
  }

  return Response.json({ saved: true, id, emailsSent });
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
