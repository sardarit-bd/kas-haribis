import assert from 'node:assert/strict';
import test from 'node:test';
import {
  ADMIN_OWNER,
  ADMIN_SECTIONS,
  canAccessSection,
  getPostLoginRedirect,
  isOwnerEmail,
  setStaffPassword,
  staffPermissions,
} from '../app/lib/admin-access.ts';

const PROTECTED_EMAILS = [
  'mdemong87@gmail.com',
  'kavharibis@gmail.com',
  'sardarit.bd.official@gmail.com',
];

const EXPECTED_ERROR =
  'This email belongs to an admin account and cannot be managed as staff.';

// Mock database simulating Cloudflare D1
function createMockStaffDb() {
  const staffTable = new Map();
  return {
    staffTable,
    prepare(sql) {
      const normalizedSql = sql.replace(/\s+/g, ' ').trim();
      return {
        run: async () => ({ success: true }),
        all: async () => ({ results: Array.from(staffTable.values()) }),
        first: async () => null,
        bind(...args) {
          return {
            run: async () => {
              if (normalizedSql.includes('INSERT INTO admin_staff_access')) {
                const email = String(args[0]).toLowerCase().trim();
                staffTable.set(email, {
                  email,
                  name: args[1],
                  active: args[2],
                  permissions: args[3],
                  password_salt: args[4],
                  password_hash: args[5],
                  created_at: args[6],
                  updated_at: args[7],
                });
                return { success: true };
              }
              if (normalizedSql.includes('UPDATE admin_staff_access SET name=')) {
                const email = String(args[args.length - 1]).toLowerCase().trim();
                const existing = staffTable.get(email) || {};
                staffTable.set(email, {
                  ...existing,
                  name: args[0],
                  active: args[1],
                  permissions: args[2],
                  updated_at: new Date().toISOString(),
                });
                return { success: true };
              }
              if (normalizedSql.includes('UPDATE admin_staff_access SET password_salt=')) {
                const email = String(args[3]).toLowerCase().trim();
                const existing = staffTable.get(email) || {};
                staffTable.set(email, {
                  ...existing,
                  password_salt: args[0],
                  password_hash: args[1],
                  updated_at: args[2],
                });
                return { success: true };
              }
              return { success: true };
            },
            first: async () => {
              if (normalizedSql.includes('FROM admin_staff_access WHERE LOWER(email)=?')) {
                const email = String(args[0]).toLowerCase().trim();
                return staffTable.get(email) || null;
              }
              return null;
            },
            all: async () => ({ results: Array.from(staffTable.values()) }),
          };
        },
      };
    },
  };
}

// Logic replicate of POST /api/admin-staff-access handler
async function handleCreateStaff(body, db) {
  const clean = (val, max = 300) => String(val ?? '').trim().slice(0, max);
  const email = clean(body?.email).toLowerCase();
  const permissions = Array.isArray(body?.permissions) ? body.permissions : [];

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { status: 400, error: 'Enter a valid staff email address.' };
  }

  if (isOwnerEmail(email)) {
    return { status: 400, error: EXPECTED_ERROR };
  }

  if (!permissions.length) {
    return { status: 400, error: 'Select at least one admin section.' };
  }

  const existing = await db.prepare('SELECT email FROM admin_staff_access WHERE LOWER(email)=?')
    .bind(email)
    .first();
  if (existing) {
    return { status: 409, error: 'A staff member with this email address already exists.' };
  }

  await db.prepare('INSERT INTO admin_staff_access(email,name,active,permissions,password_salt,password_hash,created_at,updated_at) VALUES(?,?,1,?,?,?,?,?)')
    .bind(email, clean(body?.name), JSON.stringify(permissions), '', '', new Date().toISOString(), new Date().toISOString())
    .run();

  return { status: 200, saved: true };
}

// Logic replicate of PUT /api/admin-staff-access handler
async function handleUpdateStaff(body, db) {
  const clean = (val, max = 300) => String(val ?? '').trim().slice(0, max);
  const email = clean(body?.email).toLowerCase();
  const newEmail = clean(body?.newEmail || body?.targetEmail).toLowerCase();
  const permissions = Array.isArray(body?.permissions) ? body.permissions : [];

  if (isOwnerEmail(email) || (newEmail && isOwnerEmail(newEmail))) {
    return { status: 400, error: EXPECTED_ERROR };
  }

  if (body?.permissions && !permissions.length) {
    return { status: 400, error: 'Select at least one admin section.' };
  }

  await db.prepare('UPDATE admin_staff_access SET name=?,active=?,permissions=?,updated_at=? WHERE LOWER(email)=?')
    .bind(clean(body?.name), body?.active ? 1 : 0, JSON.stringify(permissions), new Date().toISOString(), email)
    .run();

  return { status: 200, saved: true };
}

