import { isOwnerRequest } from '../../lib/request-auth';

async function runtime() {
  const { env } = await import('cloudflare:workers');
  return env as unknown as Record<string, any>;
}

async function table(db: any) {
  await db
    .prepare(
      'CREATE TABLE IF NOT EXISTS email_settings (name TEXT PRIMARY KEY, value TEXT NOT NULL, updated_at TEXT NOT NULL)',
    )
    .run();
}

async function encrypt(value: string, secret: string) {
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const keyBuffer = await crypto.subtle.digest(
    'SHA-256',
    new TextEncoder().encode(secret),
  );
  const key = await crypto.subtle.importKey(
    'raw',
    keyBuffer,
    'AES-GCM',
    false,
    ['encrypt'],
  );
  const out = new Uint8Array(
    await crypto.subtle.encrypt(
      { name: 'AES-GCM', iv },
      key,
      new TextEncoder().encode(value),
    ),
  );
  return `${btoa(String.fromCharCode(...iv))}.${btoa(String.fromCharCode(...out))}`;
}

export async function GET(request: Request) {
  if (
    !(await isOwnerRequest(request))
  )
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  const env = await runtime();
  await table(env.DB);
  const rows = await env.DB.prepare('SELECT name FROM email_settings').all();
  const names = (rows.results as Array<{ name: string }>).map((x) => x.name);
  const emailUserConfigured = names.includes('emailUser');
  const emailPasswordConfigured = names.includes('emailPassword');
  return Response.json({
    emailUser: emailUserConfigured,
    emailPassword: emailPasswordConfigured,
    emailReady: emailUserConfigured && emailPasswordConfigured,
  });
}

export async function POST(request: Request) {
  if (
    !(await isOwnerRequest(request))
  )
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  const env = await runtime();
  const secret = env.CARDKNOX_SETTINGS_KEY || 'kav-haribis-email-secret-key';
  await table(env.DB);
  const body = (await request.json()) as Record<string, string>;
  for (const name of ['emailUser', 'emailPassword']) {
    if (body[name]?.trim()) {
      const value = await encrypt(body[name].trim(), secret);
      await env.DB.prepare(
        'INSERT INTO email_settings(name,value,updated_at) VALUES(?,?,?) ON CONFLICT(name) DO UPDATE SET value=excluded.value,updated_at=excluded.updated_at',
      )
        .bind(name, value, new Date().toISOString())
        .run();
    }
  }
  return Response.json({ saved: true });
}
