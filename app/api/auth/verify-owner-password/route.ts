import {
  adminLoginAttemptAllowed,
  clearAdminLoginFailures,
  isOwnerEmail,
  recordAdminLoginFailure,
  verifyStaffPassword,
} from '../../../lib/admin-access';
import { getAdminProfileName } from '../../../lib/admin-profile';
import { getAuthEnv } from '../../../lib/auth-config';
import {
  clearIntermediateOwnerCookieHeader,
  createSessionToken,
  INTERMEDIATE_OWNER_COOKIE,
  SESSION_MAX_AGE_SECONDS,
  sessionCookieHeader,
  useSecureCookies,
  verifyIntermediateOwnerToken,
  type SessionPayload,
} from '../../../lib/auth-session';

export async function GET(request: Request) {
  const config = await getAuthEnv();
  if (!config.AUTH_SECRET) {
    return Response.json({ valid: false }, { status: 500 });
  }

  const cookieHeader = request.headers.get('cookie') || '';
  const cookies = Object.fromEntries(
    cookieHeader
      .split(';')
      .map((c) => c.trim().split('='))
      .filter(([k]) => Boolean(k))
      .map(([k, ...v]) => [k, decodeURIComponent(v.join('='))]),
  );

  const intermediateToken = cookies[INTERMEDIATE_OWNER_COOKIE];
  const payload = await verifyIntermediateOwnerToken(
    intermediateToken,
    config.AUTH_SECRET,
  );

  if (!payload || !payload.email || !isOwnerEmail(payload.email)) {
    return Response.json({ valid: false }, { status: 200 });
  }

  return Response.json({
    valid: true,
    email: payload.email,
  });
}

export async function POST(request: Request) {
  let body: any;
  try {
    body = await request.json();
  } catch {
    return Response.json(
      { error: 'Invalid request payload.' },
      { status: 400 },
    );
  }

  const password = String(body?.password || '').trim();
  if (!password) {
    return Response.json(
      { error: 'Password is required.' },
      { status: 400 },
    );
  }

  const config = await getAuthEnv();
  if (!config.AUTH_SECRET) {
    return Response.json(
      { error: 'Authentication is not configured on the server.' },
      { status: 500 },
    );
  }

  const cookieHeader = request.headers.get('cookie') || '';
  const cookies = Object.fromEntries(
    cookieHeader
      .split(';')
      .map((c) => c.trim().split('='))
      .filter(([k]) => Boolean(k))
      .map(([k, ...v]) => [k, decodeURIComponent(v.join('='))]),
  );

  const intermediateToken = cookies[INTERMEDIATE_OWNER_COOKIE];
  const intermediatePayload = await verifyIntermediateOwnerToken(
    intermediateToken,
    config.AUTH_SECRET,
  );

  if (!intermediatePayload || !intermediatePayload.email) {
    return Response.json(
      {
        error:
          'Verification session expired or invalid. Please sign in again.',
      },
      { status: 401 },
    );
  }

  const email = intermediatePayload.email.toLowerCase().trim();
  if (!isOwnerEmail(email)) {
    return Response.json({ error: 'Unauthorized.' }, { status: 403 });
  }

  const { env } = await import('cloudflare:workers');

  const clientIp =
    request.headers.get('cf-connecting-ip') ||
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    '127.0.0.1';

  const attempt = await adminLoginAttemptAllowed(env.DB, email, clientIp);
  if (!attempt.allowed) {
    return Response.json(
      {
        error:
          'Too many failed password attempts. Account is temporarily locked. Please try again in 15 minutes.',
      },
      { status: 429 },
    );
  }

  const valid = await verifyStaffPassword(env.DB, email, password);
  if (!valid) {
    await recordAdminLoginFailure(env.DB, attempt.key);
    return Response.json(
      { error: 'Incorrect administrator password.' },
      { status: 400 },
    );
  }

  await clearAdminLoginFailures(env.DB, attempt.key);

  const profileName = await getAdminProfileName(env.DB, email);
  const name = profileName || email;

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
  const headers = new Headers();
  headers.append(
    'Set-Cookie',
    sessionCookieHeader(
      sessionToken,
      SESSION_MAX_AGE_SECONDS,
      secureCookies,
    ),
  );
  headers.append(
    'Set-Cookie',
    clearIntermediateOwnerCookieHeader(secureCookies),
  );

  return Response.json(
    {
      success: true,
      redirectUrl: intermediatePayload.returnTo || '/admin',
    },
    { status: 200, headers },
  );
}
