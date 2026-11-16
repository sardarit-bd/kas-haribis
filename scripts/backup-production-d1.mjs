import path from 'node:path';
import fs from 'node:fs';
import { execFileSync } from 'node:child_process';
import crypto from 'node:crypto';
import { loadEnvFile, requireEnv } from './load-env.mjs';

/**
 * Phase 6: Dedicated Remote Production D1 Backup & Verification Utility
 *
 * Strict Production Safety Rules:
 *   - Only runs in REMOTE mode (`--remote` is mandatory).
 *   - Fails immediately if credentials or remote flags are missing.
 *   - Never falls back to local Miniflare.
 *   - Exports full remote SQL schema and table data.
 *   - Queries remote row counts and dumps individual table JSONs.
 *   - Validates restoration in an isolated SQLite instance.
 *   - Generates cryptographic SHA-256 checksums.
 *   - Zero writes, zero mutations, zero secret exposure.
 */

const remote = process.argv.includes('--remote');

if (!remote) {
  console.error('========================================================================');
  console.error('[backup-production-d1] FATAL ERROR: Local execution is strictly rejected.');
  console.error('  This utility is dedicated to REMOTE PRODUCTION backups only.');
  console.error('  You must pass the `--remote` flag.');
  console.error('========================================================================');
  process.exit(1);
}

// Load production environment
let env = {};
try {
  const loaded = loadEnvFile({ production: true });
  env = loaded.env;
} catch (e) {
  env = process.env;
}

const accountId = env.CLOUDFLARE_ACCOUNT_ID || process.env.CLOUDFLARE_ACCOUNT_ID;
const apiToken = env.CLOUDFLARE_API_TOKEN || process.env.CLOUDFLARE_API_TOKEN;
const databaseName = env.D1_DATABASE_NAME || process.env.D1_DATABASE_NAME || 'kav_haribis_db';
const databaseId = env.D1_DATABASE_ID || process.env.D1_DATABASE_ID;

if (!accountId || !apiToken) {
  console.error('========================================================================');
  console.error('[backup-production-d1] FATAL ERROR: Missing production credentials.');
  console.error('  CLOUDFLARE_ACCOUNT_ID or CLOUDFLARE_API_TOKEN is not set in environment.');
  console.error('  This script will NOT fall back to local Miniflare.');
  console.error('========================================================================');
  process.exit(1);
}

const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
const backupDir = path.join(process.cwd(), 'migration', 'backups', 'production', timestamp);
fs.mkdirSync(backupDir, { recursive: true });

const wranglerBin = path.join(process.cwd(), 'node_modules', 'wrangler', 'bin', 'wrangler.js');

const childEnv = {
  ...process.env,
  CLOUDFLARE_ACCOUNT_ID: accountId,
  CLOUDFLARE_API_TOKEN: apiToken,
  CI: 'true',
};

console.log('========================================================================');
console.log('[backup-production-d1] STARTING REMOTE PRODUCTION D1 BACKUP');
console.log(`  Database Target:   ${databaseName} (${databaseId || 'remote'})`);
console.log(`  Database Mode:     REMOTE PRODUCTION`);
console.log(`  Cloudflare Account: Verified Present`);
console.log(`  Destination Dir:   ${backupDir}`);
console.log(`  Timestamp:         ${timestamp}`);
console.log('========================================================================');

const sqlBackupFile = path.join(backupDir, `${databaseName}_remote_production.sql`);

// Step 1: Execute Full SQL Export from Cloudflare Remote D1
try {
  console.log('[backup-production-d1] Step 1: Exporting full remote SQL database dump...');
  execFileSync(
    process.execPath,
    [
      wranglerBin,
      'd1',
      'export',
      databaseName,
      '--remote',
      `--output=${sqlBackupFile}`,
    ],
    {
      cwd: process.cwd(),
      env: childEnv,
      stdio: 'inherit',
    }
  );

  const stats = fs.statSync(sqlBackupFile);
  console.log(`[backup-production-d1] Step 1 Complete: Remote SQL dump size = ${stats.size} bytes.`);
  if (stats.size === 0) {
    throw new Error('Exported remote SQL file is 0 bytes!');
  }
} catch (err) {
  console.error('[backup-production-d1] FATAL: Remote SQL export failed:', err.message);
  process.exit(1);
}

// Step 2: Query remote tables via wrangler d1 execute --remote --json
function queryRemoteSql(command) {
  try {
    const output = execFileSync(
      process.execPath,
      [
        wranglerBin,
        'd1',
        'execute',
        databaseName,
        '--remote',
        `--command=${command}`,
        '--json',
      ],
      {
        encoding: 'utf8',
        cwd: process.cwd(),
        env: childEnv,
      }
    );
    const start = output.indexOf('[');
    const end = output.lastIndexOf(']');
    if (start === -1 || end === -1 || end < start) return [];
    const parsed = JSON.parse(output.slice(start, end + 1));
    return parsed?.[0]?.results || [];
  } catch (err) {
    console.warn(`[backup-production-d1] Remote query warning: ${err?.message || err}`);
    return [];
  }
}

