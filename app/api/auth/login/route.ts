import {
  isActiveStaffOrOwner,
  verifyStaffPassword,
} from '../../../lib/admin-access';
import { getAuthEnv } from '../../../lib/auth-config';
import {
  createSessionToken,
  SESSION_MAX_AGE_SECONDS,
  sessionCookieHeader,
  useSecureCookies,
  type SessionPayload,
} from '../../../lib/auth-session';

export async function POST(request: Request) {
  const body = (await request.json()) as any;
  const email = String(body.email || '').trim().toLowerCase();
  const password = String(body.password || '').trim();
  const returnTo = String(body.returnTo || '/admin').trim();

  if (!email || !password) {
    return Response.json(
      { error: 'Email and password are required.' },
      { status: 400 },
    );
  }

  const { env } = await import('cloudflare:workers');

  // Step 1: Check if user is Admin Owner or Active Staff
  const allowed = await isActiveStaffOrOwner(env.DB, email);
  if (!allowed) {
    return Response.json(
      { error: 'You do not have staff permission to access the dashboard' },
      { status: 403 },
    );
  }

  // Step 2: Verify password against stored hash in DB
  const validPassword = await verifyStaffPassword(env.DB, email, password);
  if (!validPassword) {
    return Response.json(
      { error: 'Invalid email or password.' },
      { status: 400 },
    );
  }

  // Fetch staff name if available
  const staffRow = (await env.DB.prepare(
    'SELECT name FROM admin_staff_access WHERE LOWER(email)=?',
  )
    .bind(email)
    .first()) as any;
  const name = staffRow?.name || email;

  const config = await getAuthEnv();
  if (!config.AUTH_SECRET) {
    return Response.json(
      { error: 'Auth is not configured on server.' },
      { status: 500 },
    );
  }

  const sessionPayload: SessionPayload = {
    email,
    name,
    exp: Math.floor(Date.now() / 1000) + SESSION_MAX_AGE_SECONDS,
  };

  const sessionToken = await createSessionToken(
    sessionPayload,
    config.AUTH_SECRET,
  );
  const secureCookies = useSecureCookies(config.APP_URL);

  const safeReturnTo = returnTo.startsWith('/') ? returnTo : '/admin';

  return Response.json(
    { success: true, redirectUrl: safeReturnTo },
    {
      status: 200,
      headers: {
        'Set-Cookie': sessionCookieHeader(
          sessionToken,
          SESSION_MAX_AGE_SECONDS,
          secureCookies,
        ),
      },
    },
  );
}
