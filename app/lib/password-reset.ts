import { isOwnerEmail, setUserPassword } from './admin-access.ts';

export const MIN_PASSWORD_LENGTH = 10;
export const MAX_PASSWORD_LENGTH = 128;
export const RESET_TOKEN_EXPIRY_MS = 60 * 60 * 1000; // 1 hour

export function validateNewPassword(password: unknown): {
  valid: boolean;
  error?: string;
} {
  if (typeof password !== 'string') {
    return { valid: false, error: 'Password must be a text value.' };
  }

  if (!password.trim()) {
    return {
      valid: false,
      error: 'Password cannot be empty or only whitespace.',
    };
  }

  if (password.length < MIN_PASSWORD_LENGTH) {
    return {
      valid: false,
      error: `Password must be at least ${MIN_PASSWORD_LENGTH} characters long.`,
    };
  }

  if (password.length > MAX_PASSWORD_LENGTH) {
    return {
      valid: false,
      error: `Password must not exceed ${MAX_PASSWORD_LENGTH} characters.`,
    };
  }

  return { valid: true };
}

export function generateSecureToken(): string {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

export async function hashToken(token: string): Promise<string> {
  const encoded = new TextEncoder().encode(token);
  const digest = await crypto.subtle.digest('SHA-256', encoded);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

export async function ensurePasswordResetTokens(db: any): Promise<void> {
  if (!db) return;
  await db
    .prepare(
      `CREATE TABLE IF NOT EXISTS password_reset_tokens (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT NOT NULL,
        token_hash TEXT NOT NULL UNIQUE,
        expires_at TEXT NOT NULL,
        used_at TEXT,
        created_at TEXT NOT NULL
      )`,
    )
    .run();

  try {
    await db
      .prepare(
        'CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_hash ON password_reset_tokens(token_hash)',
      )
      .run();
    await db
      .prepare(
        'CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_email ON password_reset_tokens(email)',
      )
      .run();
  } catch {
    // Indexes may already exist
  }
}

export async function createPasswordResetToken(
  db: any,
  email: string,
): Promise<{ rawToken: string; expiresAt: string }> {
  if (!db || !email) {
    throw new Error('Database and email are required to create a reset token.');
  }
  await ensurePasswordResetTokens(db);

  const cleanEmail = String(email).trim().toLowerCase();
  const rawToken = generateSecureToken();
  const tokenHash = await hashToken(rawToken);
  const now = new Date();
  const expiresAt = new Date(now.getTime() + RESET_TOKEN_EXPIRY_MS).toISOString();
  const createdAt = now.toISOString();

  // Invalidate any previously active unused tokens for this email
  await db
    .prepare(
      'UPDATE password_reset_tokens SET used_at=? WHERE LOWER(email)=? AND used_at IS NULL',
    )
    .bind(createdAt, cleanEmail)
    .run();

  // Store new token with SHA-256 hash only
  await db
    .prepare(
      'INSERT INTO password_reset_tokens (email, token_hash, expires_at, created_at) VALUES (?, ?, ?, ?)',
    )
    .bind(cleanEmail, tokenHash, expiresAt, createdAt)
    .run();

  return { rawToken, expiresAt };
}

export async function validatePasswordResetToken(
  db: any,
  rawToken: string,
): Promise<{ valid: boolean; email?: string; error?: string; tokenId?: number }> {
  if (!db || !rawToken || typeof rawToken !== 'string') {
    return {
      valid: false,
      error: 'Invalid or missing password reset link.',
    };
  }

  await ensurePasswordResetTokens(db);
  const tokenHash = await hashToken(rawToken.trim());

  const row = (await db
    .prepare(
      'SELECT id, email, expires_at, used_at FROM password_reset_tokens WHERE token_hash=?',
    )
    .bind(tokenHash)
    .first()) as
    | { id: number; email: string; expires_at: string; used_at: string | null }
    | null
    | undefined;

  if (!row) {
    return {
      valid: false,
      error: 'This password reset link is invalid or has expired.',
    };
  }

  if (row.used_at) {
    return {
      valid: false,
      error: 'This password reset link has already been used. Please request a new one.',
    };
  }

  const expiryTime = new Date(row.expires_at).getTime();
  if (Number.isNaN(expiryTime) || expiryTime <= Date.now()) {
    return {
      valid: false,
      error: 'This password reset link has expired. Please request a new one.',
    };
  }

  return {
    valid: true,
    email: String(row.email).trim().toLowerCase(),
    tokenId: row.id,
  };
}

export async function consumePasswordResetToken(
  db: any,
  rawToken: string,
  newPassword: string,
): Promise<{ success: boolean; error?: string }> {
  // 1. Validate password policy
  const passwordCheck = validateNewPassword(newPassword);
  if (!passwordCheck.valid) {
    return { success: false, error: passwordCheck.error };
  }

  // 2. Validate token
  const tokenCheck = await validatePasswordResetToken(db, rawToken);
  if (!tokenCheck.valid || !tokenCheck.email || !tokenCheck.tokenId) {
    return { success: false, error: tokenCheck.error || 'Invalid reset token.' };
  }

  const targetEmail = tokenCheck.email;

  // 3. Confirm target account eligibility (Owner or Active Staff)
  const isOwner = isOwnerEmail(targetEmail);
  if (!isOwner) {
    const staffRow = (await db
      .prepare(
        'SELECT active FROM admin_staff_access WHERE LOWER(email)=? AND active=1',
      )
      .bind(targetEmail)
      .first()) as any;

    if (!staffRow) {
      return {
        success: false,
        error: 'This account is no longer authorized for access.',
      };
    }
  }

  // 4. Update password credential (updates admin_profiles for owner, admin_staff_access for staff)
  await setUserPassword(db, targetEmail, newPassword);

  // 5. Invalidate the token (single-use)
  const now = new Date().toISOString();
  await db
    .prepare(
      'UPDATE password_reset_tokens SET used_at=? WHERE id=? AND used_at IS NULL',
    )
    .bind(now, tokenCheck.tokenId)
    .run();

  return { success: true };
}
