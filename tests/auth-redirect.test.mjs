import assert from 'node:assert/strict';
import test from 'node:test';
import {
  ADMIN_OWNER,
  ADMIN_SECTIONS,
  canAccessSection,
  getPostLoginRedirect,
  isOwnerEmail,
  parsePermissions,
  sanitizeReturnTo,
} from '../app/lib/admin-access.ts';

test('parsePermissions handles various storage and input formats', () => {
  // Standard JSON array
  assert.deepEqual(parsePermissions('["analytics", "invoices"]'), ['analytics', 'invoices']);

  // Case insensitivity normalization
  assert.deepEqual(parsePermissions('["Analytics", "Invoices"]'), ['analytics', 'invoices']);

  // Native array (in-memory or pre-parsed)
  assert.deepEqual(parsePermissions(['analytics', 'invoices']), ['analytics', 'invoices']);

  // Single string
  assert.deepEqual(parsePermissions('analytics'), ['analytics']);

  // Comma-separated string
  assert.deepEqual(parsePermissions('analytics, invoices'), ['analytics', 'invoices']);

  // Double JSON-stringified array
  assert.deepEqual(parsePermissions(JSON.stringify(JSON.stringify(['analytics']))), ['analytics']);

  // Non-delegatable sections are excluded (e.g., bank-research has delegatable: false)
  assert.deepEqual(parsePermissions('["analytics", "bank-research"]'), ['analytics']);

  // Empty / null / invalid
  assert.deepEqual(parsePermissions(''), []);
  assert.deepEqual(parsePermissions(null), []);
  assert.deepEqual(parsePermissions(undefined), []);
  assert.deepEqual(parsePermissions('invalid json {{{'), []);
});

test('sanitizeReturnTo prevents open redirects and disallows sensitive paths', () => {
  assert.equal(sanitizeReturnTo('/bank-directory'), '/bank-directory');
  assert.equal(sanitizeReturnTo('/admin/analytics'), '/admin/analytics');
  assert.equal(sanitizeReturnTo('/bank-directory?q=chase#results'), '/bank-directory?q=chase#results');

  // Open redirect attempts
  assert.equal(sanitizeReturnTo('https://evil.com'), '');
  assert.equal(sanitizeReturnTo('//evil.com'), '');
  assert.equal(sanitizeReturnTo('/\\evil.com'), '');
  assert.equal(sanitizeReturnTo('javascript:alert(1)'), '');

  // Auth / internal API paths
  assert.equal(sanitizeReturnTo('/sign-in'), '');
  assert.equal(sanitizeReturnTo('/api/auth/login'), '');
  assert.equal(sanitizeReturnTo('/api/admin-staff-access'), '');
});

function createMockDb(staffRows = {}) {
  return {
    prepare(sql) {
      return {
        run() {},
        bind(...args) {
          return {
            first: async () => {
              if (sql.includes('admin_staff_access')) {
                const email = String(args[0] || '').trim().toLowerCase();
                const row = staffRows[email];
                if (!row) return null;
                return row;
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

test('getPostLoginRedirect for Owner', async () => {
  const db = createMockDb();
  const ownerEmail = ADMIN_OWNER[0];

  // Default redirect when no returnTo is provided
  const r1 = await getPostLoginRedirect(db, ownerEmail, '');
  assert.equal(r1, '/admin');

  // When returnTo is '/', it must still go to dashboard (/admin), NOT public homepage
  const r2 = await getPostLoginRedirect(db, ownerEmail, '/');
  assert.equal(r2, '/admin');

  // Explicit valid admin section requested
  const r3 = await getPostLoginRedirect(db, ownerEmail, '/admin/analytics');
  assert.equal(r3, '/admin/analytics');

  // Explicit valid public page requested
  const r4 = await getPostLoginRedirect(db, ownerEmail, '/bank-directory');
  assert.equal(r4, '/bank-directory');

  // Open redirect attempt falls back to /admin
  const r5 = await getPostLoginRedirect(db, ownerEmail, '//attacker.com');
  assert.equal(r5, '/admin');
});

test('getPostLoginRedirect for Staff', async () => {
  const db = createMockDb({
    'staff1@example.com': {
      email: 'staff1@example.com',
      active: 1,
      permissions: JSON.stringify(['analytics', 'alerts']),
    },
    'staff2@example.com': {
      email: 'staff2@example.com',
      active: 1,
      permissions: JSON.stringify(['invoices']),
    },
    'noperms@example.com': {
      email: 'noperms@example.com',
      active: 1,
      permissions: JSON.stringify([]),
    },
  });

  // Staff with analytics permission defaults to first authorized section (/admin/analytics), NEVER public homepage
  const s1Default = await getPostLoginRedirect(db, 'staff1@example.com', '');
  assert.equal(s1Default, '/admin/analytics');

  const s1Slash = await getPostLoginRedirect(db, 'staff1@example.com', '/');
  assert.equal(s1Slash, '/admin/analytics');

  // Staff requesting /admin (owner overview) is redirected to their authorized section instead of unauthorized page
  const s1Admin = await getPostLoginRedirect(db, 'staff1@example.com', '/admin');
  assert.equal(s1Admin, '/admin/analytics');

  // Staff requesting authorized section (/admin/alerts) gets through
  const s1Alerts = await getPostLoginRedirect(db, 'staff1@example.com', '/admin/alerts');
  assert.equal(s1Alerts, '/admin/alerts');

  // Staff requesting unauthorized admin section (/admin/invoices) is redirected to their authorized landing page
  const s1Invoices = await getPostLoginRedirect(db, 'staff1@example.com', '/admin/invoices');
  assert.equal(s1Invoices, '/admin/analytics');

  // Staff requesting public page (/bank-directory) is preserved
  const s1Public = await getPostLoginRedirect(db, 'staff1@example.com', '/bank-directory');
  assert.equal(s1Public, '/bank-directory');

  // Staff2 whose first section is invoices
  const s2Default = await getPostLoginRedirect(db, 'staff2@example.com', '');
  assert.equal(s2Default, '/admin/invoices');

  // Staff with no permissions
  const sNoPerms = await getPostLoginRedirect(db, 'noperms@example.com', '');
  assert.equal(sNoPerms, '/sign-in?error=no_staff_access');
});

test('canAccessSection verifies permissions correctly and case-insensitively', async () => {
  const db = createMockDb({
    'staff@example.com': {
      email: 'staff@example.com',
      active: 1,
      permissions: '["analytics", "invoices"]',
    },
  });

  // Owner has access to everything
  assert.equal(await canAccessSection(db, ADMIN_OWNER[0], 'analytics'), true);
  assert.equal(await canAccessSection(db, ADMIN_OWNER[0], 'invoices'), true);

  // Staff has access to assigned sections
  assert.equal(await canAccessSection(db, 'staff@example.com', 'analytics'), true);
  assert.equal(await canAccessSection(db, 'staff@example.com', 'Analytics'), true);
  assert.equal(await canAccessSection(db, 'staff@example.com', 'invoices'), true);

  // Staff denied for unassigned sections
  assert.equal(await canAccessSection(db, 'staff@example.com', 'donations'), false);
  assert.equal(await canAccessSection(db, 'staff@example.com', 'staff-access'), false);
});
