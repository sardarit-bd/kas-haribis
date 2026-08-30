import { buildGoogleCallbackResponse } from '../../../../lib/auth-google';

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get('code') || '';
  const state = url.searchParams.get('state') || '';
  if (!code || !state) {
    return new Response('Missing OAuth callback parameters.', { status: 400 });
  }
  return buildGoogleCallbackResponse(request, code, state);
}
