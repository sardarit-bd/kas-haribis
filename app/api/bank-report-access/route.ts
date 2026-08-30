import { ensureBankReportTables } from '../../lib/directories';

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

export async function POST(request: Request) {
  const body = (await request.json()) as { bankId?: string; code?: string };
  const bankId = clean(body.bankId, 80),
    code = clean(body.code, 30).replace(/[\s-]/g, '').toUpperCase();
  if (!bankId || code.length < 6)
    return Response.json(
      { error: 'Enter a valid access code.' },
      { status: 400 },
    );
  const { env } = await import('cloudflare:workers');
  await ensureBankReportTables(env.DB);
  const bank = await env.DB.prepare(
    'SELECT id FROM banks WHERE id=? AND length(full_report)>0',
  )
    .bind(bankId)
    .first();
  if (!bank)
    return Response.json(
      { error: 'This full report is not available.' },
      { status: 404 },
    );
  const record = await env.DB.prepare(
    'SELECT id FROM bank_report_codes WHERE bank_id=? AND code_hash=? AND active=1',
  )
    .bind(bankId, await hashCode(code))
    .first();
  if (!record)
    return Response.json(
      { error: 'That access code is not valid for this report.' },
      { status: 403 },
    );
  const token = `${crypto.randomUUID()}${crypto.randomUUID()}`.replaceAll(
    '-',
    '',
  );
  await env.DB.prepare(
    "INSERT INTO bank_report_access(token,bank_id,payment_id,method,created_at) VALUES(?,?,NULL,'code',?)",
  )
    .bind(token, bankId, new Date().toISOString())
    .run();
  return Response.json({
    unlocked: true,
    reportUrl: `/bank-directory/full-report?token=${token}`,
  });
}
