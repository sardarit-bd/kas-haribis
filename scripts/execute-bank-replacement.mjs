import path from 'node:path';
import fs from 'node:fs';
import crypto from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { loadEnvFile } from './load-env.mjs';

/**
 * Phase 8: Production Banks Table Replacement Script
 *
 * Scope:
 *   - Replaces ONLY the `banks` table.
 *   - Strict preflight check: requires exactly 293 existing records.
 *   - Atomic single-file execution: DELETE FROM banks + 344 INSERT statements.
 *   - Full post-replacement verification: 19 fields across all 344 records (6,536 data points).
 *   - Preserves all other 47 production tables untouched (deterministic SHA-256 snapshot & compare).
 *   - Preserves all 4 R2 PDF attachment keys.
 *   - Recovery policy: Human approval required. No automatic rollback execution.
 */

const remote = process.argv.includes('--remote');
const local = process.argv.includes('--local');
const testPersist = process.env.TEST_PERSIST_DIR;

if (!remote && !local) {
  console.error('[replace-banks-table] FATAL: Must run with either --remote or --local flag.');
  process.exit(1);
}

let env = {};
try {
  env = loadEnvFile({ production: remote }).env;
} catch (e) {
  env = process.env;
}

const accountId = env.CLOUDFLARE_ACCOUNT_ID || process.env.CLOUDFLARE_ACCOUNT_ID;
const apiToken = env.CLOUDFLARE_API_TOKEN || process.env.CLOUDFLARE_API_TOKEN;
const databaseName = env.D1_DATABASE_NAME || process.env.D1_DATABASE_NAME || 'kav-haribis-db';
const databaseId = env.D1_DATABASE_ID || process.env.D1_DATABASE_ID;

const APPROVED_PRODUCTION_DB_NAMES = ['kav-haribis-db', 'kav_haribis_db'];
const APPROVED_PRODUCTION_DB_ID = '690ccd56-47ea-4b14-bff6-4b3f70db7000';

if (remote) {
  if (!accountId || !apiToken) {
    console.error('[replace-banks-table] FATAL: Missing CLOUDFLARE_ACCOUNT_ID or CLOUDFLARE_API_TOKEN.');
    process.exit(1);
  }

  if (!APPROVED_PRODUCTION_DB_NAMES.includes(databaseName)) {
    console.error(`[replace-banks-table] FATAL: Disallowed production database name: "${databaseName}".`);
    console.error(`  Approved production names: ${APPROVED_PRODUCTION_DB_NAMES.join(', ')}`);
    process.exit(1);
  }

  if (databaseId && databaseId !== APPROVED_PRODUCTION_DB_ID) {
    console.error(`[replace-banks-table] FATAL: Disallowed production database ID: "${databaseId}".`);
    console.error(`  Approved production ID: ${APPROVED_PRODUCTION_DB_ID}`);
    process.exit(1);
  }
}

const wranglerBin = path.join(process.cwd(), 'node_modules', 'wrangler', 'bin', 'wrangler.js');
const datasetPath = path.join(process.cwd(), 'scripts', 'data', 'target-banks-344.json');

if (!fs.existsSync(datasetPath)) {
  console.error(`[replace-banks-table] FATAL: Dataset file not found at ${datasetPath}`);
  process.exit(1);
}

// 1. Dataset Verification
const EXPECTED_DATASET_SHA256 = '90efed400bcbdffcc394f9b1d72eb2af1c443aeba0258ba5e95d37d2ab2a3db9';
const datasetRaw = fs.readFileSync(datasetPath, 'utf8');
const datasetSha256 = crypto.createHash('sha256').update(datasetRaw).digest('hex');

if (datasetSha256 !== EXPECTED_DATASET_SHA256) {
  console.error('[replace-banks-table] FATAL: Dataset SHA-256 checksum mismatch!');
  console.error(`  Expected: ${EXPECTED_DATASET_SHA256}`);
  console.error(`  Actual:   ${datasetSha256}`);
  process.exit(1);
}

