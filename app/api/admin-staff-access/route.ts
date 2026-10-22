import {
  ADMIN_SECTIONS,
  createStaffPasswordCredentials,
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
  // @ts-ignore
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
  const staff = (result.results || []).filter((s: any) => !isOwnerEmail(s.email));
  return Response.json({ staff, sections: ADMIN_SECTIONS });
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

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
    return Response.json(
      { error: 'Enter a valid staff email address.' },
      { status: 400 },
    );

  if (isOwnerEmail(email)) {
    return Response.json(
      { error: 'This email belongs to an admin account and cannot be managed as staff.' },
      { status: 400 },
    );
  }

  if (!permissions.length)
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

    let passwordSalt = '';
    let passwordHash = '';
    if (password) {
      const creds = await createStaffPasswordCredentials(password);
      passwordSalt = creds.salt;
      passwordHash = creds.hash;
    }

    const now = new Date().toISOString();
    await env.DB.prepare(
      'INSERT INTO admin_staff_access(email,name,active,permissions,password_salt,password_hash,created_at,updated_at) VALUES(?,?,1,?,?,?,?,?)',
    )
      .bind(
        email,
        name,
        JSON.stringify(permissions),
        passwordSalt,
        passwordHash,
        now,
        now,
      )
      .run();

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
    newEmail = clean(body?.newEmail || body?.targetEmail).toLowerCase(),
    password = clean(body?.password, 200),
    permissions = parsePermissions(JSON.stringify(body?.permissions));

  if (isOwnerEmail(email) || (newEmail && isOwnerEmail(newEmail))) {
    return Response.json(
      { error: 'This email belongs to an admin account and cannot be managed as staff.' },
      { status: 400 },
    );
  }

  if (body?.permissions && !permissions.length)
    return Response.json(
      { error: 'Select at least one admin section.' },
      { status: 400 },
    );
  try {
    let passwordSalt: string | null = null;
    let passwordHash: string | null = null;
    if (password) {
      const creds = await createStaffPasswordCredentials(password);
      passwordSalt = creds.salt;
      passwordHash = creds.hash;
    }

    const now = new Date().toISOString();
    if (password && passwordSalt && passwordHash) {
      await env.DB.prepare(
        'UPDATE admin_staff_access SET name=?,active=?,permissions=?,password_salt=?,password_hash=?,updated_at=? WHERE LOWER(email)=?',
      )
        .bind(
          clean(body?.name, 200),
          body?.active ? 1 : 0,
          JSON.stringify(permissions),
          passwordSalt,
          passwordHash,
          now,
          email,
        )
        .run();
    } else {
      await env.DB.prepare(
        'UPDATE admin_staff_access SET name=?,active=?,permissions=?,updated_at=? WHERE LOWER(email)=?',
      )
        .bind(
          clean(body?.name, 200),
          body?.active ? 1 : 0,
          JSON.stringify(permissions),
          now,
          email,
        )
        .run();
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

