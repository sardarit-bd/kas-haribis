import { buildGoogleSignInResponse } from '../../../lib/auth-google';

export async function GET(request: Request) {
  const url = new URL(request.url);
  const returnTo = url.searchParams.get('return_to') || '/';
  return buildGoogleSignInResponse(returnTo);
}
