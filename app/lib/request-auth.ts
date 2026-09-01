import { ADMIN_OWNER, isOwnerEmail } from './admin-access';
import { getUserFromCookieHeader } from './auth';

const ADMIN_ELEVATED_HEADER = 'x-kh-admin-elevated';

export async function getRequestEmail(request: Request): Promise<string> {
  if (request.headers.get(ADMIN_ELEVATED_HEADER) === '1') {
    return ADMIN_OWNER[0] || '';
  }
  const user = await getUserFromCookieHeader(request.headers.get('cookie'));
  return user?.email || '';
}

export async function isOwnerRequest(request: Request): Promise<boolean> {
  const email = await getRequestEmail(request);
  return isOwnerEmail(email);
}

export async function requireOwnerRequest(request: Request): Promise<string> {
  const email = await getRequestEmail(request);
  if (isOwnerEmail(email)) return email;
  throw new Response(JSON.stringify({ error: 'Unauthorized' }), {
    status: 401,
    headers: { 'Content-Type': 'application/json' },
  });
}

export { ADMIN_ELEVATED_HEADER };

