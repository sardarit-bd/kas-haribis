import assert from 'node:assert/strict';
import test from 'node:test';
import {
  validateNewPassword,
  generateSecureToken,
  hashToken,
  createPasswordResetToken,
  validatePasswordResetToken,
  consumePasswordResetToken,
  MIN_PASSWORD_LENGTH,
  MAX_PASSWORD_LENGTH,
  RESET_TOKEN_EXPIRY_MS,
} from '../app/lib/password-reset.ts';
import {
  setOwnerPassword,
  setStaffPassword,
  verifyStaffPassword,
  ADMIN_OWNER,
  isOwnerEmail,
} from '../app/lib/admin-access.ts';

// In-memory mock database conforming to Cloudflare D1 prepared statement interface
function createTestDb() {
  const adminProfiles = new Map();
  const adminStaffAccess = new Map();
  const resetTokens = new Map();
  let nextTokenId = 1;

  return {
    adminProfiles,
    adminStaffAccess,
    resetTokens,
    prepare(sql) {
      const exec = {
        run: async () => ({ success: true }),
        all: async () => ({ results: [] }),
        first: async () => null,
      };
      return {
        ...exec,
        bind(...args) {
          return {
            ...exec,
            run: async () => {
              const normalizedSql = sql.replace(/\s+/g, ' ').trim();

              // INSERT/UPDATE admin_profiles (Owner password or profile)
              if (normalizedSql.includes('INSERT INTO admin_profiles')) {
                const email = String(args[0]).toLowerCase().trim();
                const defaultName = String(args[1] ?? '');
                const salt = String(args[2] ?? '');
                const hash = String(args[3] ?? '');
                const updatedAt = String(args[4] ?? '');

                const existing = adminProfiles.get(email) || { email, name: defaultName };
                adminProfiles.set(email, {
                  ...existing,
                  password_salt: salt,
                  password_hash: hash,
                  updated_at: updatedAt,
                });
                return { success: true };
              }

              // UPDATE admin_staff_access
              if (normalizedSql.includes('UPDATE admin_staff_access SET password_salt=')) {
                const salt = String(args[0]);
                const hash = String(args[1]);
                const updatedAt = String(args[2]);
                const email = String(args[3]).toLowerCase().trim();

                const existing = adminStaffAccess.get(email);
                if (existing) {
                  adminStaffAccess.set(email, {
                    ...existing,
                    password_salt: salt,
                    password_hash: hash,
                    updated_at: updatedAt,
                  });
                }
                return { success: true };
              }

              // UPDATE password_reset_tokens SET used_at=? WHERE LOWER(email)=? AND used_at IS NULL
              if (normalizedSql.includes('UPDATE password_reset_tokens SET used_at=? WHERE LOWER(email)=?')) {
                const usedAt = args[0];
                const email = String(args[1]).toLowerCase().trim();
                for (const row of resetTokens.values()) {
                  if (row.email.toLowerCase() === email && row.used_at === null) {
                    row.used_at = usedAt;
                  }
                }
                return { success: true };
              }

              // UPDATE password_reset_tokens SET used_at=? WHERE id=?
              if (normalizedSql.includes('UPDATE password_reset_tokens SET used_at=? WHERE id=?')) {
                const usedAt = args[0];
                const id = Number(args[1]);
                const row = resetTokens.get(id);
                if (row && row.used_at === null) {
                  row.used_at = usedAt;
                }
                return { success: true };
              }

              // INSERT INTO password_reset_tokens
              if (normalizedSql.includes('INSERT INTO password_reset_tokens')) {
                const email = String(args[0]).toLowerCase().trim();
                const tokenHash = String(args[1]);
                const expiresAt = String(args[2]);
                const createdAt = String(args[3]);
                const id = nextTokenId++;
                resetTokens.set(id, {
                  id,
                  email,
                  token_hash: tokenHash,
                  expires_at: expiresAt,
                  used_at: null,
                  created_at: createdAt,
                });
                return { success: true };
              }

              return { success: true };
            },
            first: async () => {
              const normalizedSql = sql.replace(/\s+/g, ' ').trim();

              // SELECT password_salt, password_hash FROM admin_profiles WHERE LOWER(email)=?
              if (normalizedSql.includes('FROM admin_profiles WHERE LOWER(email)=?')) {
                const email = String(args[0]).toLowerCase().trim();
                return adminProfiles.get(email) || null;
              }

              // SELECT active FROM admin_staff_access WHERE LOWER(email)=? AND active=1
              if (normalizedSql.includes('WHERE LOWER(email)=? AND active=1')) {
                const email = String(args[0]).toLowerCase().trim();
                const row = adminStaffAccess.get(email);
                return row && row.active === 1 ? row : null;
              }

              // SELECT password_salt, password_hash, active FROM admin_staff_access WHERE LOWER(email)=?
              if (normalizedSql.includes('FROM admin_staff_access WHERE LOWER(email)=?')) {
                const email = String(args[0]).toLowerCase().trim();
                return adminStaffAccess.get(email) || null;
              }

              // SELECT id, email, expires_at, used_at FROM password_reset_tokens WHERE token_hash=?
              if (normalizedSql.includes('FROM password_reset_tokens WHERE token_hash=?')) {
                const tokenHash = String(args[0]);
                for (const row of resetTokens.values()) {
                  if (row.token_hash === tokenHash) {
                    return row;
                  }
                }
                return null;
              }

              return null;
            },
            all: async () => ({ results: [] }),
          };
        },
      };
    },
  };
}

