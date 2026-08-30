import {
  clearLoginFailures,
  createResearchSession,
  ensureResearchAccess,
  loginAttemptAllowed,
  recordLoginFailure,
  researchSessionCookie,
  verifyResearcherCredential,
} from '../../lib/research-access';
import { ensureBankResearch } from '../../lib/directories';

const clean = (value: unknown, max = 300) =>
  String(value ?? '')
    .trim()
    .slice(0, max);

export async function POST(request: Request) {
  const { env } = await import('cloudflare:workers');
  await Promise.all([ensureBankResearch(env.DB), ensureResearchAccess(env.DB)]);
  const body = (await request.json()) as any,
    email = clean(body.email).toLowerCase(),
    code = clean(body.code, 6),
    ip = clean(request.headers.get('cf-connecting-ip') || 'unknown', 100);
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || !/^\d{6}$/.test(code))
    return Response.json(
      { error: 'Enter your approved email address and six-digit access code.' },
      { status: 400 },
    );
  const attempt = await loginAttemptAllowed(env.DB, email, ip);
  if (!attempt.allowed)
    return Response.json(
      {
        error:
          'Too many unsuccessful attempts. Please wait 15 minutes and try again.',
      },
      { status: 429 },
    );
  const researcher = await env.DB.prepare(
    'SELECT email FROM bank_researchers WHERE email=? AND active=1',
  )
    .bind(email)
    .first();
  const valid =
    Boolean(researcher) &&
    (await verifyResearcherCredential(env.DB, email, code));
  if (!valid) {
    await recordLoginFailure(env.DB, attempt.key);
    return Response.json(
      { error: 'The email address or access code is not approved.' },
      { status: 403 },
    );
  }
  await clearLoginFailures(env.DB, attempt.key);
  const session = await createResearchSession(env.DB, email);
  return Response.json(
    { ok: true, redirect: '/research/lenders' },
    {
      headers: {
        'set-cookie': researchSessionCookie(session.token, session.maxAge),
        'cache-control': 'no-store',
      },
    },
  );
}
