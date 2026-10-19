export const MAX_PROFILE_NAME_LENGTH = 100;

export function validateProfileName(name: unknown): {
  valid: boolean;
  error?: string;
  cleanName?: string;
} {
  if (typeof name !== 'string') {
    return { valid: false, error: 'Display name must be a text value.' };
  }

  // Normalize spaces and remove control characters
  const cleanName = name
    .replace(/[\r\n\t]/g, ' ')
    .trim()
    .replace(/\s+/g, ' ');

  if (!cleanName) {
    return { valid: false, error: 'Display name cannot be empty.' };
  }

  if (cleanName.length > MAX_PROFILE_NAME_LENGTH) {
    return {
      valid: false,
      error: `Display name must not exceed ${MAX_PROFILE_NAME_LENGTH} characters.`,
    };
  }

  return { valid: true, cleanName };
}

export async function ensureAdminProfiles(db: any): Promise<void> {
  if (!db) return;
  await db
    .prepare(
      "CREATE TABLE IF NOT EXISTS admin_profiles (email TEXT PRIMARY KEY, name TEXT NOT NULL DEFAULT '', password_salt TEXT NOT NULL DEFAULT '', password_hash TEXT NOT NULL DEFAULT '', updated_at TEXT NOT NULL)",
    )
    .run();

  try {
    const prep = db.prepare("PRAGMA table_info('admin_profiles')");
    if (typeof prep?.all === 'function') {
      const tableInfo = await prep.all();
      const cols = new Set((tableInfo?.results || []).map((c: any) => String(c.name).toLowerCase()));
      if (!cols.has('password_salt')) {
        await db.prepare("ALTER TABLE admin_profiles ADD COLUMN password_salt TEXT NOT NULL DEFAULT ''").run();
      }
      if (!cols.has('password_hash')) {
        await db.prepare("ALTER TABLE admin_profiles ADD COLUMN password_hash TEXT NOT NULL DEFAULT ''").run();
      }
    }
  } catch (error) {
    const msg = String(error).toLowerCase();
    if (!msg.includes('duplicate column')) throw error;
  }
}

export async function getAdminProfileName(
  db: any,
  email: string | null | undefined,
): Promise<string> {
  if (!db || !email) return '';
  const cleanEmail = String(email).trim().toLowerCase();
  try {
    const row = (await db
      .prepare('SELECT name FROM admin_profiles WHERE LOWER(email)=?')
      .bind(cleanEmail)
      .first()) as { name?: string } | null;
    return String(row?.name || '').trim();
  } catch (err: any) {
    const msg = String(err?.message || err).toLowerCase();
    if (msg.includes('no such table')) {
      await ensureAdminProfiles(db);
      return '';
    }
    return '';
  }
}

export async function setAdminProfileName(
  db: any,
  email: string,
  name: string,
): Promise<string> {
  if (!db || !email) return '';
  await ensureAdminProfiles(db);
  const cleanEmail = String(email).trim().toLowerCase();
  const cleanName = String(name).trim();
  const now = new Date().toISOString();

  await db
    .prepare(
      'INSERT INTO admin_profiles (email, name, updated_at) VALUES (?, ?, ?) ON CONFLICT(email) DO UPDATE SET name=excluded.name, updated_at=excluded.updated_at',
    )
    .bind(cleanEmail, cleanName, now)
    .run();

  return cleanName;
}
