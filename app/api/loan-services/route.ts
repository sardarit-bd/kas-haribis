import { getRequestEmail, isOwnerRequest } from '../../lib/request-auth';
import { ensureLoanServices, listLoanServices } from '../../lib/directories';
const clean = (v: unknown, n = 4000) =>
    String(v ?? '')
      .trim()
      .slice(0, n);
const fields = [
  'name',
  'contact_name',
  'service_type',
  'description',
  'specialties',
  'address',
  'city',
  'state',
  'zip',
  'service_area',
  'phone',
  'email',
  'website',
  'logo_url',
  'rabbinical_oversight',
  'kosher_details',
  'verification_status',
  'last_verified',
  'public_notes',
  'internal_notes',
];
async function runtime() {
  return (await import('cloudflare:workers')).env;
}
export async function GET(r: Request) {
  const e = await runtime();
  return Response.json({ services: await listLoanServices(e.DB, (await isOwnerRequest(r))) });
}
export async function POST(r: Request) {
  if (!(await isOwnerRequest(r)))
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  const e = await runtime(),
    b = (await r.json()) as any;
  await ensureLoanServices(e.DB);
  if (!clean(b.name, 200))
    return Response.json(
      { error: 'Enter the company or broker name.' },
      { status: 400 },
    );
  const id = crypto.randomUUID(),
    now = new Date().toISOString(),
    values = fields.map((f) =>
      clean(
        b[f],
        f.includes('details') || f.includes('notes') || f === 'description'
          ? 8000
          : 500,
      ),
    );
  await e.DB.prepare(
    `INSERT INTO loan_services(id,${fields.join(',')},published,featured,sort_order,created_at,updated_at) VALUES(${Array(
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
    id = clean(b.id, 80);
  await ensureLoanServices(e.DB);
  if (!id || !clean(b.name, 200))
    return Response.json(
      { error: 'Enter the company or broker name.' },
      { status: 400 },
    );
  const values = fields.map((f) =>
    clean(
      b[f],
      f.includes('details') || f.includes('notes') || f === 'description'
        ? 8000
        : 500,
    ),
  );
  await e.DB.prepare(
    `UPDATE loan_services SET ${fields.map((f) => `${f}=?`).join(',')},published=?,featured=?,sort_order=?,updated_at=? WHERE id=?`,
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
    id = clean(new URL(r.url).searchParams.get('id'), 80);
  await ensureLoanServices(e.DB);
  await e.DB.prepare('DELETE FROM loan_services WHERE id=?').bind(id).run();
  await e.BUCKET.delete(`loan-service-logos/${id}`);
  return Response.json({ deleted: true });
}
