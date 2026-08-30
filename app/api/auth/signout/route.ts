import { getAuthEnv } from '../../../lib/auth-config';
import {
  clearSessionCookieHeader,
  useSecureCookies,
} from '../../../lib/auth-session';

function safeReturnPath(value: string | null) {
  if (!value || !value.startsWith('/') || value.startsWith('//')) return '/';
  try {
    const url = new URL(value, 'https://app.local');
    if (url.origin !== 'https://app.local') return '/';
    return `${url.pathname}${url.search}${url.hash}`;
  } catch {
    return '/';
  }
}

export async function GET(request: Request) {
  const config = await getAuthEnv();
  const secureCookies = useSecureCookies(config.APP_URL);
  const url = new URL(request.url);
  const returnTo = safeReturnPath(url.searchParams.get('return_to'));

  return new Response(null, {
    status: 302,
    headers: {
      Location: returnTo,
      'Set-Cookie': clearSessionCookieHeader(secureCookies),
    },
  });
}
