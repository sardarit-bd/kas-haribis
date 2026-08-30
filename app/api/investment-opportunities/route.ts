import { getRequestEmail, isOwnerRequest } from '../../lib/request-auth';
import { ensureInvestments, listInvestments } from '../../lib/directories';
const clean = (v: unknown, n = 6000) =>
    String(v ?? '')
      .trim()
      .slice(0, n);
const fields = [
  'opportunity_name',
  'sponsor_name',
  'investment_type',
  'description',
  'minimum_investment',
  'return_information',
  'investment_term',
  'location',
  'availability_status',
  'kosher_status',
  'rabbinical_oversight',
  'kosher_details',
  'last_reviewed',
  'risk_disclosure',
  'contact_name',
  'phone',
  'email',
  'opportunity_url',
  'logo_url',
  'public_notes',
  'internal_notes',
];
async function runtime() {
  return (await import('cloudflare:workers')).env;
}
export async function GET(r: Request) {
  const e = await runtime();
  return Response.json({
    opportunities: await listInvestments(e.DB, (await isOwnerRequest(r))),
  });
}
export async function POST(r: Request) {
  if (!(await isOwnerRequest(r)))
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  const e = await runtime(),
    b = (await r.json()) as any;
  await ensureInvestments(e.DB);
  if (!clean(b.opportunity_name, 200))
    return Response.json(
      { error: 'Enter the opportunity name.' },
      { status: 400 },
    );
  const id = crypto.randomUUID(),
    now = new Date().toISOString(),
    values = fields.map((f) =>
      clean(
        b[f],
        f.includes('details') ||
          f.includes('notes') ||
          f === 'description' ||
          f === 'risk_disclosure'
          ? 10000
          : 700,
      ),
    );
  await e.DB.prepare(
    `INSERT INTO investment_opportunities(id,${fields.join(',')},published,featured,sort_order,created_at,updated_at) VALUES(${Array(
      fields.length + 6,
    )
      .fill('?')
      .join(',')})`,
  )
    .bind(
      id,
      ...values,
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
  await ensureInvestments(e.DB);
  if (!id || !clean(b.opportunity_name, 200))
    return Response.json(
      { error: 'Enter the opportunity name.' },
      { status: 400 },
    );
  const values = fields.map((f) =>
    clean(
      b[f],
      f.includes('details') ||
        f.includes('notes') ||
        f === 'description' ||
        f === 'risk_disclosure'
        ? 10000
        : 700,
    ),
  );
  await e.DB.prepare(
    `UPDATE investment_opportunities SET ${fields.map((f) => `${f}=?`).join(',')},published=?,featured=?,sort_order=?,updated_at=? WHERE id=?`,
  )
    .bind(
      ...values,
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
  await ensureInvestments(e.DB);
  await e.DB.prepare('DELETE FROM investment_opportunities WHERE id=?')
    .bind(id)
    .run();
  await e.BUCKET.delete(`investment-logos/${id}`);
  return Response.json({ deleted: true });
}
