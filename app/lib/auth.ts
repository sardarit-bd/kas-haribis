import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { getAuthEnv } from './auth-config';
import { verifySessionToken } from './auth-google';
import {
  parseCookie,
  SESSION_COOKIE,
  toAuthUser,
  type AuthUser,
} from './auth-session';

export type { AuthUser };

const SIGN_IN_PATH = '/sign-in';

export function signInPath(returnTo: string) {
  const safeReturnTo = safeRelativeReturnPath(returnTo);
  return `${SIGN_IN_PATH}?return_to=${encodeURIComponent(safeReturnTo)}`;
}

export function signOutPath(returnTo = '/') {
  const safeReturnTo = safeRelativeReturnPath(returnTo);
  return `/api/auth/signout?return_to=${encodeURIComponent(safeReturnTo)}`;
}

export async function getCurrentUser(): Promise<AuthUser | null> {
  const config = await getAuthEnv();
  if (!config.AUTH_SECRET) return null;

  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  const payload = await verifySessionToken(token);
  return payload ? toAuthUser(payload) : null;
}

export async function requireUser(returnTo: string): Promise<AuthUser> {
  const user = await getCurrentUser();
  if (user) return user;
  redirect(signInPath(returnTo));
}

export async function getUserFromCookieHeader(
  cookieHeader: string | null,
): Promise<AuthUser | null> {
  const config = await getAuthEnv();
  if (!config.AUTH_SECRET || !cookieHeader) return null;
  const token = parseCookie(cookieHeader, SESSION_COOKIE);
  const payload = await verifySessionToken(token);
  return payload ? toAuthUser(payload) : null;
}

function safeRelativeReturnPath(value: string): string {
  if (!value.startsWith('/') || value.startsWith('//')) return '/';

  let url: URL;
  try {
    url = new URL(value, 'https://app.local');
  } catch {
    return '/';
  }
  if (url.origin !== 'https://app.local') return '/';
  if (url.pathname === SIGN_IN_PATH || url.pathname.startsWith('/api/auth/')) {
    return '/';
  }

  return `${url.pathname}${url.search}${url.hash}`;
}
