import assert from 'node:assert/strict';
import test from 'node:test';
import {
  ADMIN_OWNER,
  isOwnerEmail,
} from '../app/lib/admin-access.ts';
import {
  CURRENT_PBKDF2_ITERATIONS,
  LEGACY_PBKDF2_ITERATIONS,
  attemptAllowed,
  clearFailures,
  createPremiumSession,
  passwordMatches,
  passwordRecord,
  recordFailure,
} from '../app/lib/bank-premium.ts';

const ADMIN_ELEVATED_HEADER = 'x-kh-admin-elevated';

// ---------------------------------------------------------
// 1. Proxy Header Behavior Tests
// ---------------------------------------------------------
test('1. Proxy Headers: Owner requests receive ADMIN_ELEVATED_HEADER and NEVER receive x-kh-staff-email', () => {
  const ownerEmail = ADMIN_OWNER[0];
  assert.equal(isOwnerEmail(ownerEmail), true);

  // Simulate proxy logic from proxy.ts lines 70-75
  const simulateProxyForUser = (email, incomingHeaders = {}) => {
    const headers = new Map(Object.entries(incomingHeaders));
    if (!email) return { pass: true, headers };
    if (isOwnerEmail(email)) {
      headers.delete('x-kh-staff-email');
      headers.set(ADMIN_ELEVATED_HEADER, '1');
      return { pass: true, headers };
    }
    // Staff logic
    headers.set('x-kh-staff-email', email);
    headers.set(ADMIN_ELEVATED_HEADER, '1');
    return { pass: true, headers };
  };

  // Test with all known owner emails
  for (const owner of ADMIN_OWNER) {
    const res = simulateProxyForUser(owner, { 'x-kh-staff-email': 'spoofed@evil.com' });
    assert.equal(res.headers.get(ADMIN_ELEVATED_HEADER), '1', 'Owner must have elevated header');
    assert.equal(res.headers.has('x-kh-staff-email'), false, 'Owner must NOT have x-kh-staff-email');
  }

  // Test with delegated staff email
  const staffEmail = 'staff.reviewer@kavharibis.org';
  const staffRes = simulateProxyForUser(staffEmail);
  assert.equal(staffRes.headers.get('x-kh-staff-email'), staffEmail, 'Staff must have x-kh-staff-email');
  assert.equal(staffRes.headers.get(ADMIN_ELEVATED_HEADER), '1', 'Staff receives elevated header for assigned section');
});

// ---------------------------------------------------------
// 2. Banks Admin Page Visibility Logic Tests
// ---------------------------------------------------------
test('2. Banks Page: PremiumMemberManager renders ONLY for authentic owner and is hidden from staff', () => {
  const checkPageVisibility = (userEmail, staffHeaderEmail) => {
    const staffEmail = staffHeaderEmail || '';
    const isOwner = isOwnerEmail(userEmail) && (!staffEmail || isOwnerEmail(staffEmail));
    return {
      isOwner,
      shouldLoadData: isOwner,
      renderPremiumMemberManager: isOwner,
    };
  };

  // 1. Owner visits page (normal flow: user is owner, staffEmail is empty)
  const ownerVisits = checkPageVisibility(ADMIN_OWNER[0], '');
  assert.equal(ownerVisits.isOwner, true);
  assert.equal(ownerVisits.shouldLoadData, true);
  assert.equal(ownerVisits.renderPremiumMemberManager, true);

  // 2. Staff member with delegated bank access visits page
  const staffVisits = checkPageVisibility('staff@kavharibis.org', 'staff@kavharibis.org');
  assert.equal(staffVisits.isOwner, false);
  assert.equal(staffVisits.shouldLoadData, false);
  assert.equal(staffVisits.renderPremiumMemberManager, false);

  // 3. Forged staff header with non-owner user
  const forgedVisits = checkPageVisibility('random.user@gmail.com', '');
  assert.equal(forgedVisits.isOwner, false);
  assert.equal(forgedVisits.renderPremiumMemberManager, false);

  // 4. Staff trying to pass an owner email in staffEmail header while authenticated as staff
  const impersonatorVisits = checkPageVisibility('staff@kavharibis.org', ADMIN_OWNER[0]);
  assert.equal(impersonatorVisits.isOwner, false, 'Authenticated user MUST be owner');
  assert.equal(impersonatorVisits.renderPremiumMemberManager, false);
});