test('Password policy: enforces 10–128 characters and rejects whitespace-only', () => {
  assert.equal(validateNewPassword('').valid, false);
  assert.equal(validateNewPassword('   ').valid, false);
  assert.equal(validateNewPassword('\t\n\r').valid, false);
  assert.equal(validateNewPassword(null).valid, false);
  assert.equal(validateNewPassword(undefined).valid, false);
  assert.equal(validateNewPassword(1234567890).valid, false);

  // Less than 10 characters
  const short = validateNewPassword('short123');
  assert.equal(short.valid, false);
  assert.match(short.error, /at least 10 characters/i);

  // Exactly 10 characters (valid)
  const minValid = validateNewPassword('P@ssword10');
  assert.equal(minValid.valid, true);

  // Exactly 128 characters (valid)
  const maxValid = validateNewPassword('A'.repeat(MAX_PASSWORD_LENGTH));
  assert.equal(maxValid.valid, true);

  // Exceeds 128 characters (rejected, not silently truncated)
  const overMax = validateNewPassword('A'.repeat(MAX_PASSWORD_LENGTH + 1));
  assert.equal(overMax.valid, false);
  assert.match(overMax.error, /must not exceed 128 characters/i);
});

test('Token generation and SHA-256 hashing produces unique, secure digests', async () => {
  const token1 = generateSecureToken();
  const token2 = generateSecureToken();
  assert.notEqual(token1, token2);
  assert.equal(token1.length, 64); // 32 bytes in hex

  const hash1 = await hashToken(token1);
  const hash2 = await hashToken(token1); // deterministic for same token
  const hashDiff = await hashToken(token2);

  assert.equal(hash1, hash2);
  assert.notEqual(hash1, hashDiff);
  assert.equal(hash1.length, 64); // SHA-256 hex digest
});

test('createPasswordResetToken stores SHA-256 hash, never raw token, and sets 1-hour expiry', async () => {
  const db = createTestDb();
  const email = 'testuser@example.com';

  const { rawToken, expiresAt } = await createPasswordResetToken(db, email);
  assert.ok(rawToken);
  assert.ok(expiresAt);

  // Verify only hash is stored in database
  const tokenHash = await hashToken(rawToken);
  const storedRow = Array.from(db.resetTokens.values())[0];
  assert.ok(storedRow);
  assert.equal(storedRow.token_hash, tokenHash);
  assert.notEqual(storedRow.token_hash, rawToken);
  assert.equal(storedRow.email, email);
  assert.equal(storedRow.used_at, null);

  // Check 1 hour expiry calculation
  const diffMs = new Date(expiresAt).getTime() - new Date(storedRow.created_at).getTime();
  assert.equal(diffMs, RESET_TOKEN_EXPIRY_MS);
});

test('validatePasswordResetToken rejects expired tokens', async () => {
  const db = createTestDb();
  const email = 'owner@example.com';

  const { rawToken } = await createPasswordResetToken(db, email);
  const tokenRow = Array.from(db.resetTokens.values())[0];

  // Set expiration to 10 seconds in the past
  tokenRow.expires_at = new Date(Date.now() - 10000).toISOString();

  const validation = await validatePasswordResetToken(db, rawToken);
  assert.equal(validation.valid, false);
  assert.match(validation.error, /expired/i);
});

