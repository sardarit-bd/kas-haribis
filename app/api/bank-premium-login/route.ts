import {
  attemptAllowed,
  clearFailures,
  clearPremiumCookie,
  createPremiumSession,
  ensureBankPremium,
  passwordMatches,
  premiumCookie,
  premiumMemberFromHeaders,
  recordFailure,
} from '../../lib/bank-premium';
const clean = (value: unknown, max: number) =>
  String(value || '')
    .trim()
    .slice(0, max);
export async function GET(request: Request) {
  const { env } = await import('cloudflare:workers'),
    member = await premiumMemberFromHeaders(request.headers, env.DB);
  return Response.json({
    authenticated: Boolean(member),
    member: member ? { name: member.name, email: member.email } : null,
  });
}
export async function POST(request: Request) {
  const body = (await request.json()) as any,
    email = clean(body.email, 240).toLowerCase(),
    password = clean(body.password, 200),
    bankId = clean(body.bankId, 80);
  if (!email || !password || !bankId)
    return Response.json(
      { error: 'Enter your premium email address and password.' },
      { status: 400 },
    );
  const { env } = await import('cloudflare:workers');
  await ensureBankPremium(env.DB);
  const bank = await env.DB.prepare(
    'SELECT id FROM banks WHERE id=? AND length(full_report)>0',
  )
    .bind(bankId)
    .first();
  if (!bank)
    return Response.json(
      { error: 'This full report is not available.' },
      { status: 404 },
    );
  const ip = clean(
      request.headers.get('cf-connecting-ip') ||
        request.headers.get('x-forwarded-for') ||
        'unknown',
      120,
    ),
    attempt = await attemptAllowed(env.DB, email, ip);
  if (!attempt.allowed)
    return Response.json(
      {
        error: 'Too many attempts. Please wait 15 minutes before trying again.',
      },
      { status: 429 },
    );
  const member = (await env.DB.prepare(
      'SELECT * FROM bank_premium_members WHERE email=?',
    )
      .bind(email)
      .first()) as any,
    valid =
      member &&
      member.active &&
      (member.access_type === 'permanent' ||
        String(member.expires_at) > new Date().toISOString()) &&
      (await passwordMatches(
        password,
        String(member.password_salt),
        String(member.password_hash),
      ));
  if (!valid) {
    await recordFailure(env.DB, attempt.key);
    return Response.json(
      {
        error:
          'The email address or password is not valid, or this membership is inactive.',
      },
      { status: 403 },
    );
  }
  await clearFailures(env.DB, attempt.key);
  const session = await createPremiumSession(env.DB, String(member.id)),
    now = new Date().toISOString();
  await env.DB.prepare(
    'UPDATE bank_premium_members SET last_login_at=?,login_count=login_count+1 WHERE id=?',
  )
    .bind(now, member.id)
    .run();
  return Response.json(
    {
      authenticated: true,
      reportUrl: `/bank-directory/full-report?bankId=${encodeURIComponent(bankId)}`,
    },
    { headers: { 'set-cookie': premiumCookie(session.token, session.maxAge) } },
  );
}
export async function DELETE() {
  return Response.json(
    { signedOut: true },
    { headers: { 'set-cookie': clearPremiumCookie() } },
  );
}
