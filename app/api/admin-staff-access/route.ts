import { getRequestEmail, isOwnerRequest } from '../../lib/request-auth';
import {
  ADMIN_OWNER,
  ADMIN_SECTIONS,
  ensureAdminStaff,
  parsePermissions,
} from '../../lib/admin-access';
const clean = (value: unknown, max = 300) =>
  String(value ?? '')
    .trim()
    .slice(0, max);
async function runtime() {
  const { env } = await import('cloudflare:workers');
  await ensureAdminStaff(env.DB);
  return env;
}

export async function GET(request: Request) {
  if (!(await isOwnerRequest(request)))
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  const env = await runtime(),
    result = await env.DB.prepare(
      'SELECT * FROM admin_staff_access ORDER BY active DESC,name COLLATE NOCASE,email COLLATE NOCASE',
    ).all();
  return Response.json({ staff: result.results, sections: ADMIN_SECTIONS });
}
export async function POST(request: Request) {
  if (!(await isOwnerRequest(request)))
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  const env = await runtime(),
    body = (await request.json()) as any,
    email = clean(body.email).toLowerCase(),
    name = clean(body.name, 200),
    permissions = parsePermissions(JSON.stringify(body.permissions));
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
    return Response.json(
      { error: 'Enter a valid staff email address.' },
      { status: 400 },
    );
  if (email === ADMIN_OWNER)
    return Response.json(
      { error: 'The owner already has full access.' },
      { status: 400 },
    );
  if (!permissions.length)
    return Response.json(
      { error: 'Select at least one admin section.' },
      { status: 400 },
    );
  const now = new Date().toISOString();
  await env.DB.prepare(
    'INSERT INTO admin_staff_access(email,name,active,permissions,created_at,updated_at) VALUES(?,?,1,?,?,?) ON CONFLICT(email) DO UPDATE SET name=excluded.name,active=1,permissions=excluded.permissions,updated_at=excluded.updated_at',
  )
    .bind(email, name, JSON.stringify(permissions), now, now)
    .run();
  return Response.json({ saved: true });
}
export async function PUT(request: Request) {
  if (!(await isOwnerRequest(request)))
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  const env = await runtime(),
    body = (await request.json()) as any,
    email = clean(body.email).toLowerCase(),
    permissions = parsePermissions(JSON.stringify(body.permissions));
  if (body.permissions && !permissions.length)
    return Response.json(
      { error: 'Select at least one admin section.' },
      { status: 400 },
    );
  await env.DB.prepare(
    'UPDATE admin_staff_access SET name=?,active=?,permissions=?,updated_at=? WHERE email=?',
  )
    .bind(
      clean(body.name, 200),
      body.active ? 1 : 0,
      JSON.stringify(permissions),
      new Date().toISOString(),
      email,
    )
    .run();
  return Response.json({ saved: true });
}
export async function DELETE(request: Request) {
  if (!(await isOwnerRequest(request)))
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  const env = await runtime(),
    email = clean(new URL(request.url).searchParams.get('email')).toLowerCase();
  await env.DB.prepare('DELETE FROM admin_staff_access WHERE email=?')
    .bind(email)
    .run();
  return Response.json({ deleted: true });
}