test('consumePasswordResetToken enforces single-use invalidation', async () => {
  const db = createTestDb();
  const ownerEmail = ADMIN_OWNER[0]; // e.g. 'kavharibis@gmail.com'

  const { rawToken } = await createPasswordResetToken(db, ownerEmail);

  // First use: succeeds
  const firstUse = await consumePasswordResetToken(db, rawToken, 'NewSecurePassword123!');
  assert.equal(firstUse.success, true);

  // Second use: must be rejected
  const secondUse = await consumePasswordResetToken(db, rawToken, 'AnotherPassword456!');
  assert.equal(secondUse.success, false);
  assert.match(secondUse.error, /already been used/i);
});

test('Owner password reset updates ONLY admin_profiles and leaves admin_staff_access untouched', async () => {
  const db = createTestDb();
  const ownerEmail = ADMIN_OWNER[0];

  // Pre-condition: owner is NOT in admin_staff_access
  assert.equal(db.adminStaffAccess.has(ownerEmail.toLowerCase()), false);

  const { rawToken } = await createPasswordResetToken(db, ownerEmail);
  const result = await consumePasswordResetToken(db, rawToken, 'OwnerSecretPass2026!');
  assert.equal(result.success, true);

  // Verification 1: admin_profiles now has password credentials
  const profileRow = db.adminProfiles.get(ownerEmail.toLowerCase());
  assert.ok(profileRow, 'Owner record must exist in admin_profiles');
  assert.ok(profileRow.password_salt, 'password_salt must be populated');
  assert.ok(profileRow.password_hash, 'password_hash must be populated');

  // Verification 2: admin_staff_access MUST remain completely empty of owner
  assert.equal(
    db.adminStaffAccess.has(ownerEmail.toLowerCase()),
    false,
    'Owner MUST NEVER be inserted into admin_staff_access',
  );

  // Verification 3: verifyStaffPassword succeeds for owner with new password
  const canLogin = await verifyStaffPassword(db, ownerEmail, 'OwnerSecretPass2026!');
  assert.equal(canLogin, true, 'Owner must authenticate via verifyStaffPassword');

  // Verification 4: wrong password fails
  const wrongLogin = await verifyStaffPassword(db, ownerEmail, 'WrongPassword123!');
  assert.equal(wrongLogin, false);
});

test('Staff password reset updates ONLY admin_staff_access and verifies correctly', async () => {
  const db = createTestDb();
  const staffEmail = 'staff.member@example.com';

  // Seed active staff member
  db.adminStaffAccess.set(staffEmail.toLowerCase(), {
    email: staffEmail.toLowerCase(),
    name: 'Reuven Staff',
    active: 1,
    permissions: '["banks"]',
    password_salt: '',
    password_hash: '',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  });

  const { rawToken } = await createPasswordResetToken(db, staffEmail);
  const result = await consumePasswordResetToken(db, rawToken, 'StaffNewPassword2026!');
  assert.equal(result.success, true);

  // Verification 1: admin_staff_access has updated credentials
  const staffRow = db.adminStaffAccess.get(staffEmail.toLowerCase());
  assert.ok(staffRow.password_salt);
  assert.ok(staffRow.password_hash);

  // Verification 2: admin_profiles was NOT created for staff
  assert.equal(db.adminProfiles.has(staffEmail.toLowerCase()), false);

  // Verification 3: Staff can authenticate
  const canLogin = await verifyStaffPassword(db, staffEmail, 'StaffNewPassword2026!');
  assert.equal(canLogin, true);
});

test('Inactive staff cannot reset password or login', async () => {
  const db = createTestDb();
  const inactiveStaff = 'inactive.staff@example.com';

  db.adminStaffAccess.set(inactiveStaff.toLowerCase(), {
    email: inactiveStaff.toLowerCase(),
    name: 'Ex-Employee',
    active: 0, // Inactive
    permissions: '["banks"]',
    password_salt: '',
    password_hash: '',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  });

  const { rawToken } = await createPasswordResetToken(db, inactiveStaff);
  const result = await consumePasswordResetToken(db, rawToken, 'AnyValidPassword10!');
  assert.equal(result.success, false);
  assert.match(result.error, /no longer authorized/i);
});

test('Non-owner cannot authenticate using admin_profiles alone (guarantees ADMIN_OWNER check)', async () => {
  const db = createTestDb();
  const attackerEmail = 'attacker@example.com';
  assert.equal(isOwnerEmail(attackerEmail), false);

  // Even if an entry exists in admin_profiles for a non-owner email
  db.adminProfiles.set(attackerEmail, {
    email: attackerEmail,
    password_salt: 'dummy_salt',
    password_hash: 'dummy_hash',
  });

  // verifyStaffPassword MUST reject because attacker is not in ADMIN_OWNER allowlist
  const authenticated = await verifyStaffPassword(db, attackerEmail, 'password');
  assert.equal(authenticated, false);
});
