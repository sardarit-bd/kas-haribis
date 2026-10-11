import {
  ADMIN_SECTIONS,
  isActiveStaffOrOwner,
  isOwnerEmail,
  staffPermissions,
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

function sanitizeReturnTo(value: string): string {
  if (!value || !value.startsWith('/') || value.startsWith('//') || value.startsWith('/\\')) {
    return '';
  }
  try {
    const url = new URL(value, 'https://app.local');
    if (url.origin !== 'https://app.local') return '';
    if (url.pathname === '/sign-in' || url.pathname.startsWith('/api/')) return '';
    return `${url.pathname}${url.search}${url.hash}`;
  } catch {
    return '';
  }
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

  const email = String(body?.email || '').trim().toLowerCase();
  const password = String(body?.password || '').trim();
  const returnTo = String(body?.returnTo || '').trim();

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

  const isOwner = isOwnerEmail(email);
  const cleanReturnTo = sanitizeReturnTo(returnTo);
  let redirectTarget = '/admin';

  if (isOwner) {
    redirectTarget = cleanReturnTo || '/admin';
  } else {
    const permissions = await staffPermissions(env.DB, email);
    if (!permissions.length) {
      return Response.json(
        { error: 'Your account does not have permission to access any administrative sections.' },
        { status: 403 },
      );
    }

    let returnToAllowed = false;
    if (cleanReturnTo) {
      if (cleanReturnTo.startsWith('/admin/')) {
        const sectionKey = cleanReturnTo.slice('/admin/'.length).split('/')[0]?.split('?')[0];
        if (sectionKey && permissions.includes(sectionKey)) {
          returnToAllowed = true;
        }
      } else if (!cleanReturnTo.startsWith('/admin')) {
        returnToAllowed = true;
      }
    }

    if (returnToAllowed && cleanReturnTo) {
      redirectTarget = cleanReturnTo;
    } else {
      const firstSection = ADMIN_SECTIONS.find((section) =>
        permissions.includes(section.key),
      );
      redirectTarget = firstSection ? firstSection.href : '/admin';
    }
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

  return Response.json(
    { success: true, redirectUrl: redirectTarget },
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
