import { ADMIN_OWNER } from './admin-access';
import { getUserFromCookieHeader } from './auth';

const OWNER = ADMIN_OWNER;
const SESSION_COOKIE = 'kh_research_session';
const SESSION_SECONDS = 60 * 60 * 12;

export async function ensureResearchAccess(db: any) {
  await db.batch([
    db.prepare(
      'CREATE TABLE IF NOT EXISTS bank_research_access_config (id INTEGER PRIMARY KEY CHECK(id=1),code_salt TEXT NOT NULL,code_hash TEXT NOT NULL,updated_at TEXT NOT NULL)',
    ),
    db.prepare(
      'CREATE TABLE IF NOT EXISTS bank_research_sessions (token_hash TEXT PRIMARY KEY,email TEXT NOT NULL,created_at TEXT NOT NULL,expires_at TEXT NOT NULL)',
    ),
    db.prepare(
      'CREATE INDEX IF NOT EXISTS bank_research_sessions_email_idx ON bank_research_sessions(email)',
    ),
    db.prepare(
      "CREATE TABLE IF NOT EXISTS bank_research_login_attempts (attempt_key TEXT PRIMARY KEY,failures INTEGER NOT NULL DEFAULT 0,blocked_until TEXT NOT NULL DEFAULT '',updated_at TEXT NOT NULL)",
    ),
    db.prepare(
      "CREATE TABLE IF NOT EXISTS bank_researcher_credentials (email TEXT PRIMARY KEY,code_salt TEXT NOT NULL,code_hash TEXT NOT NULL,access_type TEXT NOT NULL DEFAULT 'permanent',expires_at TEXT NOT NULL DEFAULT '',updated_at TEXT NOT NULL)",
    ),
  ]);
}

const bytesToHex = (bytes: Uint8Array) =>
  Array.from(bytes)
    .map((value) => value.toString(16).padStart(2, '0'))
    .join('');
const hexToBytes = (hex: string) =>
  new Uint8Array(
    (hex.match(/.{1,2}/g) || []).map((value) => Number.parseInt(value, 16)),
  );
const randomHex = (length: number) => {
  const bytes = new Uint8Array(length);
  crypto.getRandomValues(bytes);
  return bytesToHex(bytes);
};

async function sha256(value: string) {
  return bytesToHex(
    new Uint8Array(
      await crypto.subtle.digest('SHA-256', new TextEncoder().encode(value)),
    ),
  );
}

async function deriveCode(code: string, salt: string) {
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(code),
    'PBKDF2',
    false,
    ['deriveBits'],
  );
  const bits = await crypto.subtle.deriveBits(
    {
      name: 'PBKDF2',
      hash: 'SHA-256',
      salt: hexToBytes(salt),
      iterations: 120000,
    },
    key,
    256,
  );
  return bytesToHex(new Uint8Array(bits));
}

export async function setResearchAccessCode(db: any, code: string) {
  await ensureResearchAccess(db);
  const salt = randomHex(16),
    hash = await deriveCode(code, salt),
    now = new Date().toISOString();
  await db.batch([
    db
      .prepare(
        'INSERT INTO bank_research_access_config(id,code_salt,code_hash,updated_at) VALUES(1,?,?,?) ON CONFLICT(id) DO UPDATE SET code_salt=excluded.code_salt,code_hash=excluded.code_hash,updated_at=excluded.updated_at',
      )
      .bind(salt, hash, now),
    db.prepare('DELETE FROM bank_research_sessions'),
    db.prepare('DELETE FROM bank_research_login_attempts'),
  ]);
  return now;
}

export async function researchAccessStatus(db: any) {
  await ensureResearchAccess(db);
  const row = (await db
    .prepare('SELECT updated_at FROM bank_research_access_config WHERE id=1')
    .first()) as any;
  return { configured: Boolean(row), updatedAt: String(row?.updated_at || '') };
}

export async function verifyResearchAccessCode(db: any, code: string) {
  await ensureResearchAccess(db);
  const row = (await db
    .prepare(
      'SELECT code_salt,code_hash FROM bank_research_access_config WHERE id=1',
    )
    .first()) as any;
  if (!row) return false;
  const actual = await deriveCode(code, String(row.code_salt));
  return timingSafeEqual(actual, String(row.code_hash));
}

export async function setResearcherCredential(
  db: any,
  email: string,
  code: string,
  accessType: string,
  expiresAt = '',
) {
  await ensureResearchAccess(db);
  const type = accessType === 'temporary' ? 'temporary' : 'permanent';
  if (type === 'temporary' && !expiresAt)
    throw new Error('Choose when temporary access expires.');
  const salt = randomHex(16),
    hash = await deriveCode(code, salt),
    now = new Date().toISOString();
  await db.batch([
    db
      .prepare(
        'INSERT INTO bank_researcher_credentials(email,code_salt,code_hash,access_type,expires_at,updated_at) VALUES(?,?,?,?,?,?) ON CONFLICT(email) DO UPDATE SET code_salt=excluded.code_salt,code_hash=excluded.code_hash,access_type=excluded.access_type,expires_at=excluded.expires_at,updated_at=excluded.updated_at',
      )
      .bind(
        email,
        salt,
        hash,
        type,
        type === 'temporary' ? expiresAt : '',
        now,
      ),
    db.prepare('DELETE FROM bank_research_sessions WHERE email=?').bind(email),
  ]);
}

