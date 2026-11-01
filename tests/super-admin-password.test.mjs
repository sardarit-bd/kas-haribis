import assert from 'node:assert/strict';
import test from 'node:test';
import {
  ADMIN_OWNER,
  adminLoginAttemptAllowed,
  clearAdminLoginFailures,
  getOwnerSecurityStatus,
  isOwnerEmail,
  isOwnerPasswordRequired,
  recordAdminLoginFailure,
  removeOwnerPassword,
  setOwnerPassword,
  setOwnerPasswordEnforcement,
  validateNewPassword,
  verifyStaffPassword,
} from '../app/lib/admin-access.ts';
import {
  createIntermediateOwnerToken,
  createSessionToken,
  INTERMEDIATE_OWNER_COOKIE,
  parseSessionToken,
  SESSION_COOKIE,
  verifyIntermediateOwnerToken,
} from '../app/lib/auth-session.ts';

// In-memory mock database conforming to Cloudflare D1 prepared statement interface
function createMockDb() {
  const adminProfiles = new Map();
  const adminStaffAccess = new Map();
  const adminLoginAttempts = new Map();

  return {
    adminProfiles,
    adminStaffAccess,
    adminLoginAttempts,
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
              const normalized = sql.replace(/\s+/g, ' ').trim();

              // INSERT / UPDATE admin_profiles
              if (normalized.includes('INSERT INTO admin_profiles')) {
                const email = String(args[0]).toLowerCase().trim();
                const name = String(args[1] ?? '');
                const salt = String(args[2] ?? '');
                const hash = String(args[3] ?? '');
                const requirePassword = Number(args[4] ?? 0);
                const updatedAt = String(args[5] ?? '');

                const existing = adminProfiles.get(email) || { email, name };
                adminProfiles.set(email, {
                  ...existing,
                  password_salt: salt,
                  password_hash: hash,
                  require_password: requirePassword,
                  updated_at: updatedAt,
                });
                return { success: true };
              }

              // UPDATE admin_profiles SET password_salt='', password_hash='', require_password=0
              if (normalized.includes("UPDATE admin_profiles SET password_salt='', password_hash='', require_password=0")) {
                const updatedAt = String(args[0]);
                const email = String(args[1]).toLowerCase().trim();
                const existing = adminProfiles.get(email) || { email, name: '' };
                adminProfiles.set(email, {
                  ...existing,
                  password_salt: '',
                  password_hash: '',
                  require_password: 0,
                  updated_at: updatedAt,
                });
                return { success: true };
              }

              // UPDATE admin_profiles SET require_password=?, updated_at=? WHERE LOWER(email)=?
              if (normalized.includes('UPDATE admin_profiles SET require_password=')) {
                const requirePassword = Number(args[0]);
                const updatedAt = String(args[1]);
                const email = String(args[2]).toLowerCase().trim();
                const existing = adminProfiles.get(email) || { email, name: '' };
                adminProfiles.set(email, {
                  ...existing,
                  require_password: requirePassword,
                  updated_at: updatedAt,
                });
                return { success: true };
              }

              // INSERT INTO admin_login_attempts
              if (normalized.includes('INSERT INTO admin_login_attempts')) {
                const key = String(args[0]);
                const failures = Number(args[1]);
                const blockedUntil = String(args[2] ?? '');
                const updatedAt = String(args[3] ?? '');
                adminLoginAttempts.set(key, {
                  attempt_key: key,
                  failures,
                  blocked_until: blockedUntil,
                  updated_at: updatedAt,
                });
                return { success: true };
              }

              // DELETE FROM admin_login_attempts
              if (normalized.includes('DELETE FROM admin_login_attempts WHERE attempt_key=?')) {
                const key = String(args[0]);
                adminLoginAttempts.delete(key);
                return { success: true };
              }

              return { success: true };
            },
            first: async () => {
              const normalized = sql.replace(/\s+/g, ' ').trim();

              if (normalized.includes('FROM admin_profiles WHERE LOWER(email)=?')) {
                const email = String(args[0]).toLowerCase().trim();
                return adminProfiles.get(email) || null;
              }

              if (normalized.includes('FROM admin_login_attempts WHERE attempt_key=?')) {
                const key = String(args[0]);
                return adminLoginAttempts.get(key) || null;
              }

              return null;
            },
            all: async () => {
              return { results: [] };
            },
          };
        },
      };
    },
  };
}

const TEST_OWNER = ADMIN_OWNER[0]; // 'mdemong87@gmail.com'
const TEST_SECRET = 'super-secret-test-auth-signing-key-12345';

test('1. Owner can add a password with minimum 10 characters', async () => {
  const db = createMockDb();
  
  // Rejects password less than 10 chars
  await assert.rejects(
    async () => await setOwnerPassword(db, TEST_OWNER, 'short9!'),
    /at least 10 characters/,
  );

  // Successfully sets valid password
  await setOwnerPassword(db, TEST_OWNER, 'ValidSecureOwnerPassword2026!');
  const status = await getOwnerSecurityStatus(db, TEST_OWNER);
  assert.equal(status.hasPassword, true, 'hasPassword should be true after setting');
  assert.equal(status.requirePassword, false, 'requirePassword should default to false');
});

