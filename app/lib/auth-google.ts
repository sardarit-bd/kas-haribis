import { assertAuthConfigured, getAuthEnv } from './auth-config';
import {
  clearOAuthStateCookieHeader,
  createSessionToken,
  oauthStateCookieHeader,
  parseSessionToken,
  SESSION_MAX_AGE_SECONDS,
  sessionCookieHeader,
  useSecureCookies,
  type SessionPayload,
} from './auth-session';

const GOOGLE_AUTH_URL = 'https://accounts.google.com/o/oauth2/v2/auth';
const GOOGLE_TOKEN_URL = 'https://oauth2.googleapis.com/token';
const GOOGLE_USERINFO_URL = 'https://openidconnect.googleapis.com/v1/userinfo';

type OAuthState = {
  returnTo: string;
  nonce: string;
  exp: number;
};

function safeReturnPath(value: string) {
  if (!value.startsWith('/') || value.startsWith('//')) return '/';
  try {
    const url = new URL(value, 'https://app.local');
    if (url.origin !== 'https://app.local') return '/';
    if (
      url.pathname === '/sign-in' ||
      url.pathname.startsWith('/api/auth/')
    ) {
      return '/';
    }
    return `${url.pathname}${url.search}${url.hash}`;
  } catch {
    return '/';
  }
}

async function signState(state: OAuthState, secret: string) {
  const payloadText = btoa(JSON.stringify(state))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/g, '');
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  );
  const signature = await crypto.subtle.sign(
    'HMAC',
    key,
    new TextEncoder().encode(payloadText),
  );
  const signatureText = btoa(String.fromCharCode(...new Uint8Array(signature)))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/g, '');
  return `${payloadText}.${signatureText}`;
}

async function verifyState(value: string, secret: string): Promise<OAuthState | null> {
  const [payloadText, signatureText] = value.split('.');
  if (!payloadText || !signatureText) return null;

  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['verify'],
  );
  const signature = Uint8Array.from(
    atob(signatureText.replace(/-/g, '+').replace(/_/g, '/')),
    (char) => char.charCodeAt(0),
  );
  const valid = await crypto.subtle.verify(
    'HMAC',
    key,
    signature,
    new TextEncoder().encode(payloadText),
  );
  if (!valid) return null;

  try {
    const padded = payloadText.replace(/-/g, '+').replace(/_/g, '/');
    const padLength = (4 - (padded.length % 4)) % 4;
    const state = JSON.parse(
      atob(padded + '='.repeat(padLength)),
    ) as OAuthState;
    if (!state?.nonce || state.exp <= Math.floor(Date.now() / 1000)) return null;
    return {
      returnTo: safeReturnPath(state.returnTo || '/'),
      nonce: state.nonce,
      exp: state.exp,
    };
  } catch {
    return null;
  }
}

export async function buildGoogleSignInResponse(returnTo: string) {
  const config = await getAuthEnv();
  assertAuthConfigured(config);

  const state = await signState(
    {
      returnTo: safeReturnPath(returnTo),
      nonce: crypto.randomUUID(),
      exp: Math.floor(Date.now() / 1000) + 600,
    },
    config.AUTH_SECRET,
  );

  const redirectUri = `${config.APP_URL}/api/auth/callback/google`;
  const params = new URLSearchParams({
    client_id: config.GOOGLE_CLIENT_ID,
    redirect_uri: redirectUri,
    response_type: 'code',
    scope: 'openid email profile',
    state,
    prompt: 'select_account',
    access_type: 'online',
  });

  const secureCookies = useSecureCookies(config.APP_URL);

  return new Response(null, {
    status: 302,
    headers: {
      Location: `${GOOGLE_AUTH_URL}?${params.toString()}`,
      'Set-Cookie': oauthStateCookieHeader(state, 600, secureCookies),
    },
  });
}