export async function verifyResearcherCredential(
  db: any,
  email: string,
  code: string,
) {
  await ensureResearchAccess(db);
  const row = (await db
    .prepare(
      'SELECT code_salt,code_hash,access_type,expires_at FROM bank_researcher_credentials WHERE email=?',
    )
    .bind(email)
    .first()) as any;
  if (!row) return false;
  if (
    String(row.access_type) === 'temporary' &&
    (!row.expires_at || String(row.expires_at) <= new Date().toISOString())
  )
    return false;
  return timingSafeEqual(
    await deriveCode(code, String(row.code_salt)),
    String(row.code_hash),
  );
}

function timingSafeEqual(a: string, b: string) {
  if (a.length !== b.length) return false;
  let difference = 0;
  for (let index = 0; index < a.length; index++)
    difference |= a.charCodeAt(index) ^ b.charCodeAt(index);
  return difference === 0;
}

export async function createResearchSession(db: any, email: string) {
  await ensureResearchAccess(db);
  const token = randomHex(32),
    tokenHash = await sha256(token),
    createdAt = new Date(),
    expiresAt = new Date(createdAt.getTime() + SESSION_SECONDS * 1000);
  await db.batch([
    db
      .prepare('DELETE FROM bank_research_sessions WHERE expires_at<=?')
      .bind(createdAt.toISOString()),
    db
      .prepare(
        'INSERT INTO bank_research_sessions(token_hash,email,created_at,expires_at) VALUES(?,?,?,?)',
      )
      .bind(tokenHash, email, createdAt.toISOString(), expiresAt.toISOString()),
  ]);
  return { token, maxAge: SESSION_SECONDS };
}

export function researchSessionCookie(token: string, maxAge: number) {
  return `${SESSION_COOKIE}=${token}; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=${maxAge}`;
}

export async function researchIdentityFromHeaders(
  requestHeaders: Headers,
  db: any,
) {
  const sessionUser = await getUserFromCookieHeader(
    requestHeaders.get('cookie'),
  );
  const headerEmail = String(sessionUser?.email || '')
    .trim()
    .toLowerCase();
  if (OWNER?.includes(headerEmail))
    return { email: OWNER[0].toLowerCase(), name: 'Kav Haribis Administrator', owner: true };
  const token = parseCookie(
    String(requestHeaders.get('cookie') || ''),
    SESSION_COOKIE,
  );
  if (!token) return null;
  await ensureResearchAccess(db);
  const row = (await db
    .prepare(
      'SELECT s.email,r.name FROM bank_research_sessions s JOIN bank_researchers r ON r.email=s.email AND r.active=1 WHERE s.token_hash=? AND s.expires_at>?',
    )
    .bind(await sha256(token), new Date().toISOString())
    .first()) as any;
  return row
    ? {
        email: String(row.email).toLowerCase(),
        name: String(row.name || row.email),
        owner: false,
      }
    : null;
}

export async function researchIdentity(request: Request, db: any) {
  return researchIdentityFromHeaders(request.headers, db);
}

function parseCookie(cookie: string, name: string) {
  for (const part of cookie.split(';')) {
    const [key, ...value] = part.trim().split('=');
    if (key === name) return value.join('=');
  }
  return '';
}

export async function loginAttemptAllowed(db: any, email: string, ip: string) {
  await ensureResearchAccess(db);
  const key = await sha256(`${ip}|${email}`),
    row = (await db
      .prepare(
        'SELECT failures,blocked_until FROM bank_research_login_attempts WHERE attempt_key=?',
      )
      .bind(key)
      .first()) as any;
  return {
    allowed:
      !row?.blocked_until ||
      String(row.blocked_until) <= new Date().toISOString(),
    key,
  };
}

export async function recordLoginFailure(db: any, key: string) {
  const now = new Date(),
    existing = (await db
      .prepare(
        'SELECT failures,updated_at FROM bank_research_login_attempts WHERE attempt_key=?',
      )
      .bind(key)
      .first()) as any;
  const recent =
    existing &&
    Date.now() - new Date(String(existing.updated_at)).getTime() <
      15 * 60 * 1000;
  const failures = recent ? Number(existing.failures || 0) + 1 : 1;
  const blockedUntil =
    failures >= 5 ? new Date(now.getTime() + 15 * 60 * 1000).toISOString() : '';
  await db
    .prepare(
      'INSERT INTO bank_research_login_attempts(attempt_key,failures,blocked_until,updated_at) VALUES(?,?,?,?) ON CONFLICT(attempt_key) DO UPDATE SET failures=excluded.failures,blocked_until=excluded.blocked_until,updated_at=excluded.updated_at',
    )
    .bind(key, failures, blockedUntil, now.toISOString())
    .run();
}

export async function clearLoginFailures(db: any, key: string) {
  await db
    .prepare('DELETE FROM bank_research_login_attempts WHERE attempt_key=?')
    .bind(key)
    .run();
}
