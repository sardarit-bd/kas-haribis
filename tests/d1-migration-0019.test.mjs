import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { DatabaseSync } from 'node:sqlite';
import { ensureAdminProfiles } from '../app/lib/admin-profile.ts';

const MIGRATION_PATH = path.resolve(
  process.cwd(),
  'drizzle/0019_super_admin_password_protection.sql',
);

function readMigrationStatements() {
  const content = fs.readFileSync(MIGRATION_PATH, 'utf8');
  // Drizzle uses '--> statement-breakpoint' to separate statements
  return content
    .split('--> statement-breakpoint')
    .map((s) => s.trim())
    .filter((s) => s.length > 0);
}

function applyMigrationSql(db) {
  const statements = readMigrationStatements();
  for (const stmt of statements) {
    db.exec(stmt);
  }
}

function getTableColumns(db, tableName) {
  try {
    const rows = db.prepare(`PRAGMA table_info('${tableName}')`).all();
    return new Set(rows.map((r) => String(r.name).toLowerCase()));
  } catch {
    return new Set();
  }
}

test('Migration 0019 - Scenario A: Database where require_password already exists (Production state)', () => {
  const db = new DatabaseSync(':memory:');

  // Set up existing production state: admin_profiles already has require_password
  db.exec(`
    CREATE TABLE admin_profiles (
      email TEXT PRIMARY KEY,
      name TEXT NOT NULL DEFAULT '',
      password_salt TEXT NOT NULL DEFAULT '',
      password_hash TEXT NOT NULL DEFAULT '',
      require_password INTEGER NOT NULL DEFAULT 0,
      updated_at TEXT NOT NULL
    );
  `);

  // Insert existing Owner data with active password protection
  const ownerEmail = 'rabbi@kavharibis.com';
  const ownerSalt = 'prod-salt-12345';
  const ownerHash = 'prod-hash-67890';
  db.exec(`
    INSERT INTO admin_profiles (email, name, password_salt, password_hash, require_password, updated_at)
    VALUES ('${ownerEmail}', 'Rabbi Jacob', '${ownerSalt}', '${ownerHash}', 1, '2026-11-01T10:00:00.000Z');
  `);

  // Applying migration 0019 MUST NOT throw "duplicate column name: require_password"
  assert.doesNotThrow(() => {
    applyMigrationSql(db);
  }, 'Migration 0019 must not fail when require_password already exists');

  // Verify existing Owner data and require_password setting are completely preserved
  const owner = db
    .prepare('SELECT * FROM admin_profiles WHERE email = ?')
    .get(ownerEmail);
  assert.ok(owner, 'Owner record must still exist');
  assert.equal(owner.email, ownerEmail);
  assert.equal(owner.password_salt, ownerSalt, 'Password salt must not change');
  assert.equal(owner.password_hash, ownerHash, 'Password hash must not change');
  assert.equal(
    owner.require_password,
    1,
    'Existing require_password=1 setting must be preserved',
  );

  // Verify admin_login_attempts table is created
  const loginAttemptCols = getTableColumns(db, 'admin_login_attempts');
  assert.ok(
    loginAttemptCols.has('attempt_key'),
    'admin_login_attempts.attempt_key must exist',
  );
  assert.ok(
    loginAttemptCols.has('failures'),
    'admin_login_attempts.failures must exist',
  );
  assert.ok(
    loginAttemptCols.has('blocked_until'),
    'admin_login_attempts.blocked_until must exist',
  );
});

