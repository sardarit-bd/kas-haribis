import assert from 'node:assert/strict';
import test from 'node:test';
import {
  ADMIN_OWNER,
  ADMIN_SECTIONS,
  canAccessSection,
  getMemberSignInDestination,
  getPostLoginRedirect,
  isMemberAccountPath,
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

test('isMemberAccountPath helper correctly identifies member account paths', () => {
  assert.equal(isMemberAccountPath('/membership/account'), true);
  assert.equal(isMemberAccountPath('/membership/account/'), true);
  assert.equal(isMemberAccountPath('/membership/account?tab=orders'), true);
  assert.equal(isMemberAccountPath('/membership/account#profile'), true);
  assert.equal(isMemberAccountPath('/membership/sign-in'), true);
  assert.equal(isMemberAccountPath('/membership/sign-in/'), true);
  assert.equal(isMemberAccountPath('/membership/sign-in?return_to=/'), true);
  assert.equal(isMemberAccountPath('/membership'), false);
  assert.equal(isMemberAccountPath('/membership/account/other'), false);
  assert.equal(isMemberAccountPath('/bank-directory/full-report'), false);
  assert.equal(isMemberAccountPath('/admin'), false);
  assert.equal(isMemberAccountPath(''), false);
  assert.equal(isMemberAccountPath(null), false);
  assert.equal(isMemberAccountPath(undefined), false);
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

  // Explicit valid public page requested (deep link preserved)
  const r4 = await getPostLoginRedirect(db, ownerEmail, '/bank-directory');
  assert.equal(r4, '/bank-directory');

  const rDeep = await getPostLoginRedirect(db, ownerEmail, '/bank-directory/full-report?bankId=1');
  assert.equal(rDeep, '/bank-directory/full-report?bankId=1');

  // Signing in through "Member Sign In" (/membership/account) redirects Owner to /admin
  const rMember = await getPostLoginRedirect(db, ownerEmail, '/membership/account');
  assert.equal(rMember, '/admin');

  const rMemberSlash = await getPostLoginRedirect(db, ownerEmail, '/membership/account/');
  assert.equal(rMemberSlash, '/admin');

  const rMemberQuery = await getPostLoginRedirect(db, ownerEmail, '/membership/account?tab=orders');
  assert.equal(rMemberQuery, '/admin');

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

  // Staff requesting public page (/bank-directory) is preserved as genuine deep link
  const s1Public = await getPostLoginRedirect(db, 'staff1@example.com', '/bank-directory');
  assert.equal(s1Public, '/bank-directory');

  const s1Deep = await getPostLoginRedirect(db, 'staff1@example.com', '/bank-directory/full-report');
  assert.equal(s1Deep, '/bank-directory/full-report');

  // Staff signing in from /membership/account goes to their authorized section
  const s1Member = await getPostLoginRedirect(db, 'staff1@example.com', '/membership/account');
  assert.equal(s1Member, '/admin/analytics');

  // Staff2 whose first section is invoices
  const s2Default = await getPostLoginRedirect(db, 'staff2@example.com', '');
  assert.equal(s2Default, '/admin/invoices');

  const s2Member = await getPostLoginRedirect(db, 'staff2@example.com', '/membership/account');
  assert.equal(s2Member, '/admin/invoices');

  // Staff with no permissions
  const sNoPerms = await getPostLoginRedirect(db, 'noperms@example.com', '');
  assert.equal(sNoPerms, '/sign-in?error=no_staff_access');
});

test('getPostLoginRedirect for Regular Member', async () => {
  const db = createMockDb();
  const regularEmail = 'member@example.com';

  // Regular member signing in to /membership/account remains on /membership/account
  const m1 = await getPostLoginRedirect(db, regularEmail, '/membership/account');
  assert.equal(m1, '/membership/account');

  const m1Query = await getPostLoginRedirect(db, regularEmail, '/membership/account?tab=orders');
  assert.equal(m1Query, '/membership/account?tab=orders');

  // Regular member requesting genuine public deep link is preserved
  const m2 = await getPostLoginRedirect(db, regularEmail, '/bank-directory/full-report');
  assert.equal(m2, '/bank-directory/full-report');

  // Regular member attempting /admin is denied
  const m3 = await getPostLoginRedirect(db, regularEmail, '/admin');
  assert.equal(m3, '/sign-in?error=no_staff_access');

  // Regular member with no returnTo gets default staff landing error
  const m4 = await getPostLoginRedirect(db, regularEmail, '');
  assert.equal(m4, '/sign-in?error=no_staff_access');
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

test('getMemberSignInDestination handles logged-out, Admin/Owner, Staff, and Member cases', async () => {
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

  const ownerEmail = ADMIN_OWNER[0];
  const regularEmail = 'member@example.com';

  // 1. Logged-out visitor clicking "Member Sign In" is sent to /sign-in with return_to=/membership/account
  assert.equal(
    await getMemberSignInDestination(db, null),
    '/sign-in?return_to=%2Fmembership%2Faccount',
  );
  assert.equal(
    await getMemberSignInDestination(db, ''),
    '/sign-in?return_to=%2Fmembership%2Faccount',
  );
  assert.equal(
    await getMemberSignInDestination(db, undefined),
    '/sign-in?return_to=%2Fmembership%2Faccount',
  );

  // 2. Authenticated Admin/Owner clicking "Member Sign In" redirects to /admin
  assert.equal(await getMemberSignInDestination(db, ownerEmail), '/admin');
  assert.equal(await getMemberSignInDestination(db, ownerEmail.toUpperCase()), '/admin');

  // 3. Authenticated Staff clicking "Member Sign In" redirects to their authorized section
  assert.equal(await getMemberSignInDestination(db, 'staff1@example.com'), '/admin/analytics');
  assert.equal(await getMemberSignInDestination(db, 'staff2@example.com'), '/admin/invoices');
  // User with no staff permissions is routed as a regular member to /membership/account
  assert.equal(await getMemberSignInDestination(db, 'noperms@example.com'), '/membership/account');

  // 4. Authenticated Regular Member clicking "Member Sign In" redirects to /membership/account
  assert.equal(await getMemberSignInDestination(db, regularEmail), '/membership/account');

  // 5. Post-login redirection when signing in with return_to=/membership/sign-in
  assert.equal(await getPostLoginRedirect(db, ownerEmail, '/membership/sign-in'), '/admin');
  assert.equal(await getPostLoginRedirect(db, 'staff1@example.com', '/membership/sign-in'), '/admin/analytics');
  assert.equal(await getPostLoginRedirect(db, regularEmail, '/membership/sign-in'), '/membership/account');

  // 6. Direct visit guard simulation for /membership/account:
  // Admin/Owner redirected away from /membership/account to /admin
  const ownerDest = await getMemberSignInDestination(db, ownerEmail);
  assert.notEqual(ownerDest, '/membership/account');
  assert.equal(ownerDest, '/admin');

  // Staff redirected away from /membership/account to authorized admin section
  const staffDest = await getMemberSignInDestination(db, 'staff1@example.com');
  assert.notEqual(staffDest, '/membership/account');
  assert.equal(staffDest, '/admin/analytics');

  // Regular Member allowed to stay on /membership/account
  const memberDest = await getMemberSignInDestination(db, regularEmail);
  assert.equal(memberDest, '/membership/account');
});
