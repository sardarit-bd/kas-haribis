import { getRequestEmail, isOwnerRequest } from '../../../lib/request-auth';
import { ensureBankReportTables } from '../../../lib/directories';

const clean = (value: unknown, max: number) =>
  String(value || '')
    .trim()
    .slice(0, max);
async function hashCode(code: string) {
  const bytes = await crypto.subtle.digest(
    'SHA-256',
    new TextEncoder().encode(code),
  );
  return Array.from(new Uint8Array(bytes), (byte) =>
    byte.toString(16).padStart(2, '0'),
  ).join('');
}
function createCode() {
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  const bytes = crypto.getRandomValues(new Uint8Array(10));
  return Array.from(bytes, (value) => alphabet[value % alphabet.length]).join(
    '',
  );
}

export async function GET(request: Request) {
  if (!(await isOwnerRequest(request)))
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  const bankId = clean(new URL(request.url).searchParams.get('bankId'), 80);
  const { env } = await import('cloudflare:workers');
  await ensureBankReportTables(env.DB);
  const result = await env.DB.prepare(
    'SELECT id,code_hint,active,created_at FROM bank_report_codes WHERE bank_id=? ORDER BY created_at DESC',
  )
    .bind(bankId)
    .all();
  return Response.json({ codes: result.results });
}
export async function POST(request: Request) {
  if (!(await isOwnerRequest(request)))
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  const body = (await request.json()) as { bankId?: string };
  const bankId = clean(body.bankId, 80);
  const { env } = await import('cloudflare:workers');
  await ensureBankReportTables(env.DB);
  const bank = await env.DB.prepare(
    'SELECT id FROM banks WHERE id=? AND length(full_report)>0',
  )
    .bind(bankId)
    .first();
  if (!bank)
    return Response.json(
      { error: 'Save a full report before creating a code.' },
      { status: 400 },
    );
  const code = createCode();
  await env.DB.prepare(
    'INSERT INTO bank_report_codes(id,bank_id,code_hash,code_hint,active,created_at) VALUES(?,?,?,?,1,?)',
  )
    .bind(
      crypto.randomUUID(),
      bankId,
      await hashCode(code),
      `Ends in ${code.slice(-4)}`,
      new Date().toISOString(),
    )
    .run();
  return Response.json({ created: true, code });
}
export async function DELETE(request: Request) {
  if (!(await isOwnerRequest(request)))
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  const id = clean(new URL(request.url).searchParams.get('id'), 80);
  const { env } = await import('cloudflare:workers');
  await ensureBankReportTables(env.DB);
  await env.DB.prepare('DELETE FROM bank_report_codes WHERE id=?')
    .bind(id)
    .run();
  return Response.json({ deleted: true });
}
