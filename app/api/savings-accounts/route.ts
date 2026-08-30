import { getRequestEmail, isOwnerRequest } from '../../lib/request-auth';
import {
  ensureSavingsAccounts,
  listSavingsAccounts,
} from '../../lib/directories';
const clean = (v: unknown, n = 5000) =>
  String(v ?? '')
    .trim()
    .slice(0, n);
const fields = [
  'institution_name',
  'account_name',
  'description',
  'apy',
  'minimum_deposit',
  'monthly_fee',
  'fdic_status',
  'kosher_status',
  'kosher_details',
  'last_reviewed',
  'open_account_url',
  'website',
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
    accounts: await listSavingsAccounts(e.DB, (await isOwnerRequest(r))),
  });
}
export async function POST(r: Request) {
  if (!(await isOwnerRequest(r)))
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  const e = await runtime(),
    b = (await r.json()) as any;
  await ensureSavingsAccounts(e.DB);
  if (!clean(b.institution_name, 200))
    return Response.json(
      { error: 'Enter the bank or institution name.' },
      { status: 400 },
    );
  const id = crypto.randomUUID(),
    now = new Date().toISOString(),
    values = fields.map((f) =>
      clean(
        b[f],
        f.includes('details') || f.includes('notes') || f === 'description'
          ? 8000
          : 600,
      ),
    );
  await e.DB.prepare(
    `INSERT INTO savings_accounts(id,${fields.join(',')},published,featured,sort_order,created_at,updated_at) VALUES(${Array(
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
  await ensureSavingsAccounts(e.DB);
  if (!id || !clean(b.institution_name, 200))
    return Response.json(
      { error: 'Enter the bank or institution name.' },
      { status: 400 },
    );
  const values = fields.map((f) =>
    clean(
      b[f],
      f.includes('details') || f.includes('notes') || f === 'description'
        ? 8000
        : 600,
    ),
  );
  await e.DB.prepare(
    `UPDATE savings_accounts SET ${fields.map((f) => `${f}=?`).join(',')},published=?,featured=?,sort_order=?,updated_at=? WHERE id=?`,
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
  await ensureSavingsAccounts(e.DB);
  await e.DB.prepare('DELETE FROM savings_accounts WHERE id=?').bind(id).run();
  await e.BUCKET.delete(`savings-logos/${id}`);
  return Response.json({ deleted: true });
}
