const COOKIE = 'kh_bank_premium';
const SESSION_SECONDS = 60 * 60 * 24 * 30;

export async function ensureBankPremium(db: any) {
  await db.batch([
    db.prepare(
      "CREATE TABLE IF NOT EXISTS bank_premium_members (id TEXT PRIMARY KEY,email TEXT NOT NULL UNIQUE,name TEXT NOT NULL DEFAULT '',password_salt TEXT NOT NULL,password_hash TEXT NOT NULL,active INTEGER NOT NULL DEFAULT 1,access_type TEXT NOT NULL DEFAULT 'permanent',expires_at TEXT NOT NULL DEFAULT '',notes TEXT NOT NULL DEFAULT '',created_at TEXT NOT NULL,updated_at TEXT NOT NULL,last_login_at TEXT NOT NULL DEFAULT '',login_count INTEGER NOT NULL DEFAULT 0)",
    ),
    db.prepare(
      'CREATE TABLE IF NOT EXISTS bank_premium_sessions (token_hash TEXT PRIMARY KEY,member_id TEXT NOT NULL,created_at TEXT NOT NULL,expires_at TEXT NOT NULL)',
    ),
    db.prepare(
      'CREATE INDEX IF NOT EXISTS bank_premium_sessions_member_idx ON bank_premium_sessions(member_id)',
    ),
    db.prepare(
      "CREATE TABLE IF NOT EXISTS bank_premium_login_attempts (attempt_key TEXT PRIMARY KEY,failures INTEGER NOT NULL DEFAULT 0,blocked_until TEXT NOT NULL DEFAULT '',updated_at TEXT NOT NULL)",
    ),
  ]);
}
const encoder = new TextEncoder();
const toHex = (bytes: Uint8Array) =>
  Array.from(bytes, (value) => value.toString(16).padStart(2, '0')).join('');
const fromHex = (hex: string) =>
  new Uint8Array(
    (hex.match(/.{1,2}/g) || []).map((value) => Number.parseInt(value, 16)),
  );
const randomHex = (length: number) => {
  const bytes = new Uint8Array(length);
  crypto.getRandomValues(bytes);
  return toHex(bytes);
};
async function sha(value: string) {
  return toHex(
    new Uint8Array(
      await crypto.subtle.digest('SHA-256', encoder.encode(value)),
    ),
  );
}
async function derive(password: string, salt: string) {
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(password),
    'PBKDF2',
    false,
    ['deriveBits'],
  );
  return toHex(
    new Uint8Array(
      await crypto.subtle.deriveBits(
        {
          name: 'PBKDF2',
          hash: 'SHA-256',
          salt: fromHex(salt),
          iterations: 150000,
        },
        key,
        256,
      ),
    ),
  );
}
function equal(a: string, b: string) {
  if (a.length !== b.length) return false;
  let difference = 0;
  for (let i = 0; i < a.length; i++)
    difference |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return difference === 0;
}
function cookieValue(headers: Headers) {
  for (const part of String(headers.get('cookie') || '').split(';')) {
    const [key, ...value] = part.trim().split('=');
    if (key === COOKIE) return value.join('=');
  }
  return '';
}

export async function passwordRecord(password: string) {
  const salt = randomHex(16);
  return { salt, hash: await derive(password, salt) };
}
export async function passwordMatches(
  password: string,
  salt: string,
  hash: string,
) {
  return equal(await derive(password, salt), hash);
}
export async function createPremiumSession(db: any, memberId: string) {
  const token = randomHex(32),
    now = new Date(),
    expires = new Date(now.getTime() + SESSION_SECONDS * 1000);
  await db.batch([
    db
      .prepare('DELETE FROM bank_premium_sessions WHERE expires_at<=?')
      .bind(now.toISOString()),
    db
      .prepare(
        'INSERT INTO bank_premium_sessions(token_hash,member_id,created_at,expires_at) VALUES(?,?,?,?)',
      )
      .bind(
        await sha(token),
        memberId,
        now.toISOString(),
        expires.toISOString(),
      ),
  ]);
  return { token, maxAge: SESSION_SECONDS };
}
export function premiumCookie(token: string, maxAge: number) {
  return `${COOKIE}=${token}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=${maxAge}`;
}
export function clearPremiumCookie() {
  return `${COOKIE}=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0`;
}
export async function premiumMemberFromHeaders(headers: Headers, db: any) {
  const token = cookieValue(headers);
  if (!token) return null;
  await ensureBankPremium(db);
  return (await db
    .prepare(
      "SELECT m.id,m.email,m.name FROM bank_premium_sessions s JOIN bank_premium_members m ON m.id=s.member_id WHERE s.token_hash=? AND s.expires_at>? AND m.active=1 AND (m.access_type='permanent' OR m.expires_at>?)",
    )
    .bind(await sha(token), new Date().toISOString(), new Date().toISOString())
    .first()) as any;
}
export async function attemptAllowed(db: any, email: string, ip: string) {
  const key = await sha(`${ip}|${email}`),
    row = (await db
      .prepare(
        'SELECT blocked_until FROM bank_premium_login_attempts WHERE attempt_key=?',
      )
      .bind(key)
      .first()) as any;
  return {
    key,
    allowed:
      !row?.blocked_until ||
      String(row.blocked_until) <= new Date().toISOString(),
  };
}
export async function recordFailure(db: any, key: string) {
  const now = new Date(),
    row = (await db
      .prepare(
        'SELECT failures,updated_at FROM bank_premium_login_attempts WHERE attempt_key=?',
      )
      .bind(key)
      .first()) as any,
    recent =
      row &&
      Date.now() - new Date(String(row.updated_at)).getTime() < 15 * 60 * 1000,
    failures = recent ? Number(row.failures || 0) + 1 : 1,
    blocked =
      failures >= 5
        ? new Date(now.getTime() + 15 * 60 * 1000).toISOString()
        : '';
  await db
    .prepare(
      'INSERT INTO bank_premium_login_attempts(attempt_key,failures,blocked_until,updated_at) VALUES(?,?,?,?) ON CONFLICT(attempt_key) DO UPDATE SET failures=excluded.failures,blocked_until=excluded.blocked_until,updated_at=excluded.updated_at',
    )
    .bind(key, failures, blocked, now.toISOString())
    .run();
}
export async function clearFailures(db: any, key: string) {
  await db
    .prepare('DELETE FROM bank_premium_login_attempts WHERE attempt_key=?')
    .bind(key)
    .run();
}