export async function buildGoogleCallbackResponse(
  request: Request,
  code: string,
  state: string,
) {
  const config = await getAuthEnv();
  assertAuthConfigured(config);

  const cookieState = request.headers
    .get('cookie')
    ?.split(';')
    .map((part) => part.trim())
    .find((part) => part.startsWith('kh_oauth_state='))
    ?.split('=')
    .slice(1)
    .join('=');

  const decodedCookieState = cookieState
    ? decodeURIComponent(cookieState)
    : '';
  if (!decodedCookieState || decodedCookieState !== state) {
    return new Response('Invalid OAuth state.', { status: 400 });
  }

  const oauthState = await verifyState(state, config.AUTH_SECRET);
  if (!oauthState) {
    return new Response('OAuth state expired.', { status: 400 });
  }

  const redirectUri = `${config.APP_URL}/api/auth/callback/google`;
  const tokenResponse = await fetch(GOOGLE_TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      code,
      client_id: config.GOOGLE_CLIENT_ID,
      client_secret: config.GOOGLE_CLIENT_SECRET,
      redirect_uri: redirectUri,
      grant_type: 'authorization_code',
    }),
  });

  if (!tokenResponse.ok) {
    return new Response('Google token exchange failed.', { status: 502 });
  }

  const tokenData = (await tokenResponse.json()) as { access_token?: string };
  if (!tokenData.access_token) {
    return new Response('Google access token missing.', { status: 502 });
  }

  const profileResponse = await fetch(GOOGLE_USERINFO_URL, {
    headers: { Authorization: `Bearer ${tokenData.access_token}` },
  });
  if (!profileResponse.ok) {
    return new Response('Google profile lookup failed.', { status: 502 });
  }

  const profile = (await profileResponse.json()) as {
    email?: string;
    email_verified?: boolean;
    name?: string;
  };

  if (!profile.email || profile.email_verified === false) {
    return new Response('A verified Google email is required.', { status: 403 });
  }

  const email = profile.email.toLowerCase();
  const { env } = await import('cloudflare:workers');
  const { isActiveStaffOrOwner } = await import('./admin-access');
  const allowed = await isActiveStaffOrOwner(env.DB, email);

  if (!allowed) {
    const secureCookies = useSecureCookies(config.APP_URL);
    const errorUrl = `${config.APP_URL}/sign-in?error=no_staff_access&return_to=${encodeURIComponent(oauthState.returnTo)}`;
    const headers = new Headers();
    headers.set('Location', errorUrl);
    headers.append('Set-Cookie', clearOAuthStateCookieHeader(secureCookies));
    return new Response(null, { status: 302, headers });
  }

  const sessionPayload: SessionPayload = {
    email,
    name: String(profile.name || '').trim(),
    exp: Math.floor(Date.now() / 1000) + SESSION_MAX_AGE_SECONDS,
  };
  const sessionToken = await createSessionToken(
    sessionPayload,
    config.AUTH_SECRET,
  );

  const secureCookies = useSecureCookies(config.APP_URL);
  const headers = new Headers();
  headers.set('Location', oauthState.returnTo);
  headers.append(
    'Set-Cookie',
    sessionCookieHeader(sessionToken, SESSION_MAX_AGE_SECONDS, secureCookies),
  );
  headers.append(
    'Set-Cookie',
    clearOAuthStateCookieHeader(secureCookies),
  );

  return new Response(null, {
    status: 302,
    headers,
  });
}

export async function createDevBypassSession(email: string, name: string) {
  const config = await getAuthEnv();
  if (!config.AUTH_SECRET) {
    throw new Error('AUTH_SECRET is required even for development bypass.');
  }
  const sessionPayload: SessionPayload = {
    email: email.toLowerCase(),
    name,
    exp: Math.floor(Date.now() / 1000) + SESSION_MAX_AGE_SECONDS,
  };
  return createSessionToken(sessionPayload, config.AUTH_SECRET);
}

export async function verifySessionToken(token: string | null | undefined) {
  const config = await getAuthEnv();
  if (!config.AUTH_SECRET) return null;
  return parseSessionToken(token, config.AUTH_SECRET);
}
