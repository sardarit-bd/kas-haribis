import {
  consumePasswordResetToken,
  validateNewPassword,
} from '../../../lib/password-reset';

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

  const rawToken = typeof body?.token === 'string' ? body.token.trim() : '';
  const newPassword = typeof body?.password === 'string' ? body.password : '';

  if (!rawToken) {
    return Response.json(
      { error: 'Reset token is required.' },
      { status: 400 },
    );
  }

  // Validate password policy (10–128 characters, reject whitespace-only, no silent truncation)
  const passwordCheck = validateNewPassword(newPassword);
  if (!passwordCheck.valid) {
    return Response.json(
      { error: passwordCheck.error },
      { status: 400 },
    );
  }

  // @ts-ignore
  const { env } = await import('cloudflare:workers');

  const result = await consumePasswordResetToken(env.DB, rawToken, newPassword);
  if (!result.success) {
    return Response.json(
      { error: result.error || 'Failed to reset password.' },
      { status: 400 },
    );
  }

  return Response.json(
    {
      success: true,
      message: 'Password has been reset successfully. You may now sign in.',
    },
    { status: 200 },
  );
}