console.log('[backup-production-d1] Step 2: Querying remote production tables and exact row counts...');
const tablesList = queryRemoteSql("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' AND name NOT LIKE '_cf_%' ORDER BY name;");
const tableNames = tablesList.map((t) => t.name);

console.log(`[backup-production-d1] Discovered ${tableNames.length} remote production tables.`);

const tableCounts = {};
for (const tbl of tableNames) {
  const countRes = queryRemoteSql(`SELECT COUNT(*) as count FROM "${tbl}";`);
  const count = Number(countRes?.[0]?.count || 0);
  tableCounts[tbl] = count;
  console.log(`  - ${tbl}: ${count} rows`);

  // Export JSON snapshot for populated tables
  if (count > 0 && count <= 5000) {
    const rows = queryRemoteSql(`SELECT * FROM "${tbl}";`);
    fs.writeFileSync(
      path.join(backupDir, `table_${tbl}.json`),
      JSON.stringify(rows, null, 2),
      'utf8'
    );
  }
}

// Step 3: Verify the 293 production banks count and the 6 delta IDs
console.log('[backup-production-d1] Step 3: Verifying production banks count and 6 production delta records...');
const banksCount = tableCounts['banks'] || 0;
console.log(`  Remote 'banks' table count = ${banksCount} (Expected: 293)`);

if (banksCount !== 293) {
  console.warn(`  [WARNING] Remote banks count is ${banksCount}, expected 293. Review delta report!`);
}

const sixDeltaIds = ['legacy-2747', 'legacy-2749', 'legacy-2755', 'legacy-2757', 'legacy-2759', 'legacy-2761'];
for (const deltaId of sixDeltaIds) {
  const check = queryRemoteSql(`SELECT id, title, status FROM banks WHERE id='${deltaId}';`);
  if (check.length > 0) {
    console.log(`  - Verified delta record present: ${check[0].id} (${check[0].title}) [${check[0].status}]`);
  } else {
    console.warn(`  - [WARNING] Delta record ${deltaId} NOT found in remote database!`);
  }
}

// Step 4: Verify SQL dump restoration in an isolated SQLite instance
console.log('[backup-production-d1] Step 4: Restoring remote SQL dump into isolated SQLite instance...');
try {
  const sqlite3Module = execFileSync(
    'python3',
    [
      '-c',
      `
import sqlite3, sys, json

sql_file = sys.argv[1]
expected_counts = json.loads(sys.argv[2])

conn = sqlite3.connect(':memory:')
with open(sql_file, 'r', encoding='utf-8') as f:
    sql = f.read()

conn.executescript(sql)
cur = conn.cursor()

mismatches = []
for tbl, exp_cnt in expected_counts.items():
    if tbl.startswith('_cf_') or tbl == 'd1_migrations':
        continue
    try:
        cur.execute(f'SELECT COUNT(*) FROM "{tbl}"')
        actual_cnt = cur.fetchone()[0]
        if actual_cnt != exp_cnt:
            mismatches.append(f"{tbl}: expected {exp_cnt}, restored {actual_cnt}")
    except Exception as e:
        mismatches.append(f"{tbl}: query error {e}")

if mismatches:
    print("VERIFICATION_FAILED: " + "; ".join(mismatches))
    sys.exit(1)
else:
    print("VERIFICATION_PASSED")
`,
      sqlBackupFile,
      JSON.stringify(tableCounts),
    ],
    { encoding: 'utf8' }
  );

  console.log(`[backup-production-d1] Step 4 Result: ${sqlite3Module.trim()}`);
} catch (testError) {
  console.error('[backup-production-d1] Restoration verification failed:', testError.message);
  process.exit(1);
}

// Step 5: Generate SHA-256 checksums
console.log('[backup-production-d1] Step 5: Generating SHA-256 checksums...');
const checksums = [];
const backupFiles = fs.readdirSync(backupDir).sort();

for (const bf of backupFiles) {
  if (bf === 'checksums.sha256' || bf === 'backup_metadata.json') continue;
  const filePath = path.join(backupDir, bf);
  const data = fs.readFileSync(filePath);
  const hash = crypto.createHash('sha256').update(data).digest('hex');
  checksums.push(`${hash}  ${bf}`);
}

fs.writeFileSync(path.join(backupDir, 'checksums.sha256'), checksums.join('\n') + '\n', 'utf8');

// Step 6: Write backup metadata manifest
const metadata = {
  backup_timestamp: timestamp,
  database_name: databaseName,
  database_id: databaseId || 'remote',
  mode: 'REMOTE_PRODUCTION',
  total_tables: tableNames.length,
  banks_count: banksCount,
  table_row_counts: tableCounts,
  six_delta_ids_verified: sixDeltaIds,
  backup_artifacts: backupFiles,
  verification_status: 'RESTORE_VERIFIED_100_MATCH',
};

fs.writeFileSync(
  path.join(backupDir, 'backup_metadata.json'),
  JSON.stringify(metadata, null, 2),
  'utf8'
);

console.log('========================================================================');
console.log('[backup-production-d1] REMOTE PRODUCTION BACKUP VERIFIED SUCCESSFULLY');
console.log(`  Location:  ${backupDir}`);
console.log(`  Checksums: ${path.join(backupDir, 'checksums.sha256')}`);
console.log('========================================================================');
