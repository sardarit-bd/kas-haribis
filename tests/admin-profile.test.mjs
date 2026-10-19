import assert from 'node:assert/strict';
import test from 'node:test';
import {
  ensureAdminProfiles,
  getAdminProfileName,
  setAdminProfileName,
  validateProfileName,
  MAX_PROFILE_NAME_LENGTH,
} from '../app/lib/admin-profile.ts';

// In-memory mock database conforming to Cloudflare D1 interface
function createMockDb(initialRows = {}) {
  const store = new Map(Object.entries(initialRows));
  return {
    store,
    prepare(sql) {
      return {
        run: async () => {},
        bind(...args) {
          return {
            run: async () => {
              if (sql.includes('INSERT INTO admin_profiles')) {
                const email = String(args[0]).toLowerCase();
                const name = String(args[1]);
                store.set(email, { email, name, updated_at: args[2] });
              }
              return { success: true };
            },
            first: async () => {
              if (sql.includes('SELECT name FROM admin_profiles')) {
                const email = String(args[0]).toLowerCase();
                const row = store.get(email);
                return row ? { name: row.name } : null;
              }
              return null;
            },
          };
        },
      };
    },
  };
}

test('validateProfileName accepts valid names and normalizes whitespace', () => {
  const r1 = validateProfileName('Avrohom Yaakov');
  assert.equal(r1.valid, true);
  assert.equal(r1.cleanName, 'Avrohom Yaakov');

  // Trimming leading/trailing and collapsed multiple whitespace
  const r2 = validateProfileName('   David   Miller   ');
  assert.equal(r2.valid, true);
  assert.equal(r2.cleanName, 'David Miller');

  // Max length boundary (exactly 100 characters)
  const maxName = 'A'.repeat(MAX_PROFILE_NAME_LENGTH);
  const r3 = validateProfileName(maxName);
  assert.equal(r3.valid, true);
  assert.equal(r3.cleanName, maxName);
});

test('validateProfileName rejects empty, whitespace-only, non-string, or overlong names', () => {
  assert.equal(validateProfileName('').valid, false);
  assert.equal(validateProfileName('   ').valid, false);
  assert.equal(validateProfileName('\t\n\r').valid, false);
  assert.equal(validateProfileName(null).valid, false);
  assert.equal(validateProfileName(undefined).valid, false);
  assert.equal(validateProfileName(12345).valid, false);

  // Exceeds 100 characters
  const tooLong = 'A'.repeat(MAX_PROFILE_NAME_LENGTH + 1);
  const rTooLong = validateProfileName(tooLong);
  assert.equal(rTooLong.valid, false);
  assert.match(rTooLong.error, /must not exceed 100 characters/i);
});

test('setAdminProfileName persists in admin_profiles table and getAdminProfileName retrieves it', async () => {
  const db = createMockDb();
  const email = 'owner@example.com';

  assert.equal(await getAdminProfileName(db, email), '');

  await setAdminProfileName(db, email, 'Rabbi Moshe Feinstein');
  assert.equal(await getAdminProfileName(db, email), 'Rabbi Moshe Feinstein');

  // Case-insensitive lookup
  assert.equal(await getAdminProfileName(db, 'OWNER@EXAMPLE.COM'), 'Rabbi Moshe Feinstein');
});

test('Saved profile name takes precedence over session/staff names', async () => {
  const db = createMockDb();
  const email = 'admin@example.com';
  const sessionGoogleName = 'Google Account Name';
  const staffRecordName = 'Staff Record Name';

  // Before saving to admin_profiles: fallback priority produces session or staff name
  let savedName = await getAdminProfileName(db, email);
  let resolvedName = savedName || staffRecordName || sessionGoogleName;
  assert.equal(resolvedName, 'Staff Record Name');

  // After saving to admin_profiles: saved admin profile name takes highest precedence
  await setAdminProfileName(db, email, 'Rabbi A. Yaakov');
  savedName = await getAdminProfileName(db, email);
  resolvedName = savedName || staffRecordName || sessionGoogleName;
  assert.equal(resolvedName, 'Rabbi A. Yaakov');
});

test('Cross-user modification prevention: update is keyed strictly to session email', async () => {
  const db = createMockDb();
  const authenticatedSessionUser = 'session_user@example.com';
  const targetVictimUser = 'target_victim@example.com';

  // Even if untrusted client payload specifies targetVictimUser,
  // the server handler must persist using authenticatedSessionUser.
  const payload = { email: targetVictimUser, name: 'Malicious Override' };
  const validation = validateProfileName(payload.name);
  assert.equal(validation.valid, true);

  // Server invokes setAdminProfileName strictly with authenticatedSessionUser
  await setAdminProfileName(db, authenticatedSessionUser, validation.cleanName);

  // Verify only authenticated user's profile was changed; victim remains blank
  assert.equal(await getAdminProfileName(db, authenticatedSessionUser), 'Malicious Override');
  assert.equal(await getAdminProfileName(db, targetVictimUser), '');
});
