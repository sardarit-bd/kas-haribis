import { buildGoogleCallbackResponse } from '../../../../lib/auth-google';

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const code = url.searchParams.get('code') || '';
    const state = url.searchParams.get('state') || '';
    if (!code || !state) {
      return new Response('Missing OAuth callback parameters.', { status: 400 });
    }
    return await buildGoogleCallbackResponse(request, code, state);
  } catch (error) {
    console.error('Google OAuth callback error:', error);
    return new Response(
      `Authentication error: ${error instanceof Error ? error.message : String(error)}`,
      { status: 500 },
    );
  }
}
