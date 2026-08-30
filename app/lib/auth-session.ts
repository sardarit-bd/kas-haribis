export type SessionPayload = {
  email: string;
  name: string;
  exp: number;
};

export const SESSION_COOKIE = 'kh_auth';
export const OAUTH_STATE_COOKIE = 'kh_oauth_state';
export const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 30;

export type AuthUser = {
  email: string;
  name: string;
  fullName: string | null;
  displayName: string;
};

export function toAuthUser(payload: SessionPayload): AuthUser {
  const name = payload.name.trim();
  return {
    email: payload.email.toLowerCase(),
    name,
    fullName: name || null,
    displayName: name || payload.email,
  };
}

function bytesToBase64Url(bytes: Uint8Array): string {
  let binary = '';
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
}

function base64UrlToBytes(value: string): Uint8Array {
  const padded = value.replace(/-/g, '+').replace(/_/g, '/');
  const padLength = (4 - (padded.length % 4)) % 4;
  const binary = atob(padded + '='.repeat(padLength));
  const bytes = new Uint8Array(binary.length);
  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index);
  }
  return bytes;
}

async function importHmacKey(secret: string) {
  return crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign', 'verify'],
  );
}

async function signPayload(payloadText: string, secret: string) {
  const key = await importHmacKey(secret);
  const signature = await crypto.subtle.sign(
    'HMAC',
    key,
    new TextEncoder().encode(payloadText),
  );
  return bytesToBase64Url(new Uint8Array(signature));
}

async function verifyPayload(
  payloadText: string,
  signature: string,
  secret: string,
) {
  const key = await importHmacKey(secret);
  return crypto.subtle.verify(
    'HMAC',
    key,
    base64UrlToBytes(signature),
    new TextEncoder().encode(payloadText),
  );
}

export async function createSessionToken(
  payload: SessionPayload,
  secret: string,
) {
  const payloadText = bytesToBase64Url(
    new TextEncoder().encode(JSON.stringify(payload)),
  );
  const signature = await signPayload(payloadText, secret);
  return `${payloadText}.${signature}`;
}

export async function parseSessionToken(
  token: string | null | undefined,
  secret: string,
): Promise<SessionPayload | null> {
  if (!token) return null;
  const [payloadText, signature] = token.split('.');
  if (!payloadText || !signature) return null;

  const valid = await verifyPayload(payloadText, signature, secret);
  if (!valid) return null;

  try {
    const json = new TextDecoder().decode(base64UrlToBytes(payloadText));
    const payload = JSON.parse(json) as SessionPayload;
    if (
      !payload?.email ||
      typeof payload.exp !== 'number' ||
      payload.exp <= Math.floor(Date.now() / 1000)
    ) {
      return null;
    }
    return {
      email: String(payload.email).toLowerCase(),
      name: String(payload.name || ''),
      exp: payload.exp,
    };
  } catch {
    return null;
  }
}

export function parseCookie(cookieHeader: string, name: string) {
  for (const part of cookieHeader.split(';')) {
    const [rawKey, ...rest] = part.trim().split('=');
    if (rawKey === name) return decodeURIComponent(rest.join('='));
  }
  return '';
}

export function useSecureCookies(appUrl?: string) {
  if (appUrl) return appUrl.startsWith('https://');
  return process.env.NODE_ENV === 'production';
}

function cookieSuffix(secure: boolean) {
  return secure ? '; Secure' : '';
}

export function sessionCookieHeader(
  token: string,
  maxAge = SESSION_MAX_AGE_SECONDS,
  secure = true,
) {
  return `${SESSION_COOKIE}=${encodeURIComponent(token)}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${maxAge}${cookieSuffix(secure)}`;
}

export function clearSessionCookieHeader(secure = true) {
  return `${SESSION_COOKIE}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0${cookieSuffix(secure)}`;
}

export function oauthStateCookieHeader(value: string, maxAge = 600, secure = true) {
  return `${OAUTH_STATE_COOKIE}=${encodeURIComponent(value)}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${maxAge}${cookieSuffix(secure)}`;
}

export function clearOAuthStateCookieHeader(secure = true) {
  return `${OAUTH_STATE_COOKIE}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0${cookieSuffix(secure)}`;
}
