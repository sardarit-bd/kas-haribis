import { getRequestEmail, isOwnerRequest } from '../../lib/request-auth';
import { ADMIN_OWNER } from '../../lib/admin-access';
import { ensureBankResearch } from '../../lib/directories';
import {
  ensureResearchAccess,
  setResearcherCredential,
} from '../../lib/research-access';
const OWNER = ADMIN_OWNER;
const clean = (v: unknown, n = 300) =>
  String(v ?? '')
    .trim()
    .slice(0, n);
async function runtime() {
  const { env } = await import('cloudflare:workers');
  await Promise.all([ensureBankResearch(env.DB), ensureResearchAccess(env.DB)]);
  return env;
}
const query =
  'SELECT r.*,CASE WHEN c.email IS NULL THEN 0 ELSE 1 END AS code_configured,c.access_type,c.expires_at,c.updated_at AS code_updated_at FROM bank_researchers r LEFT JOIN bank_researcher_credentials c ON c.email=r.email ORDER BY r.active DESC,r.name COLLATE NOCASE,r.email COLLATE NOCASE';
export async function GET(request: Request) {
  if (!(await isOwnerRequest(request)))
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  const env = await runtime(),
    result = await env.DB.prepare(query).all();
  return Response.json({ researchers: result.results });
}
function credentialInput(b: any) {
  const code = clean(b.code, 6),
    accessType = b.access_type === 'temporary' ? 'temporary' : 'permanent',
    rawExpiration = clean(b.expires_at, 40),
    expiresAt =
      accessType === 'temporary' && rawExpiration
        ? new Date(rawExpiration).toISOString()
        : '';
  if (!/^\d{6}$/.test(code))
    throw new Error('Enter exactly six digits for this researcher.');
  if (
    accessType === 'temporary' &&
    (!expiresAt || expiresAt <= new Date().toISOString())
  )
    throw new Error('Choose a future expiration date and time.');
  return { code, accessType, expiresAt };
}
export async function POST(request: Request) {
  if (!(await isOwnerRequest(request)))
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  const env = await runtime(),
    b = (await request.json()) as any,
    email = clean(b.email).toLowerCase(),
    name = clean(b.name, 200);
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
    return Response.json(
      { error: 'Enter a valid researcher email.' },
      { status: 400 },
    );
  try {
    const c = credentialInput(b);
    await env.DB.prepare(
      'INSERT INTO bank_researchers(email,name,active,created_at) VALUES(?,?,1,?) ON CONFLICT(email) DO UPDATE SET name=excluded.name,active=1',
    )
      .bind(email, name, new Date().toISOString())
      .run();
    await setResearcherCredential(
      env.DB,
      email,
      c.code,
      c.accessType,
      c.expiresAt,
    );
    return Response.json({ saved: true });
  } catch (error) {
    return Response.json(
      {
        error:
          error instanceof Error ? error.message : 'Access could not be saved.',
      },
      { status: 400 },
    );
  }
}
export async function PUT(request: Request) {
  if (!(await isOwnerRequest(request)))
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  const env = await runtime(),
    b = (await request.json()) as any,
    email = clean(b.email).toLowerCase();
  if (b.code) {
    try {
      const c = credentialInput(b);
      await setResearcherCredential(
        env.DB,
        email,
        c.code,
        c.accessType,
        c.expiresAt,
      );
    } catch (error) {
      return Response.json(
        {
          error:
            error instanceof Error ? error.message : 'Code could not be saved.',
        },
        { status: 400 },
      );
    }
  } else {
    await env.DB.prepare(
      'UPDATE bank_researchers SET name=?,active=? WHERE email=?',
    )
      .bind(clean(b.name, 200), b.active ? 1 : 0, email)
      .run();
    if (!b.active)
      await env.DB.prepare('DELETE FROM bank_research_sessions WHERE email=?')
        .bind(email)
        .run();
  }
  return Response.json({ saved: true });
}
export async function DELETE(request: Request) {
  if (!(await isOwnerRequest(request)))
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  const env = await runtime(),
    email = clean(new URL(request.url).searchParams.get('email')).toLowerCase();
  await env.DB.batch([
    env.DB.prepare(
      'DELETE FROM bank_researcher_credentials WHERE email=?',
    ).bind(email),
    env.DB.prepare('DELETE FROM bank_research_sessions WHERE email=?').bind(
      email,
    ),
    env.DB.prepare('DELETE FROM bank_researchers WHERE email=?').bind(email),
  ]);
  return Response.json({ deleted: true });
}
