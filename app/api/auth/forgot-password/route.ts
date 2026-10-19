import { isOwnerEmail } from '../../../lib/admin-access';
import { getAdminProfileName } from '../../../lib/admin-profile';
import { getAuthEnv } from '../../../lib/auth-config';
import { createPasswordResetToken } from '../../../lib/password-reset';
import sendEmail from '../../../lib/sendEmail.js';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const GENERIC_SUCCESS_RESPONSE = {
  success: true,
  message:
    'If an account matches that email address, a password reset link has been sent.',
};

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

  const rawEmail = typeof body?.email === 'string' ? body.email : '';
  const cleanEmail = rawEmail.trim().toLowerCase();

  if (!cleanEmail || !EMAIL_REGEX.test(cleanEmail)) {
    return Response.json(
      { error: 'Please enter a valid email address.' },
      { status: 400 },
    );
  }

  // @ts-ignore
  const { env } = await import('cloudflare:workers');

  // Check if account is eligible: either Owner or active Staff
  const isOwner = isOwnerEmail(cleanEmail);
  let recipientName = 'Administrator';
  let isEligible = false;

  if (isOwner) {
    isEligible = true;
    const profileName = await getAdminProfileName(env.DB, cleanEmail);
    if (profileName) {
      recipientName = profileName;
    }
  } else {
    try {
      const staffRow = (await env.DB.prepare(
        'SELECT name, active FROM admin_staff_access WHERE LOWER(email)=? AND active=1',
      )
        .bind(cleanEmail)
        .first()) as { name?: string; active?: number } | null | undefined;

      if (staffRow && staffRow.active === 1) {
        isEligible = true;
        recipientName = String(staffRow.name || '').trim() || 'Staff Member';
      }
    } catch (err: any) {
      console.error('Error checking staff eligibility:', err?.message || err);
    }
  }

  // If not an eligible account, return identical generic response to prevent account enumeration
  if (!isEligible) {
    return Response.json(GENERIC_SUCCESS_RESPONSE, { status: 200 });
  }

  // Generate secure reset token
  let rawToken: string;
  try {
    const tokenResult = await createPasswordResetToken(env.DB, cleanEmail);
    rawToken = tokenResult.rawToken;
  } catch (err: any) {
    console.error('Error creating password reset token:', err?.message || err);
    // Return generic response to avoid leaking server state
    return Response.json(GENERIC_SUCCESS_RESPONSE, { status: 200 });
  }

  // Construct reset link using configured APP_URL only, never incoming Host header
  const authConfig = await getAuthEnv();
  const baseUrl = authConfig.APP_URL || 'http://localhost:5173';
  const resetUrl = `${baseUrl}/reset-password?token=${encodeURIComponent(rawToken)}`;

  // Dispatch reset email
  try {
    await sendEmail(
      cleanEmail,
      'Reset your Kav Haribis password',
      {
        resetUrl,
        name: recipientName,
        expireMinutes: 60,
      },
      'password-reset',
    );
  } catch (mailError: any) {
    // Log failure server-side without revealing error to client or leaking reset tokens
    console.error(
      'Password reset email delivery failed:',
      mailError?.message || mailError,
    );
  }

  return Response.json(GENERIC_SUCCESS_RESPONSE, { status: 200 });
}
