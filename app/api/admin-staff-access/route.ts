import {
  ADMIN_SECTIONS,
  ensureAdminStaff,
  isOwnerEmail,
  parsePermissions,
  setStaffPassword,
} from '../../lib/admin-access';
import { isOwnerRequest } from '../../lib/request-auth';
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
      'SELECT email, name, active, permissions, created_at, updated_at, (password_hash IS NOT NULL AND password_hash != "") as has_password FROM admin_staff_access ORDER BY active DESC,name COLLATE NOCASE,email COLLATE NOCASE',
    ).all();
  return Response.json({ staff: result.results, sections: ADMIN_SECTIONS });
}

export async function POST(request: Request) {
  if (!(await isOwnerRequest(request)))
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  const env = await runtime();
  let body: any;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: 'Invalid request payload.' }, { status: 400 });
  }
  const email = clean(body?.email).toLowerCase(),
    name = clean(body?.name, 200),
    password = clean(body?.password, 200),
    permissions = parsePermissions(JSON.stringify(body?.permissions));
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
    return Response.json(
      { error: 'Enter a valid staff email address.' },
      { status: 400 },
    );
  if (!isOwnerEmail(email) && !permissions.length)
    return Response.json(
      { error: 'Select at least one admin section.' },
      { status: 400 },
    );

  try {
    const existing = await env.DB.prepare(
      'SELECT email FROM admin_staff_access WHERE LOWER(email)=?',
    )
      .bind(email)
      .first();
    if (existing) {
      return Response.json(
        { error: 'A staff member with this email address already exists.' },
        { status: 409 },
      );
    }

    const now = new Date().toISOString();
    await env.DB.prepare(
      'INSERT INTO admin_staff_access(email,name,active,permissions,created_at,updated_at) VALUES(?,?,1,?,?,?)',
    )
      .bind(email, name, JSON.stringify(permissions), now, now)
      .run();

    if (password) {
      await setStaffPassword(env.DB, email, password);
    }

    return Response.json({ saved: true });
  } catch (err: any) {
    const msg = String(err?.message || '').toLowerCase();
    if (msg.includes('unique') || msg.includes('constraint') || msg.includes('primary key')) {
      return Response.json(
        { error: 'A staff member with this email address already exists.' },
        { status: 409 },
      );
    }
    return Response.json(
      { error: 'Failed to create staff access.' },
      { status: 500 },
    );
  }
}

export async function PUT(request: Request) {
  if (!(await isOwnerRequest(request)))
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  const env = await runtime();
  let body: any;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: 'Invalid request payload.' }, { status: 400 });
  }
  const email = clean(body?.email).toLowerCase(),
    password = clean(body?.password, 200),
    permissions = parsePermissions(JSON.stringify(body?.permissions));
  if (body?.permissions && !isOwnerEmail(email) && !permissions.length)
    return Response.json(
      { error: 'Select at least one admin section.' },
      { status: 400 },
    );
  try {
    await env.DB.prepare(
      'UPDATE admin_staff_access SET name=?,active=?,permissions=?,updated_at=? WHERE LOWER(email)=?',
    )
      .bind(
        clean(body?.name, 200),
        body?.active ? 1 : 0,
        JSON.stringify(permissions),
        new Date().toISOString(),
        email,
      )
      .run();

    if (password) {
      await setStaffPassword(env.DB, email, password);
    }

    return Response.json({ saved: true });
  } catch {
    return Response.json(
      { error: 'Failed to update staff access.' },
      { status: 500 },
    );
  }
}

export async function DELETE(request: Request) {
  if (!(await isOwnerRequest(request)))
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  try {
    const env = await runtime(),
      email = clean(new URL(request.url).searchParams.get('email')).toLowerCase();
    await env.DB.prepare('DELETE FROM admin_staff_access WHERE LOWER(email)=?')
      .bind(email)
      .run();
    return Response.json({ deleted: true });
  } catch {
    return Response.json(
      { error: 'Failed to remove staff member.' },
      { status: 500 },
    );
  }
}

