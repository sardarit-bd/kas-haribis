import { getAdminProfileName, setAdminProfileName, validateProfileName } from '../../../lib/admin-profile';
import { getUserFromCookieHeader } from '../../../lib/auth';
import { getAuthEnv } from '../../../lib/auth-config';
import {
  createSessionToken,
  SESSION_MAX_AGE_SECONDS,
  sessionCookieHeader,
  useSecureCookies,
  type SessionPayload,
} from '../../../lib/auth-session';

export async function GET(request: Request) {
  const user = await getUserFromCookieHeader(request.headers.get('cookie'));
  if (!user?.email) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { env } = await import('cloudflare:workers');
  const savedName = await getAdminProfileName(env.DB, user.email);

  return Response.json({
    email: user.email,
    name: savedName || user.name || '',
  });
}

export async function PATCH(request: Request) {
  const user = await getUserFromCookieHeader(request.headers.get('cookie'));
  if (!user?.email) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let body: any;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: 'Invalid request payload.' }, { status: 400 });
  }

  const validation = validateProfileName(body?.name);
  if (!validation.valid || !validation.cleanName) {
    return Response.json({ error: validation.error }, { status: 400 });
  }

  const { env } = await import('cloudflare:workers');

  // Persist strictly to the authenticated user's email address derived from session cookie
  await setAdminProfileName(env.DB, user.email, validation.cleanName);

  // If user is also in admin_staff_access, keep their staff display name aligned
  try {
    const now = new Date().toISOString();
    await env.DB.prepare(
      'UPDATE admin_staff_access SET name=?, updated_at=? WHERE LOWER(email)=?',
    )
      .bind(validation.cleanName, now, user.email)
      .run();
  } catch {}

  // Re-issue updated session cookie so server components immediately receive the new name
  const headers = new Headers();
  try {
    const config = await getAuthEnv();
    if (config.AUTH_SECRET) {
      const sessionPayload: SessionPayload = {
        email: user.email,
        name: validation.cleanName,
        exp: Math.floor(Date.now() / 1000) + SESSION_MAX_AGE_SECONDS,
      };
      const sessionToken = await createSessionToken(
        sessionPayload,
        config.AUTH_SECRET,
      );
      const secureCookies = useSecureCookies(config.APP_URL);
      headers.set(
        'Set-Cookie',
        sessionCookieHeader(
          sessionToken,
          SESSION_MAX_AGE_SECONDS,
          secureCookies,
        ),
      );
    }
  } catch {}

  return Response.json(
    { success: true, name: validation.cleanName },
    { status: 200, headers },
  );
}
