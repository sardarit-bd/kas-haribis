import { getRequestEmail, isOwnerRequest } from '../../lib/request-auth';
async function runtime() {
  const { env } = await import('cloudflare:workers');
  return env as unknown as Record<string, any>;
}
async function table(db: any) {
  await db
    .prepare(
      'CREATE TABLE IF NOT EXISTS payment_settings (name TEXT PRIMARY KEY, value TEXT NOT NULL, updated_at TEXT NOT NULL)',
    )
    .run();
}
function bytes(hex: string) {
  return Uint8Array.from(hex.match(/.{2}/g) || [], (b) => parseInt(b, 16));
}
async function encrypt(value: string, keyHex: string) {
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const key = await crypto.subtle.importKey(
    'raw',
    bytes(keyHex),
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
  const rows = await env.DB.prepare('SELECT name FROM payment_settings').all();
  const names = (rows.results as Array<{ name: string }>).map((x) => x.name);
  return Response.json({
    apiKey: names.includes('apiKey'),
    ifieldsKey: names.includes('ifieldsKey'),
    ifieldsToken: names.includes('ifieldsToken'),
    ready: names.includes('apiKey') && names.includes('ifieldsKey'),
  });
}
export async function POST(request: Request) {
  if (
    !(await isOwnerRequest(request))
  )
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  const env = await runtime();
  if (!env.CARDKNOX_SETTINGS_KEY)
    return Response.json(
      { error: 'Encryption is unavailable.' },
      { status: 500 },
    );
  await table(env.DB);
  const body = (await request.json()) as Record<string, string>;
  for (const name of ['apiKey', 'ifieldsKey', 'ifieldsToken']) {
    if (body[name]?.trim()) {
      const value = await encrypt(body[name].trim(), env.CARDKNOX_SETTINGS_KEY);
      await env.DB.prepare(
        'INSERT INTO payment_settings(name,value,updated_at) VALUES(?,?,?) ON CONFLICT(name) DO UPDATE SET value=excluded.value,updated_at=excluded.updated_at',
      )
        .bind(name, value, new Date().toISOString())
        .run();
    }
  }
  return Response.json({ saved: true });
}