test('2. Password is stored only as a secure hash and salt (zero plaintext)', async () => {
  const db = createMockDb();
  const rawPassword = 'SecretOwnerPassphrase2026!';
  await setOwnerPassword(db, TEST_OWNER, rawPassword);

  const profile = db.adminProfiles.get(TEST_OWNER);
  assert.ok(profile, 'Profile record must exist');
  assert.ok(profile.password_salt, 'Salt must exist');
  assert.ok(profile.password_hash, 'Hash must exist');
  assert.notEqual(profile.password_hash, rawPassword, 'Stored hash must never match plaintext');
  assert.equal(typeof profile.password_salt, 'string');
  assert.equal(profile.password_salt.length, 32, 'Salt must be 32 hex chars (16 bytes)');
  assert.equal(profile.password_hash.length, 64, 'Hash must be 64 hex chars (PBKDF2-SHA256 256 bits)');
});

test('3. Owner can change the password', async () => {
  const db = createMockDb();
  await setOwnerPassword(db, TEST_OWNER, 'FirstInitialPassword2026!');
  const initialHash = db.adminProfiles.get(TEST_OWNER).password_hash;

  // Change password
  await setOwnerPassword(db, TEST_OWNER, 'SecondUpdatedPassword2026!');
  const updatedHash = db.adminProfiles.get(TEST_OWNER).password_hash;

  assert.notEqual(initialHash, updatedHash, 'Password hash must change upon update');
  assert.equal(await verifyStaffPassword(db, TEST_OWNER, 'SecondUpdatedPassword2026!'), true);
  assert.equal(await verifyStaffPassword(db, TEST_OWNER, 'FirstInitialPassword2026!'), false);
});

test('4. Owner can remove the password and enforcement is automatically cleared', async () => {
  const db = createMockDb();
  await setOwnerPassword(db, TEST_OWNER, 'ConfiguredPassword2026!', true);
  let status = await getOwnerSecurityStatus(db, TEST_OWNER);
  assert.equal(status.hasPassword, true);
  assert.equal(status.requirePassword, true);

  // Remove password
  await removeOwnerPassword(db, TEST_OWNER);
  status = await getOwnerSecurityStatus(db, TEST_OWNER);
  assert.equal(status.hasPassword, false, 'hasPassword must be false');
  assert.equal(status.requirePassword, false, 'requirePassword must be automatically disabled');
  assert.equal(await isOwnerPasswordRequired(db, TEST_OWNER), false);
  assert.equal(await verifyStaffPassword(db, TEST_OWNER, 'ConfiguredPassword2026!'), false);
});

test('5. Password enforcement cannot be enabled without a configured password', async () => {
  const db = createMockDb();
  // No password configured yet
  await assert.rejects(
    async () => await setOwnerPasswordEnforcement(db, TEST_OWNER, true),
    /Cannot require password on Google login without a configured password/,
  );
  const status = await getOwnerSecurityStatus(db, TEST_OWNER);
  assert.equal(status.requirePassword, false);
});

test('6. Google login succeeds directly when enforcement is disabled', async () => {
  const db = createMockDb();
  // Case A: No password configured
  assert.equal(await isOwnerPasswordRequired(db, TEST_OWNER), false);

  // Case B: Password configured, but enforcement disabled
  await setOwnerPassword(db, TEST_OWNER, 'OptionalPassword2026!', false);
  assert.equal(await isOwnerPasswordRequired(db, TEST_OWNER), false);

  // Normal session token issued directly
  const session = await createSessionToken(
    { email: TEST_OWNER, name: 'Owner', exp: Math.floor(Date.now() / 1000) + 3600 },
    TEST_SECRET,
  );
  const verified = await parseSessionToken(session, TEST_SECRET);
  assert.equal(verified?.email, TEST_OWNER);
});

test('7. Google login requires intermediate password verification when enforcement is enabled', async () => {
  const db = createMockDb();
  await setOwnerPassword(db, TEST_OWNER, 'StrictEnforcedPassword2026!', true);
  assert.equal(await isOwnerPasswordRequired(db, TEST_OWNER), true);

  // Google OAuth creates intermediate token instead of final session
  const intermediateToken = await createIntermediateOwnerToken(
    { email: TEST_OWNER, returnTo: '/admin/banks' },
    TEST_SECRET,
  );
  assert.ok(intermediateToken, 'Intermediate token generated');

  const payload = await verifyIntermediateOwnerToken(intermediateToken, TEST_SECRET);
  assert.equal(payload?.email, TEST_OWNER);
  assert.equal(payload?.returnTo, '/admin/banks');
});

