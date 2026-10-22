import { isOwnerRequest } from '../../../lib/request-auth';
import { ensureBankPremium, passwordRecord } from '../../../lib/bank-premium';

async function requirePremiumOwner(request: Request) {
  return (
    !request.headers.get('x-kh-staff-email') &&
    (await isOwnerRequest(request))
  );
}
const clean = (value: unknown, max: number) =>
  String(value || '')
    .trim()
    .slice(0, max);
export async function GET(request: Request) {
  if (!(await requirePremiumOwner(request)))
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  const { env } = await import('cloudflare:workers');
  await ensureBankPremium(env.DB);
  const result = await env.DB.prepare(
    'SELECT id,email,name,active,access_type,expires_at,notes,created_at,updated_at,last_login_at,login_count FROM bank_premium_members ORDER BY active DESC,name COLLATE NOCASE,email COLLATE NOCASE',
  ).all();
  return Response.json({ members: result.results });
}
export async function POST(request: Request) {
  if (!(await requirePremiumOwner(request)))
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  let body: any;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: 'Invalid request payload.' }, { status: 400 });
  }
  const { env } = await import('cloudflare:workers'),
    id = clean(body?.id, 80),
    email = clean(body?.email, 240).toLowerCase(),
    name = clean(body?.name, 160),
    password = clean(body?.password, 200),
    accessType = body?.access_type === 'temporary' ? 'temporary' : 'permanent',
    expiresAt = accessType === 'temporary' ? clean(body?.expires_at, 40) : '',
    notes = clean(body?.notes, 1000),
    active = body?.active === false ? 0 : 1;
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || !name)
    return Response.json(
      { error: "Enter the member's name and a valid email address." },
      { status: 400 },
    );
  if (accessType === 'temporary' && !expiresAt)
    return Response.json(
      { error: 'Choose an expiration date for temporary access.' },
      { status: 400 },
    );
  await ensureBankPremium(env.DB);
  const now = new Date().toISOString();
  try {
    if (id) {
      const current = await env.DB.prepare(
        'SELECT id FROM bank_premium_members WHERE id=?',
      )
        .bind(id)
        .first();
      if (!current)
        return Response.json({ error: 'Member not found.' }, { status: 404 });

      const duplicate = await env.DB.prepare(
        'SELECT id FROM bank_premium_members WHERE LOWER(email)=? AND id != ?',
      )
        .bind(email, id)
        .first();
      if (duplicate) {
        return Response.json(
          { error: 'A premium member already uses that email address.' },
          { status: 409 },
        );
      }

      if (password) {
        if (password.length < 8)
          return Response.json(
            { error: 'Use a password with at least 8 characters.' },
            { status: 400 },
          );
        const record = await passwordRecord(password);
        await env.DB.prepare(
          'UPDATE bank_premium_members SET email=?,name=?,password_salt=?,password_hash=?,active=?,access_type=?,expires_at=?,notes=?,updated_at=? WHERE id=?',
        )
          .bind(
            email,
            name,
            record.salt,
            record.hash,
            active,
            accessType,
            expiresAt,
            notes,
            now,
            id,
          )
          .run();
        await env.DB.prepare(
          'DELETE FROM bank_premium_sessions WHERE member_id=?',
        )
          .bind(id)
          .run();
      } else {
        await env.DB.prepare(
          'UPDATE bank_premium_members SET email=?,name=?,active=?,access_type=?,expires_at=?,notes=?,updated_at=? WHERE id=?',
        )
          .bind(email, name, active, accessType, expiresAt, notes, now, id)
          .run();
      }
      return Response.json({ saved: true });
    }

    const duplicate = await env.DB.prepare(
      'SELECT id FROM bank_premium_members WHERE LOWER(email)=?',
    )
      .bind(email)
      .first();
    if (duplicate) {
      return Response.json(
        { error: 'A premium member already uses that email address.' },
        { status: 409 },
      );
    }

    if (password.length < 8)
      return Response.json(
        { error: 'Use a password with at least 8 characters.' },
        { status: 400 },
      );
    const record = await passwordRecord(password),
      newId = crypto.randomUUID();
    await env.DB.prepare(
      'INSERT INTO bank_premium_members(id,email,name,password_salt,password_hash,active,access_type,expires_at,notes,created_at,updated_at) VALUES(?,?,?,?,?,?,?,?,?,?,?)',
    )
      .bind(
        newId,
        email,
        name,
        record.salt,
        record.hash,
        active,
        accessType,
        expiresAt,
        notes,
        now,
        now,
      )
      .run();
    return Response.json({ saved: true, id: newId });
  } catch (error) {
    const msg = String(error instanceof Error ? error.message : error || '').toLowerCase();
    if (msg.includes('unique') || msg.includes('constraint') || msg.includes('primary key')) {
      return Response.json(
        { error: 'A premium member already uses that email address.' },
        { status: 409 },
      );
    }
    return Response.json(
      { error: 'The premium member could not be saved.' },
      { status: 500 },
    );
  }
}
export async function DELETE(request: Request) {
  if (!(await requirePremiumOwner(request)))
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  const id = clean(new URL(request.url).searchParams.get('id'), 80);
  if (!id)
    return Response.json({ error: 'Member ID is required.' }, { status: 400 });
  try {
    const { env } = await import('cloudflare:workers');
    await ensureBankPremium(env.DB);
    await dbDelete(env.DB, id);
    return Response.json({ deleted: true });
  } catch {
    return Response.json(
      { error: 'Failed to remove premium member.' },
      { status: 500 },
    );
  }
}
async function dbDelete(db: any, id: string) {
  await db.batch([
    db.prepare('DELETE FROM bank_premium_sessions WHERE member_id=?').bind(id),
    db.prepare('DELETE FROM bank_premium_members WHERE id=?').bind(id),
  ]);
}