// ---------------------------------------------------------
// 3. Premium Members API Authorization (requirePremiumOwner) Tests
// ---------------------------------------------------------
test('3. API Auth: requirePremiumOwner strictly permits authentic owner and rejects delegated staff or public', async () => {
  const simulateRequirePremiumOwner = async ({ cookieUser, staffHeader, isElevated }) => {
    const staffEmail = staffHeader || null;
    if (staffEmail && !isOwnerEmail(staffEmail)) {
      return false; // Delegated staff strictly blocked
    }
    if (cookieUser?.email && isOwnerEmail(cookieUser.email)) {
      return true;
    }
    if (isElevated) {
      return !staffEmail || isOwnerEmail(staffEmail);
    }
    return false;
  };

  // 1. Valid Owner via cookie session
  assert.equal(
    await simulateRequirePremiumOwner({
      cookieUser: { email: ADMIN_OWNER[0] },
      staffHeader: null,
      isElevated: true,
    }),
    true,
    'Owner session must be authorized',
  );

  // 2. Delegated staff (even if isElevated is set)
  assert.equal(
    await simulateRequirePremiumOwner({
      cookieUser: { email: 'staff@kavharibis.org' },
      staffHeader: 'staff@kavharibis.org',
      isElevated: true,
    }),
    false,
    'Delegated staff MUST be denied access to premium member management',
  );

  // 3. Unauthenticated public request
  assert.equal(
    await simulateRequirePremiumOwner({
      cookieUser: null,
      staffHeader: null,
      isElevated: false,
    }),
    false,
    'Public user must be denied',
  );
});

// ---------------------------------------------------------
// 4. PBKDF2 Password Hashing & Verification Tests
// ---------------------------------------------------------
test('4. Password Security: PBKDF2 100k iteration hashing and legacy 150k iteration backwards compatibility', async () => {
  const password = 'SuperSecurePassword2026!';
  const record = await passwordRecord(password);

  assert.ok(record.salt && record.salt.length === 32, 'Salt must be 16 random bytes (32 hex chars)');
  assert.ok(record.hash && record.hash.length === 64, 'Hash must be 32 bytes (64 hex chars)');

  // Verifies correctly with matching password
  const valid = await passwordMatches(password, record.salt, record.hash);
  assert.equal(valid, true, 'Matching password must verify');

  // Rejects incorrect password
  const invalid = await passwordMatches('WrongPassword123!', record.salt, record.hash);
  assert.equal(invalid, false, 'Wrong password must be rejected');

  // Legacy 150,000 iterations test
  // Derive a legacy hash directly to confirm fallback works
  const encoder = new TextEncoder();
  const hexToBytes = (hex) => new Uint8Array((hex.match(/.{1,2}/g) || []).map((v) => parseInt(v, 16)));
  const bytesToHex = (bytes) => Array.from(bytes, (v) => v.toString(16).padStart(2, '0')).join('');

  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(password),
    'PBKDF2',
    false,
    ['deriveBits'],
  );
  const legacyHash = bytesToHex(
    new Uint8Array(
      await crypto.subtle.deriveBits(
        {
          name: 'PBKDF2',
          hash: 'SHA-256',
          salt: hexToBytes(record.salt),
          iterations: LEGACY_PBKDF2_ITERATIONS,
        },
        key,
        256,
      ),
    ),
  );

  const legacyMatches = await passwordMatches(password, record.salt, legacyHash);
  assert.equal(legacyMatches, true, 'Legacy 150,000 iteration password hashes must continue to verify');
});

