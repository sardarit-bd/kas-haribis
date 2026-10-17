import { canAccessSection, isOwnerEmail } from '../../lib/admin-access';
import { ensureBankReportTables, ensureBankResearch } from '../../lib/directories';
import { premiumMemberFromHeaders } from '../../lib/bank-premium';
import { getUserFromCookieHeader } from '../../lib/auth';

const MIME_MAP: Record<string, string> = {
  png: 'image/png',
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  webp: 'image/webp',
};

export async function GET(request: Request) {
  const { env } = await import('cloudflare:workers');
  await ensureBankReportTables(env.DB);
  await ensureBankResearch(env.DB);

  const url = new URL(request.url);
  const bankId = String(url.searchParams.get('bankId') || '').trim();
  const imageId = String(url.searchParams.get('id') || '').trim();
  const ext = String(url.searchParams.get('ext') || 'png').toLowerCase().replace(/[^a-z]/g, '');
  const token = String(url.searchParams.get('token') || '').trim();

  if (!bankId || !imageId) {
    return new Response('Invalid image request.', { status: 400 });
  }

  // 1. Validate UUID format of imageId to prevent path manipulation
  if (!/^[a-zA-Z0-9_\-]+$/.test(imageId)) {
    return new Response('Invalid image identifier.', { status: 400 });
  }

  // 2. Authorization check
  const sessionUser = await getUserFromCookieHeader(request.headers.get('cookie'));
  const isOwner = Boolean(sessionUser?.email && isOwnerEmail(sessionUser.email));
  const isStaff = Boolean(
    sessionUser?.email && (await canAccessSection(env.DB, sessionUser.email, 'banks')),
  );
  const premium = await premiumMemberFromHeaders(request.headers, env.DB);

  let authorized = isOwner || isStaff || Boolean(premium);

  if (!authorized && token) {
    const accessRecord = (await env.DB.prepare(
      'SELECT created_at, bank_id FROM bank_report_access WHERE token=?',
    )
      .bind(token)
      .first()) as { created_at?: string; bank_id?: string } | null;

    if (
      accessRecord?.bank_id === bankId &&
      accessRecord.created_at &&
      Date.now() - new Date(accessRecord.created_at).getTime() < 7 * 24 * 60 * 60 * 1000
    ) {
      authorized = true;
    }
  }

  if (!authorized) {
    return new Response('Unauthorized.', { status: 401 });
  }

  // 3. Construct and verify bank-scoped R2 key
  const key = `bank-reports/${bankId}/images/${imageId}.${ext}`;
  const object = await env.BUCKET.get(key);

  if (!object || !object.body) {
    return new Response('Image not found.', { status: 404 });
  }

  const contentType = MIME_MAP[ext] || 'image/png';

  return new Response(object.body, {
    status: 200,
    headers: {
      'Content-Type': contentType,
      'X-Content-Type-Options': 'nosniff',
      'Cache-Control': 'private, max-age=86400',
    },
  });
}