const dataset = JSON.parse(datasetRaw);

if (dataset.length !== 344) {
  console.error(`[replace-banks-table] FATAL: Expected 344 records, found ${dataset.length}`);
  process.exit(1);
}

console.log('========================================================================');
console.log('[replace-banks-table] STARTING BANKS TABLE DATASET REPLACEMENT');
console.log(`  Database Target:   ${databaseName} (${remote ? 'REMOTE PRODUCTION' : 'LOCAL'})`);
console.log(`  Database UUID:     ${databaseId || (remote ? APPROVED_PRODUCTION_DB_ID : 'local')}`);
console.log(`  Target Records:    344`);
console.log(`  Dataset SHA-256:   ${datasetSha256} (VERIFIED)`);
console.log('========================================================================');

const childEnv = {
  ...process.env,
  CLOUDFLARE_ACCOUNT_ID: accountId,
  CLOUDFLARE_API_TOKEN: apiToken,
  CI: 'true',
};

function parseJsonArray(text) {
  const jsonStart = text.search(/\[\s*\{/);
  const lastBracket = text.lastIndexOf(']');
  if (jsonStart === -1 || lastBracket === -1 || jsonStart >= lastBracket) return [];
  const candidate = text.slice(jsonStart, lastBracket + 1);
  try {
    const parsed = JSON.parse(candidate);
    return parsed?.[0]?.results || [];
  } catch (e) {
    return [];
  }
}

function executeD1Sql(sql) {
  const args = [
    wranglerBin,
    'd1',
    'execute',
    local ? 'DB' : databaseName,
    local ? '--local' : '--remote',
    `--command=${sql}`,
    '--json',
  ];
  if (local && testPersist) {
    args.push(`--persist-to=${testPersist}`);
  }

  const output = execFileSync(process.execPath, args, {
    encoding: 'utf8',
    cwd: process.cwd(),
    env: childEnv,
  });
  return parseJsonArray(output);
}

function executeD1File(filePath) {
  const args = [
    wranglerBin,
    'd1',
    'execute',
    local ? 'DB' : databaseName,
    local ? '--local' : '--remote',
    `--file=${filePath}`,
    '--yes',
  ];
  if (local && testPersist) {
    args.push(`--persist-to=${testPersist}`);
  }

  execFileSync(process.execPath, args, {
    stdio: 'pipe',
    cwd: process.cwd(),
    env: childEnv,
  });
}

// 2. Discover all tables and snapshot 47 unrelated tables
console.log('[replace-banks-table] Step 1: Inspecting schema and preflight counts...');
const tablesRes = executeD1Sql("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' AND name NOT LIKE '_cf_%';");
const allTables = tablesRes.map((r) => r.name).sort();
const unrelatedTables = allTables.filter((t) => t !== 'banks');

console.log(`  Total database tables: ${allTables.length}`);
console.log(`  Unrelated tables to preserve: ${unrelatedTables.length}`);

// Preflight Bank Count Check: MUST BE EXACTLY 293
const preBanksRes = executeD1Sql('SELECT COUNT(*) as count FROM banks;');
const initialBankCount = Number(preBanksRes?.[0]?.count || 0);
console.log(`  Current banks table count: ${initialBankCount}`);

if (initialBankCount !== 293) {
  console.error(`[replace-banks-table] PREFLIGHT ABORT: Current banks count is ${initialBankCount}, expected exactly 293.`);
  console.error('  No changes made. Terminating immediately.');
  process.exit(1);
}

// Take deterministic snapshot of all 47 unrelated tables
console.log('[replace-banks-table] Step 2: Capturing pre-migration snapshot of all 47 unrelated tables...');
const preSnapshots = {};
for (const table of unrelatedTables) {
  const rows = executeD1Sql(`SELECT * FROM "${table}" ORDER BY 1;`);
  const str = JSON.stringify(rows);
  preSnapshots[table] = {
    count: rows.length,
    sha256: crypto.createHash('sha256').update(str).digest('hex'),
  };
}
console.log('  Snapshot of 47 unrelated tables successfully captured.');

// 3. Generate Single-File Atomic Replacement SQL
console.log('[replace-banks-table] Step 3: Generating single-file atomic replacement SQL...');
function escapeSql(val) {
  if (val === null || val === undefined) return 'NULL';
  if (typeof val === 'number') return val;
  return `'${String(val).replace(/'/g, "''")}'`;
}

const sqlLines = [];
sqlLines.push('-- KAV HARIBIS: ATOMIC BANKS TABLE REPLACEMENT');
sqlLines.push('DELETE FROM banks;');

const columns = [
  'id', 'title', 'status', 'summary', 'comment', 'last_updated',
  'full_report', 'institution_type', 'website', 'logo_url', 'researcher',
  'source_urls', 'ownership_details', 'iska_details', 'internal_notes',
  'sort_order', 'created_at', 'report_pdf_key', 'report_pdf_name'
];

for (const row of dataset) {
  const vals = columns.map((c) => escapeSql(row[c]));
  sqlLines.push(`INSERT INTO banks (${columns.join(', ')}) VALUES (${vals.join(', ')});`);
}

const tempSqlDir = path.join(process.cwd(), '.tmp');
fs.mkdirSync(tempSqlDir, { recursive: true });
const tempSqlFile = path.join(tempSqlDir, `replace-banks-${Date.now()}.sql`);
fs.writeFileSync(tempSqlFile, sqlLines.join('\n') + '\n', 'utf8');

console.log(`  Generated ${sqlLines.length - 1} SQL statements in ${tempSqlFile} (${fs.statSync(tempSqlFile).size} bytes).`);

// 4. Execute Atomic Single-File Replacement
console.log('[replace-banks-table] Step 4: Executing atomic replacement via wrangler d1 execute --file...');
try {
  executeD1File(tempSqlFile);
  console.log('  Atomic file execution completed successfully.');
} catch (execErr) {
  console.error('[replace-banks-table] FATAL: Atomic execution failed during SQL ingestion!');
  console.error(`  Error message: ${execErr.message}`);
  console.error('  Cloudflare D1 automatically reverts incomplete file executions.');
  try { fs.unlinkSync(tempSqlFile); } catch (_) {}
  process.exit(1);
}
try { fs.unlinkSync(tempSqlFile); } catch (_) {}

// 5. Post-Replacement Verification
console.log('[replace-banks-table] Step 5: Commencing deep post-replacement verification...');

// Check A: Row count
const postBanksRes = executeD1Sql('SELECT COUNT(*) as count FROM banks;');
const postBankCount = Number(postBanksRes?.[0]?.count || 0);
console.log(`  Post-replacement banks count: ${postBankCount}`);

if (postBankCount !== 344) {
  console.error(`[replace-banks-table] VERIFICATION FAILURE: Count is ${postBankCount}, expected 344.`);
  console.error('  HUMAN APPROVAL REQUIRED. Halting without automatic recovery.');
  console.error('  To restore original 293 banks, run: npm run restore:banks:production');
  process.exit(1);
}

// Check B: Exact 19-Field Comparison across all 344 records
console.log('  Running exact 19-field comparison across all 344 records (6,536 data points)...');
const dbRows = executeD1Sql(
  `SELECT ${columns.join(', ')} FROM banks ORDER BY id;`
);

if (dbRows.length !== 344) {
  console.error(`[replace-banks-table] VERIFICATION FAILURE: Retrieved ${dbRows.length} rows, expected 344.`);
  console.error('  HUMAN APPROVAL REQUIRED. Halting without automatic recovery.');
  process.exit(1);
}

const sourceMap = new Map();
dataset.forEach((r) => sourceMap.set(r.id, r));

const mismatches = [];
for (const dbRow of dbRows) {
  const src = sourceMap.get(dbRow.id);
  if (!src) {
    mismatches.push({ id: dbRow.id, error: 'Row not in source dataset' });
    continue;
  }
  for (const col of columns) {
    let srcVal = src[col];
    let dbVal = dbRow[col];

    if (srcVal === null || srcVal === undefined) srcVal = null;
    if (dbVal === null || dbVal === undefined) dbVal = null;

    if (srcVal !== dbVal) {
      mismatches.push({
        id: dbRow.id,
        column: col,
        expected: srcVal,
        actual: dbVal,
      });
    }
  }
}

if (mismatches.length > 0) {
  console.error(`[replace-banks-table] VERIFICATION FAILURE: Found ${mismatches.length} field mismatches!`);
  console.error('  Sample mismatch:', mismatches[0]);
  console.error('  HUMAN APPROVAL REQUIRED. Halting without automatic recovery.');
  console.error('  To restore original 293 banks, run: npm run restore:banks:production');
  process.exit(1);
}
console.log('  Field-by-field verification: 6,536/6,536 data points MATCH EXACTLY (0 mismatches).');

// Check C: Preserved 4 PDF keys
console.log('  Verifying preservation of 4 PDF keys...');
const expectedPdfs = {
  'legacy-2579': 'bank-reports/legacy-2579/report.pdf',
  'legacy-2159': 'bank-reports/legacy-2159/report.pdf',
  'legacy-2013': 'bank-reports/legacy-2013/report.pdf',
  'legacy-2005': 'bank-reports/legacy-2005/report.pdf',
};

const pdfRes = executeD1Sql("SELECT id, report_pdf_key FROM banks WHERE report_pdf_key IS NOT NULL AND report_pdf_key != '';");
if (pdfRes.length !== 4) {
  console.error(`[replace-banks-table] VERIFICATION FAILURE: Expected 4 PDF attachments, found ${pdfRes.length}.`);
  process.exit(1);
}

for (const p of pdfRes) {
  if (expectedPdfs[p.id] !== p.report_pdf_key) {
    console.error(`[replace-banks-table] VERIFICATION FAILURE: Mismatched PDF key for ${p.id}.`);
    console.error(`    Expected: ${expectedPdfs[p.id]}, Found: ${p.report_pdf_key}`);
    process.exit(1);
  }
}
console.log('  All 4 PDF keys verified intact.');

// Check D: Invariance of all 47 unrelated tables
console.log('[replace-banks-table] Step 6: Verifying invariance of all 47 unrelated tables...');
const tableMismatches = [];
for (const table of unrelatedTables) {
  const rows = executeD1Sql(`SELECT * FROM "${table}" ORDER BY 1;`);
  const str = JSON.stringify(rows);
  const currentSha256 = crypto.createHash('sha256').update(str).digest('hex');
  const pre = preSnapshots[table];

  if (pre.count !== rows.length || pre.sha256 !== currentSha256) {
    tableMismatches.push({
      table,
      preCount: pre.count,
      postCount: rows.length,
      preSha: pre.sha256,
      postSha: currentSha256,
    });
  }
}

if (tableMismatches.length > 0) {
  console.error(`[replace-banks-table] CRITICAL VERIFICATION FAILURE: ${tableMismatches.length} unrelated tables were altered!`);
  for (const m of tableMismatches) {
    console.error(`  - Table "${m.table}": count ${m.preCount} -> ${m.postCount}`);
  }
  console.error('  HUMAN APPROVAL REQUIRED. Halting without automatic recovery.');
  console.error('  To restore original 293 banks, run: npm run restore:banks:production');
  process.exit(1);
}
console.log('  All 47 unrelated tables verified 100% untouched (0 count or checksum differences).');

console.log('========================================================================');
console.log('[replace-banks-table] COMPLETE BANKS REPLACEMENT SUCCESSFUL (344/344)');
console.log('  - Preflight bank count: 293 (verified)');
console.log('  - Final bank count:     344 (verified)');
console.log('  - Field equivalence:    6,536 / 6,536 matched');
console.log('  - PDF attachments:      4 / 4 preserved');
console.log('  - Unrelated tables:     47 / 47 untouched');
console.log('========================================================================');
