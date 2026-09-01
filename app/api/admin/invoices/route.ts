import { isOwnerRequest } from '../../../lib/request-auth';
import { isOwnerEmail } from '../../../lib/admin-access';
import { ensureInvoices } from '../../../lib/invoices';

const clean = (value: unknown, max = 5000) =>
  String(value ?? '')
    .trim()
    .slice(0, max);
async function runtime() {
  const { env } = await import('cloudflare:workers');
  await ensureInvoices(env.DB);
  return env;
}
function documentNumber(type: string) {
  const year = new Date().getFullYear(),
    part = crypto.randomUUID().replace(/-/g, '').slice(0, 6).toUpperCase();
  return `${type === 'Donation Receipt' ? 'DON' : 'KH'}-${year}-${part}`;
}

export async function GET(request: Request) {
  if (!(await isOwnerRequest(request)))
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  const env = await runtime(),
    result = await env.DB.prepare(
      'SELECT * FROM invoices ORDER BY created_at DESC',
    ).all();
  return Response.json({ invoices: result.results });
}
export async function POST(request: Request) {
  if (!(await isOwnerRequest(request)))
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  const body = (await request.json()) as any,
    name = clean(body.customer_name, 200),
    email = clean(body.customer_email, 300).toLowerCase(),
    description = clean(body.description, 5000),
    amount = Number(body.amount),
    type =
      clean(body.document_type, 40) === 'Donation Receipt'
        ? 'Donation Receipt'
        : 'Invoice';
  if (
    !name ||
    (type === 'Invoice' && !email) ||
    !description ||
    !Number.isFinite(amount) ||
    amount <= 0
  )
    return Response.json(
      {
        error:
          type === 'Donation Receipt'
            ? 'Donor name, donation description, and a valid amount are required.'
            : 'Customer, email, description, and a valid amount are required.',
      },
      { status: 400 },
    );
  const env = await runtime(),
    id = crypto.randomUUID(),
    now = new Date().toISOString(),
    number = documentNumber(type),
    status = type === 'Donation Receipt' ? 'Issued' : 'Draft';
  await env.DB.prepare(
    'INSERT INTO invoices(id,invoice_number,customer_name,customer_email,company,address,description,amount,issue_date,due_date,status,notes,created_at,updated_at,document_type,payment_method,payment_reference,goods_services) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)',
  )
    .bind(
      id,
      number,
      name,
      email,
      clean(body.company, 300),
      clean(body.address, 1000),
      description,
      Math.round(amount * 100) / 100,
      clean(body.issue_date, 20) || now.slice(0, 10),
      type === 'Invoice' ? clean(body.due_date, 20) : '',
      status,
      clean(body.notes, 5000),
      now,
      now,
      type,
      clean(body.payment_method, 80),
      clean(body.payment_reference, 200),
      clean(body.goods_services, 1000) ||
        'No goods or services were provided in exchange for this contribution.',
    )
    .run();
  const invoice = await env.DB.prepare('SELECT * FROM invoices WHERE id=?')
    .bind(id)
    .first();
  return Response.json({ invoice });
}
export async function PUT(request: Request) {
  if (!(await isOwnerRequest(request)))
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  const body = (await request.json()) as any,
    env = await runtime(),
    id = clean(body.id, 100),
    amount = Number(body.amount),
    type =
      clean(body.document_type, 40) === 'Donation Receipt'
        ? 'Donation Receipt'
        : 'Invoice';
  if (
    !id ||
    !clean(body.customer_name, 200) ||
    (type === 'Invoice' && !clean(body.customer_email, 300)) ||
    !clean(body.description, 5000) ||
    !Number.isFinite(amount) ||
    amount <= 0
  )
    return Response.json(
      { error: 'Complete all required fields.' },
      { status: 400 },
    );
  await env.DB.prepare(
    'UPDATE invoices SET customer_name=?,customer_email=?,company=?,address=?,description=?,amount=?,issue_date=?,due_date=?,status=?,notes=?,updated_at=?,document_type=?,payment_method=?,payment_reference=?,goods_services=? WHERE id=?',
  )
    .bind(
      clean(body.customer_name, 200),
      clean(body.customer_email, 300).toLowerCase(),
      clean(body.company, 300),
      clean(body.address, 1000),
      clean(body.description, 5000),
      Math.round(amount * 100) / 100,
      clean(body.issue_date, 20),
      type === 'Invoice' ? clean(body.due_date, 20) : '',
      clean(body.status, 30) ||
        (type === 'Donation Receipt' ? 'Issued' : 'Draft'),
      clean(body.notes, 5000),
      new Date().toISOString(),
      type,
      clean(body.payment_method, 80),
      clean(body.payment_reference, 200),
      clean(body.goods_services, 1000) ||
        'No goods or services were provided in exchange for this contribution.',
      id,
    )
    .run();
  const invoice = await env.DB.prepare('SELECT * FROM invoices WHERE id=?')
    .bind(id)
    .first();
  return Response.json({ invoice });
}
export async function DELETE(request: Request) {
  if (!(await isOwnerRequest(request)))
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  const env = await runtime(),
    id = clean(new URL(request.url).searchParams.get('id'), 100);
  await env.DB.prepare('DELETE FROM invoices WHERE id=?').bind(id).run();
  return Response.json({ deleted: true });
}
