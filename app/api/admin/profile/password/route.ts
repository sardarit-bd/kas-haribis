import {
  getOwnerSecurityStatus,
  isOwnerEmail,
  removeOwnerPassword,
  setOwnerPassword,
  setOwnerPasswordEnforcement,
  validateNewPassword,
} from '../../../../lib/admin-access';
import { getUserFromCookieHeader } from '../../../../lib/auth';

async function requireOwner(request: Request): Promise<string | Response> {
  const staffHeader = request.headers.get('x-kh-staff-email');
  if (staffHeader) {
    return Response.json(
      { error: 'Staff members are not permitted to manage owner security settings.' },
      { status: 403 },
    );
  }

  const user = await getUserFromCookieHeader(request.headers.get('cookie'));
  if (!user?.email) {
    return Response.json({ error: 'Unauthorized.' }, { status: 401 });
  }

  const cleanEmail = user.email.trim().toLowerCase();
  if (!isOwnerEmail(cleanEmail)) {
    return Response.json(
      { error: 'Only authorized owners can manage administrator passwords.' },
      { status: 403 },
    );
  }

  return cleanEmail;
}

export async function GET(request: Request) {
  const auth = await requireOwner(request);
  if (auth instanceof Response) return auth;

  const { env } = await import('cloudflare:workers');
  const status = await getOwnerSecurityStatus(env.DB, auth);

  return Response.json({
    hasPassword: status.hasPassword,
    requirePassword: status.requirePassword,
  });
}

export async function POST(request: Request) {
  const auth = await requireOwner(request);
  if (auth instanceof Response) return auth;

  let body: any;
  try {
    body = await request.json();
  } catch {
    return Response.json(
      { error: 'Invalid request payload.' },
      { status: 400 },
    );
  }

  const password = body?.password;
  const confirmPassword = body?.confirmPassword;
  const requirePassword =
    typeof body?.requirePassword === 'boolean'
      ? body.requirePassword
      : undefined;

  const validation = validateNewPassword(password);
  if (!validation.valid) {
    return Response.json({ error: validation.error }, { status: 400 });
  }

  if (confirmPassword !== undefined && password !== confirmPassword) {
    return Response.json(
      { error: 'Passwords do not match.' },
      { status: 400 },
    );
  }

  const { env } = await import('cloudflare:workers');
  await setOwnerPassword(env.DB, auth, password, requirePassword);

  const status = await getOwnerSecurityStatus(env.DB, auth);
  return Response.json({
    success: true,
    hasPassword: status.hasPassword,
    requirePassword: status.requirePassword,
  });
}

export async function PATCH(request: Request) {
  const auth = await requireOwner(request);
  if (auth instanceof Response) return auth;

  let body: any;
  try {
    body = await request.json();
  } catch {
    return Response.json(
      { error: 'Invalid request payload.' },
      { status: 400 },
    );
  }

  if (typeof body?.requirePassword !== 'boolean') {
    return Response.json(
      { error: 'Field "requirePassword" must be a boolean.' },
      { status: 400 },
    );
  }

  const { env } = await import('cloudflare:workers');
  try {
    await setOwnerPasswordEnforcement(env.DB, auth, body.requirePassword);
  } catch (err: any) {
    return Response.json(
      { error: err?.message || 'Failed to update password enforcement setting.' },
      { status: 400 },
    );
  }

  const status = await getOwnerSecurityStatus(env.DB, auth);
  return Response.json({
    success: true,
    requirePassword: status.requirePassword,
  });
}

export async function DELETE(request: Request) {
  const auth = await requireOwner(request);
  if (auth instanceof Response) return auth;

  const { env } = await import('cloudflare:workers');
  await removeOwnerPassword(env.DB, auth);

  return Response.json({
    success: true,
    hasPassword: false,
    requirePassword: false,
  });
}