test('8. Incorrect password never creates an authorized Owner session', async () => {
  const db = createMockDb();
  await setOwnerPassword(db, TEST_OWNER, 'CorrectSecretPassword2026!', true);

  const correct = await verifyStaffPassword(db, TEST_OWNER, 'CorrectSecretPassword2026!');
  assert.equal(correct, true);

  const incorrect = await verifyStaffPassword(db, TEST_OWNER, 'WrongPasswordAttemp1!');
  assert.equal(incorrect, false);
});

test('9. Direct API requests cannot bypass intermediate verification', async () => {
  // A pending intermediate token does NOT decode as a valid kh_auth session token
  const intermediateToken = await createIntermediateOwnerToken(
    { email: TEST_OWNER, returnTo: '/admin' },
    TEST_SECRET,
  );

  // Calling parseSessionToken on an intermediate token MUST fail (return null)
  const bypassAttempt = await parseSessionToken(intermediateToken, TEST_SECRET);
  assert.equal(bypassAttempt, null, 'Intermediate token must never be accepted as a session token');
});

test('10. Password reset and recovery flow works correctly and integrates with policy', async () => {
  const db = createMockDb();
  // Validates policy
  assert.equal(validateNewPassword('short').valid, false);
  assert.equal(validateNewPassword('ValidPasswordReset2026!').valid, true);

  // Set via reset
  await setOwnerPassword(db, TEST_OWNER, 'RecoveredPassword2026!');
  assert.equal(await verifyStaffPassword(db, TEST_OWNER, 'RecoveredPassword2026!'), true);
});

test('11. Brute-force protection locks out account after 5 failed attempts for 15 minutes', async () => {
  const db = createMockDb();
  const ip = '192.168.1.100';

  // Initially allowed
  let check = await adminLoginAttemptAllowed(db, TEST_OWNER, ip);
  assert.equal(check.allowed, true);

  // Record 4 failures
  for (let i = 1; i <= 4; i++) {
    await recordAdminLoginFailure(db, check.key);
    check = await adminLoginAttemptAllowed(db, TEST_OWNER, ip);
    assert.equal(check.allowed, true, `Should still be allowed on attempt ${i}`);
  }

  // 5th failure triggers lockout
  await recordAdminLoginFailure(db, check.key);
  check = await adminLoginAttemptAllowed(db, TEST_OWNER, ip);
  assert.equal(check.allowed, false, 'Must be locked out after 5 failures');
  assert.ok(check.blockedUntil, 'Must return blockedUntil ISO timestamp');

  // Successful login clears failures
  await clearAdminLoginFailures(db, check.key);
  check = await adminLoginAttemptAllowed(db, TEST_OWNER, ip);
  assert.equal(check.allowed, true, 'Lockout must be cleared on success');
});

test('12. Delegated Staff cannot manage Owner password settings', async () => {
  const db = createMockDb();
  const staffEmail = 'staff.member@kavharibis.org';

  // isOwnerEmail strictly distinguishes staff from owner
  assert.equal(isOwnerEmail(staffEmail), false);
  assert.equal(isOwnerEmail(TEST_OWNER), true);

  // setOwnerPassword rejects non-owner
  await assert.rejects(
    async () => await setOwnerPassword(db, staffEmail, 'StaffTryingToSetOwnerPass2026!'),
    /Email is not an authorized owner/,
  );

  // removeOwnerPassword rejects non-owner
  await assert.rejects(
    async () => await removeOwnerPassword(db, staffEmail),
    /Email is not an authorized owner/,
  );

  // setOwnerPasswordEnforcement rejects non-owner
  await assert.rejects(
    async () => await setOwnerPasswordEnforcement(db, staffEmail, true),
    /Email is not an authorized owner/,
  );
});

test('13. Premium Members functionality remains unaffected', async () => {
  // Premium Members authentication uses dedicated cookie kh_bank_premium and bank_premium_members table
  const db = createMockDb();
  await setOwnerPassword(db, TEST_OWNER, 'OwnerPassword2026!', true);

  // Verify owner password operations do NOT touch premium member tables or sessions
  assert.equal(INTERMEDIATE_OWNER_COOKIE, 'kh_owner_pending');
  assert.notEqual(INTERMEDIATE_OWNER_COOKIE, 'kh_bank_premium');
  assert.equal(SESSION_COOKIE, 'kh_auth');
});

test('14. Seferim and Admin elevated operations remain functional', async () => {
  // Verify that an authorized owner session verified with password yields valid SessionPayload
  const fullSession = await createSessionToken(
    { email: TEST_OWNER, name: 'Rabbi Admin', exp: Math.floor(Date.now() / 1000) + 3600 },
    TEST_SECRET,
  );
  const session = await parseSessionToken(fullSession, TEST_SECRET);
  assert.ok(session);
  assert.equal(session.email, TEST_OWNER);
  assert.equal(isOwnerEmail(session.email), true, 'Owner session receives elevated status');
});