test('isOwnerEmail correctly identifies all protected admin emails', () => {
  for (const email of PROTECTED_EMAILS) {
    assert.equal(isOwnerEmail(email), true, `Expected ${email} to be recognized as owner`);
  }
});

test('Each protected email is rejected during staff creation (POST)', async () => {
  const db = createMockStaffDb();

  for (const email of PROTECTED_EMAILS) {
    const result = await handleCreateStaff(
      { email, name: 'Admin Attempt', permissions: ['banks'] },
      db,
    );
    assert.equal(result.status, 400);
    assert.equal(result.error, EXPECTED_ERROR);
    // Confirm not added to database
    assert.equal(db.staffTable.has(email.toLowerCase()), false);
  }
});

test('Protected emails with leading/trailing whitespace and mixed case are rejected during creation', async () => {
  const db = createMockStaffDb();

  const variations = [
    ' MDEMONG87@GMAIL.COM ',
    '\tKavHaribis@gmail.com\n',
    '   Sardarit.BD.Official@Gmail.Com   ',
  ];

  for (const email of variations) {
    const result = await handleCreateStaff(
      { email, name: 'Whitespace Test', permissions: ['banks'] },
      db,
    );
    assert.equal(result.status, 400);
    assert.equal(result.error, EXPECTED_ERROR);
  }
});

test('Protected emails are rejected during staff update and permission assignment (PUT)', async () => {
  const db = createMockStaffDb();

  for (const email of PROTECTED_EMAILS) {
    const result = await handleUpdateStaff(
      { email, name: 'Modified Name', permissions: ['banks', 'invoices'] },
      db,
    );
    assert.equal(result.status, 400);
    assert.equal(result.error, EXPECTED_ERROR);
  }
});

test('Protected email passed as newEmail/targetEmail in staff update is rejected (PUT)', async () => {
  const db = createMockStaffDb();

  // Try updating an existing staff member to have an admin owner email
  const result = await handleUpdateStaff(
    {
      email: 'regular.staff@example.com',
      newEmail: '  MDEMONG87@GMAIL.COM  ',
      permissions: ['banks'],
    },
    db,
  );
  assert.equal(result.status, 400);
  assert.equal(result.error, EXPECTED_ERROR);
});

test('setStaffPassword throws error for protected admin accounts', async () => {
  const db = createMockStaffDb();

  for (const email of PROTECTED_EMAILS) {
    await assert.rejects(
      async () => {
        await setStaffPassword(db, email, 'SomePassword123!');
      },
      (err) => {
        assert.match(err.message, /This email belongs to an admin account and cannot be managed as staff/i);
        return true;
      },
    );
  }
});

test('Ordinary staff creation and permission updates succeed', async () => {
  const db = createMockStaffDb();
  const staffEmail = 'ordinary.employee@example.com';

  // 1. Create valid staff
  const createResult = await handleCreateStaff(
    { email: staffEmail, name: 'Reuven Employee', permissions: ['banks', 'seforim'] },
    db,
  );
  assert.equal(createResult.status, 200);
  assert.equal(createResult.saved, true);
  assert.equal(db.staffTable.has(staffEmail), true);

  // 2. Update permissions
  const updateResult = await handleUpdateStaff(
    { email: staffEmail, name: 'Reuven Employee Updated', permissions: ['banks', 'invoices'], active: true },
    db,
  );
  assert.equal(updateResult.status, 200);
  assert.equal(updateResult.saved, true);

  const updatedStaff = db.staffTable.get(staffEmail);
  assert.equal(updatedStaff.name, 'Reuven Employee Updated');
  assert.equal(updatedStaff.permissions, JSON.stringify(['banks', 'invoices']));
});

test('Protected admin accounts retain full Owner permissions and are never treated as restricted staff', async () => {
  const db = createMockStaffDb();

  for (const email of PROTECTED_EMAILS) {
    // 1. staffPermissions returns all admin sections unconditionally
    const perms = await staffPermissions(db, email);
    assert.equal(perms.length, ADMIN_SECTIONS.length);
    assert.deepEqual(
      perms,
      ADMIN_SECTIONS.map((s) => s.key),
    );

    // 2. canAccessSection returns true for any admin section
    assert.equal(await canAccessSection(db, email, 'banks'), true);
    assert.equal(await canAccessSection(db, email, 'invoices'), true);
    assert.equal(await canAccessSection(db, email, 'settings'), true);
    assert.equal(await canAccessSection(db, email, 'non-existent-section'), true);

    // 3. getPostLoginRedirect sends owner directly to /admin
    const destination = await getPostLoginRedirect(db, email);
    assert.equal(destination, '/admin');

    // 4. Requested section returns the requested section for owner
    const explicitDestination = await getPostLoginRedirect(db, email, '/admin/banks');
    assert.equal(explicitDestination, '/admin/banks');
  }
});
