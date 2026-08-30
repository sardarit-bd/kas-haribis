import { ensureHeterTables } from '../../lib/heter-documents';

export async function GET(request: Request) {
  const token = new URL(request.url).searchParams.get('token') || '';
  if (token.length < 40)
    return new Response('Invalid download link', { status: 400 });
  const { env } = await import('cloudflare:workers');
  await env.DB.prepare(
    'CREATE TABLE IF NOT EXISTS payment_records (id TEXT PRIMARY KEY, kind TEXT NOT NULL, amount REAL NOT NULL, name TEXT NOT NULL, email TEXT NOT NULL, dedication TEXT, anonymous INTEGER NOT NULL DEFAULT 0, status TEXT NOT NULL, reference TEXT, download_token TEXT, created_at TEXT NOT NULL)',
  ).run();
  await ensureHeterTables(env.DB);
  let record = (await env.DB.prepare(
    "SELECT d.created_at,x.storage_key,x.filename FROM heter_downloads d JOIN payment_records p ON p.id=d.payment_id JOIN heter_documents x ON x.id=d.document_id WHERE d.token=? AND p.kind='heter-iska' AND p.status='Paid'",
  )
    .bind(token)
    .first()) as {
    created_at?: string;
    storage_key?: string;
    filename?: string;
  } | null;
  if (!record)
    record = (await env.DB.prepare(
      'SELECT d.created_at,x.storage_key,x.filename FROM heter_code_downloads d JOIN heter_access_codes c ON c.id=d.code_id JOIN heter_documents x ON x.id=d.document_id WHERE d.token=?',
    )
      .bind(token)
      .first()) as {
      created_at?: string;
      storage_key?: string;
      filename?: string;
    } | null;
  if (!record?.created_at || !record.storage_key)
    return new Response('This protected download link is invalid.', {
      status: 403,
    });
  const age = Date.now() - new Date(record.created_at).getTime();
  if (age > 7 * 24 * 60 * 60 * 1000)
    return new Response(
      'This download link has expired. Please contact Kav Haribis.',
      { status: 410 },
    );
  const object = await env.BUCKET.get(record.storage_key);
  if (!object)
    return new Response(
      'Your payment was approved, but the document is not yet available. Please contact Kav Haribis with your payment reference.',
      { status: 503 },
    );
  return new Response(object.body, {
    headers: {
      'content-type': 'application/pdf',
      'content-disposition': `attachment; filename="${(record.filename || 'Kav-Haribis-Heter-Iska.pdf').replaceAll('"', '')}"`,
      'cache-control': 'private, no-store',
    },
  });
}
