import { ensureSeforim } from '../../lib/seforim';
export async function GET(request: Request) {
  const token = new URL(request.url).searchParams.get('token') || '';
  if (token.length < 40)
    return new Response('Invalid download link', { status: 400 });
  const { env } = await import('cloudflare:workers');
  await ensureSeforim(env.DB);
  const record = (await env.DB.prepare(
    "SELECT d.downloaded_at,s.pdf_storage_key,s.pdf_filename FROM sefer_pdf_downloads d JOIN payment_records p ON p.id=d.payment_id JOIN seforim s ON s.id=d.sefer_id WHERE d.token=? AND p.kind='sefer-pdf' AND p.status='Paid'",
  )
    .bind(token)
    .first()) as any;
  if (!record?.pdf_storage_key)
    return new Response('This protected download link is invalid.', {
      status: 403,
    });
  if (record.downloaded_at)
    return new Response(
      'This PDF download link has already been used. Please contact Kav Haribis if you need assistance.',
      { status: 410 },
    );
  const object = await env.BUCKET.get(record.pdf_storage_key);
  if (!object)
    return new Response(
      'The purchased PDF is temporarily unavailable. Please contact Kav Haribis.',
      { status: 503 },
    );
  await env.DB.prepare(
    'UPDATE sefer_pdf_downloads SET downloaded_at=? WHERE token=? AND downloaded_at IS NULL',
  )
    .bind(new Date().toISOString(), token)
    .run();
  return new Response(object.body, {
    headers: {
      'content-type': 'application/pdf',
      'content-disposition': `attachment; filename="${String(record.pdf_filename || 'Kav-Haribis-Sefer.pdf').replaceAll('"', '')}"`,
      'cache-control': 'private, no-store',
    },
  });
}