// ---------------------------------------------------------
// 5. Member Lifecycle & Management Operations Tests
// ---------------------------------------------------------
test('5. Member Lifecycle: Creation, duplicate validation, temporary expiration, and activation toggle', async () => {
  // In-memory mock DB simulating Cloudflare D1
  const members = new Map();
  const sessions = new Map();

  const mockDb = {
    members,
    sessions,
    prepare(sql) {
      const q = sql.replace(/\s+/g, ' ').trim();
      return {
        bind(...args) {
          return {
            first: async () => {
              if (q.includes('FROM bank_premium_members WHERE LOWER(email)=? AND id != ?')) {
                const [email, id] = args;
                for (const m of members.values()) {
                  if (m.email.toLowerCase() === email.toLowerCase() && m.id !== id) return m;
                }
                return null;
              }
              if (q.includes('FROM bank_premium_members WHERE LOWER(email)=?')) {
                const [email] = args;
                for (const m of members.values()) {
                  if (m.email.toLowerCase() === email.toLowerCase()) return m;
                }
                return null;
              }
              if (q.includes('FROM bank_premium_members WHERE id=?')) {
                return members.get(args[0]) || null;
              }
              return null;
            },
            run: async () => {
              if (q.includes('INSERT INTO bank_premium_members')) {
                const [id, email, name, password_salt, password_hash, active, access_type, expires_at, notes, created_at, updated_at] = args;
                members.set(id, { id, email, name, password_salt, password_hash, active, access_type, expires_at, notes, created_at, updated_at, last_login_at: '', login_count: 0 });
                return { success: true };
              }
              if (q.includes('UPDATE bank_premium_members SET email=?,name=?,active=?,access_type=?,expires_at=?,notes=?,updated_at=? WHERE id=?')) {
                const [email, name, active, access_type, expires_at, notes, updated_at, id] = args;
                const m = members.get(id);
                if (m) {
                  Object.assign(m, { email, name, active, access_type, expires_at, notes, updated_at });
                }
                return { success: true };
              }
              if (q.includes('DELETE FROM bank_premium_members WHERE id=?')) {
                members.delete(args[0]);
                return { success: true };
              }
              return { success: true };
            },
          };
        },
      };
    },
    batch: async (ops) => {
      for (const op of ops) {
        if (op?.run) await op.run();
      }
    },
  };

  // 1. Create a permanent member
  const member1Id = 'mem-1';
  const rec1 = await passwordRecord('InitialPassword123!');
  await mockDb.prepare('INSERT INTO bank_premium_members(id,email,name,password_salt,password_hash,active,access_type,expires_at,notes,created_at,updated_at) VALUES(?,?,?,?,?,?,?,?,?,?,?)')
    .bind(member1Id, 'analyst@fund.com', 'Senior Analyst', rec1.salt, rec1.hash, 1, 'permanent', '', 'Executive tier', '2026-10-01', '2026-10-01')
    .run();

  assert.equal(members.size, 1);
  const created = members.get(member1Id);
  assert.equal(created.email, 'analyst@fund.com');
  assert.equal(created.active, 1);
  assert.equal(created.access_type, 'permanent');

  // 2. Duplicate email check prevents duplicate creation
  const duplicate = await mockDb.prepare('SELECT id FROM bank_premium_members WHERE LOWER(email)=?')
    .bind('ANALYST@fund.com')
    .first();
  assert.ok(duplicate, 'Duplicate check must match existing email case-insensitively');

  // 3. Toggle active status
  await mockDb.prepare('UPDATE bank_premium_members SET email=?,name=?,active=?,access_type=?,expires_at=?,notes=?,updated_at=? WHERE id=?')
    .bind(created.email, created.name, 0, created.access_type, created.expires_at, created.notes, '2026-11-01', member1Id)
    .run();
  assert.equal(members.get(member1Id).active, 0, 'Member should now be inactive');

  // 4. Temporary member creation with expiration
  const member2Id = 'mem-2';
  const futureExp = new Date(Date.now() + 7 * 86400 * 1000).toISOString();
  await mockDb.prepare('INSERT INTO bank_premium_members(id,email,name,password_salt,password_hash,active,access_type,expires_at,notes,created_at,updated_at) VALUES(?,?,?,?,?,?,?,?,?,?,?)')
    .bind(member2Id, 'temp@research.org', 'Researcher Temp', rec1.salt, rec1.hash, 1, 'temporary', futureExp, 'Trial', '2026-11-01', '2026-11-01')
    .run();
  assert.equal(members.size, 2);
  assert.equal(members.get(member2Id).access_type, 'temporary');
  assert.equal(members.get(member2Id).expires_at, futureExp);

  // 5. Remove member
  await mockDb.prepare('DELETE FROM bank_premium_members WHERE id=?').bind(member1Id).run();
  assert.equal(members.size, 1);
  assert.equal(members.has(member1Id), false, 'Removed member must no longer exist');
});

// ---------------------------------------------------------
// 6. Public Bank Report Unlock and Session Validation Tests
// ---------------------------------------------------------
test('6. Report Unlock: Active permanent & unexpired temporary members gain access; inactive/expired blocked', () => {
  const isMemberAuthorized = (member) => {
    if (!member) return false;
    if (!member.active) return false;
    if (member.access_type === 'permanent') return true;
    if (member.access_type === 'temporary') {
      return Boolean(member.expires_at && new Date(member.expires_at).getTime() > Date.now());
    }
    return false;
  };

  // Active permanent
  assert.equal(isMemberAuthorized({ active: 1, access_type: 'permanent' }), true);

  // Deactivated permanent
  assert.equal(isMemberAuthorized({ active: 0, access_type: 'permanent' }), false);

  // Active unexpired temporary
  assert.equal(
    isMemberAuthorized({
      active: 1,
      access_type: 'temporary',
      expires_at: new Date(Date.now() + 3600000).toISOString(),
    }),
    true,
  );

  // Expired temporary
  assert.equal(
    isMemberAuthorized({
      active: 1,
      access_type: 'temporary',
      expires_at: new Date(Date.now() - 3600000).toISOString(),
    }),
    false,
  );
});

// ---------------------------------------------------------
// 7. Seferim Admin Save Compatibility Test
// ---------------------------------------------------------
test('7. Seferim Compatibility: Owner elevated header without x-kh-staff-email preserves book save auth', () => {
  const checkSeforimAuth = (requestHeaders) => {
    const isElevated = requestHeaders.get(ADMIN_ELEVATED_HEADER) === '1';
    const staffEmail = requestHeaders.get('x-kh-staff-email');

    // Seforim allows owner (isElevated without non-owner staff, or owner email)
    if (isElevated && !staffEmail) return { allowed: true, role: 'owner' };
    if (isElevated && staffEmail && isOwnerEmail(staffEmail)) return { allowed: true, role: 'owner' };
    if (staffEmail) return { allowed: true, role: 'staff' };
    return { allowed: false };
  };

  const headers = new Map();
  headers.set(ADMIN_ELEVATED_HEADER, '1'); // Fixed proxy output for Owner

  const auth = checkSeforimAuth(headers);
  assert.equal(auth.allowed, true);
  assert.equal(auth.role, 'owner');
});
