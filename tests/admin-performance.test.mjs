import assert from 'node:assert/strict';
import test from 'node:test';
import {
  ensureAdminStaff,
  canAccessSection,
  staffPermissions,
  getStaffMemberName,
  getRequestStaffProfile,
  withRequestScope,
} from '../app/lib/admin-access.ts';
import { ensureContactSubmissions } from '../app/lib/contact-submissions.ts';
import { ensureInvoices } from '../app/lib/invoices.ts';

test('ensureAdminStaff avoids redundant ALTER TABLE when columns already exist', async () => {
  const executedStatements = [];
  const mockDb = {
    prepare(sql) {
      return {
        run: async () => {
          executedStatements.push(sql);
        },
        all: async () => {
          executedStatements.push(sql);
          if (sql.includes('PRAGMA table_info')) {
            return {
              results: [
                { name: 'email' },
                { name: 'name' },
                { name: 'active' },
                { name: 'permissions' },
                { name: 'password_salt' },
                { name: 'password_hash' },
                { name: 'created_at' },
                { name: 'updated_at' },
              ],
            };
          }
          return { results: [] };
        },
      };
    },
  };

  await ensureAdminStaff(mockDb);

  // Must run CREATE TABLE and PRAGMA table_info, but NO ALTER TABLE
  const alters = executedStatements.filter((s) => s.includes('ALTER TABLE'));
  assert.equal(alters.length, 0, 'No ALTER TABLE should be executed when columns already exist');
});

test('ensureContactSubmissions avoids redundant ALTER TABLE when columns exist', async () => {
  const executedStatements = [];
  const mockDb = {
    prepare(sql) {
      return {
        run: async () => {
          executedStatements.push(sql);
        },
        all: async () => {
          executedStatements.push(sql);
          if (sql.includes('PRAGMA table_info')) {
            return {
              results: [
                { name: 'id' },
                { name: 'reference' },
                { name: 'name' },
                { name: 'email' },
                { name: 'related_name' },
                { name: 'related_url' },
                { name: 'request_subtype' },
                { name: 'preferred_date' },
                { name: 'location' },
                { name: 'audience' },
                { name: 'attachment_key' },
                { name: 'attachment_name' },
              ],
            };
          }
          return { results: [] };
        },
      };
    },
  };

  await ensureContactSubmissions(mockDb);

  const alters = executedStatements.filter((s) => s.includes('ALTER TABLE'));
  assert.equal(alters.length, 0, 'No ALTER TABLE should be executed when columns already exist');
});

test('ensureInvoices avoids redundant ALTER TABLE when columns exist', async () => {
  const executedStatements = [];
  const mockDb = {
    prepare(sql) {
      return {
        run: async () => {
          executedStatements.push(sql);
        },
        all: async () => {
          executedStatements.push(sql);
          if (sql.includes('PRAGMA table_info')) {
            return {
              results: [
                { name: 'id' },
                { name: 'invoice_number' },
                { name: 'document_type' },
                { name: 'payment_method' },
                { name: 'payment_reference' },
                { name: 'goods_services' },
              ],
            };
          }
          return { results: [] };
        },
      };
    },
  };

  await ensureInvoices(mockDb);

  const alters = executedStatements.filter((s) => s.includes('ALTER TABLE'));
  assert.equal(alters.length, 0, 'No ALTER TABLE should be executed when columns already exist');
});

test('getRequestStaffProfile deduplicates database queries within the same request scope', async () => {
  let queryCount = 0;
  const mockDb = {
    prepare(sql) {
      return {
        bind(...args) {
          return {
            first: async () => {
              queryCount++;
              return {
                name: 'Avrohom Staff',
                permissions: JSON.stringify(['analytics', 'invoices', 'submissions']),
              };
            },
          };
        },
      };
    },
  };

  const email = 'avrohom@example.com';

  await withRequestScope(async () => {
    // Call staffPermissions (as in AdminLayout)
    const perms = await staffPermissions(mockDb, email);
    assert.deepEqual(perms, ['analytics', 'invoices', 'submissions']);

    // Call getStaffMemberName (as in AdminNav)
    const name = await getStaffMemberName(mockDb, email);
    assert.equal(name, 'Avrohom Staff');

    // Call canAccessSection (as in protected page)
    const canAccessAnalytics = await canAccessSection(mockDb, email, 'analytics');
    assert.equal(canAccessAnalytics, true);

    const canAccessInvoices = await canAccessSection(mockDb, email, 'invoices');
    assert.equal(canAccessInvoices, true);

    const canAccessSettings = await canAccessSection(mockDb, email, 'settings');
    assert.equal(canAccessSettings, false);

    // Query count must be exactly 1 due to request-scoped cache
    assert.equal(queryCount, 1, 'Only 1 database query should have been issued across all lookups');
  });
});