test('Migration 0019 - Scenario B: Database where admin_profiles exists WITHOUT require_password (Legacy DB)', () => {
  const db = new DatabaseSync(':memory:');

  // Set up legacy state: admin_profiles has no require_password
  db.exec(`
    CREATE TABLE admin_profiles (
      email TEXT PRIMARY KEY,
      name TEXT NOT NULL DEFAULT '',
      password_salt TEXT NOT NULL DEFAULT '',
      password_hash TEXT NOT NULL DEFAULT '',
      updated_at TEXT NOT NULL
    );
  `);

  const ownerEmail = 'legacy@kavharibis.com';
  db.exec(`
    INSERT INTO admin_profiles (email, name, password_salt, password_hash, updated_at)
    VALUES ('${ownerEmail}', 'Legacy Admin', 'salt-abc', 'hash-xyz', '2026-10-15T12:00:00.000Z');
  `);

  // Verify require_password is not yet present
  let cols = getTableColumns(db, 'admin_profiles');
  assert.equal(
    cols.has('require_password'),
    false,
    'require_password initially absent',
  );

  // Simulate idempotent pre-migration column addition (as performed by d1-migrate.mjs)
  if (!cols.has('require_password')) {
    db.exec(
      'ALTER TABLE admin_profiles ADD COLUMN require_password INTEGER NOT NULL DEFAULT 0;',
    );
  }

  // Now apply migration 0019 SQL
  assert.doesNotThrow(() => {
    applyMigrationSql(db);
  }, 'Migration 0019 applies cleanly');

  // Verify require_password now exists and defaulted to 0
  cols = getTableColumns(db, 'admin_profiles');
  assert.equal(
    cols.has('require_password'),
    true,
    'require_password present after migration',
  );

  const row = db
    .prepare('SELECT require_password, password_salt FROM admin_profiles WHERE email = ?')
    .get(ownerEmail);
  assert.equal(row.require_password, 0, 'Defaulted to 0 for legacy record');
  assert.equal(row.password_salt, 'salt-abc', 'Existing salt preserved');

  // Verify admin_login_attempts table was created
  const loginAttemptCols = getTableColumns(db, 'admin_login_attempts');
  assert.ok(loginAttemptCols.has('attempt_key'));
});

test('Migration 0019 - Scenario C: Completely fresh database where admin_profiles does not exist yet', () => {
  const db = new DatabaseSync(':memory:');

  // No tables exist initially
  assert.equal(getTableColumns(db, 'admin_profiles').size, 0);
  assert.equal(getTableColumns(db, 'admin_login_attempts').size, 0);

  // Apply migration 0019
  assert.doesNotThrow(() => {
    applyMigrationSql(db);
  }, 'Migration 0019 creates tables on fresh database');

  // Verify admin_profiles schema
  const profileCols = getTableColumns(db, 'admin_profiles');
  assert.ok(profileCols.has('email'), 'email column exists');
  assert.ok(profileCols.has('name'), 'name column exists');
  assert.ok(profileCols.has('password_salt'), 'password_salt column exists');
  assert.ok(profileCols.has('password_hash'), 'password_hash column exists');
  assert.ok(
    profileCols.has('require_password'),
    'require_password column exists',
  );
  assert.ok(profileCols.has('updated_at'), 'updated_at column exists');

  // Verify admin_login_attempts schema
  const attemptCols = getTableColumns(db, 'admin_login_attempts');
  assert.ok(attemptCols.has('attempt_key'), 'attempt_key exists');
  assert.ok(attemptCols.has('failures'), 'failures exists');
  assert.ok(attemptCols.has('blocked_until'), 'blocked_until exists');
  assert.ok(attemptCols.has('updated_at'), 'updated_at exists');
});

test('Migration 0019 - Idempotency: Re-applying migration 0019 multiple times causes no errors', () => {
  const db = new DatabaseSync(':memory:');

  // Apply first time
  applyMigrationSql(db);

  // Apply second time
  assert.doesNotThrow(() => {
    applyMigrationSql(db);
  }, 'Second run must succeed idempotently');

  // Apply third time
  assert.doesNotThrow(() => {
    applyMigrationSql(db);
  }, 'Third run must succeed idempotently');
});

test('ensureAdminProfiles() and migration 0019 interact without conflict', async () => {
  const db = new DatabaseSync(':memory:');

  // 1. Run migration 0019 first
  applyMigrationSql(db);

  // 2. Wrap db for ensureAdminProfiles adapter
  const adapter = {
    prepare(sql) {
      const stmt = db.prepare(sql);
      return {
        run() {
          stmt.run();
        },
        async all() {
          const res = stmt.all();
          return { results: res };
        },
        bind(...args) {
          return {
            async first() {
              return stmt.get(...args);
            },
            run() {
              stmt.run(...args);
            },
          };
        },
      };
    },
  };

  // 3. ensureAdminProfiles must run without error
  await assert.doesNotReject(async () => {
    await ensureAdminProfiles(adapter);
  }, 'ensureAdminProfiles must run cleanly after migration');

  // 4. Verification
  const cols = getTableColumns(db, 'admin_profiles');
  assert.ok(cols.has('require_password'));
  const attempts = getTableColumns(db, 'admin_login_attempts');
  assert.ok(attempts.has('attempt_key'));
});
