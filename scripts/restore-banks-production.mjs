import path from 'node:path';
import fs from 'node:fs';
import crypto from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { loadEnvFile } from './load-env.mjs';

/**
 * Phase 8 Emergency Recovery Script: Restore Production Banks to Original 293
 *
 * Scope:
 *   - Replaces ONLY the `banks` table.
 *   - Restores the original 293 production records from verified backup.
 *   - Leaves all other 47 tables and R2 objects completely untouched.
 *   - Human approval required: only executed when explicitly triggered.
 */

const remote = process.argv.includes('--remote');
const local = process.argv.includes('--local');
const testPersist = process.env.TEST_PERSIST_DIR;

if (!remote && !local) {
  console.error('[restore-banks-table] FATAL: Must run with either --remote or --local flag.');
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
    console.error('[restore-banks-table] FATAL: Missing CLOUDFLARE_ACCOUNT_ID or CLOUDFLARE_API_TOKEN.');
    process.exit(1);
  }

  if (!APPROVED_PRODUCTION_DB_NAMES.includes(databaseName)) {
    console.error(`[restore-banks-table] FATAL: Disallowed production database name: "${databaseName}".`);
    console.error(`  Approved production names: ${APPROVED_PRODUCTION_DB_NAMES.join(', ')}`);
    process.exit(1);
  }

  if (databaseId && databaseId !== APPROVED_PRODUCTION_DB_ID) {
    console.error(`[restore-banks-table] FATAL: Disallowed production database ID: "${databaseId}".`);
    console.error(`  Approved production ID: ${APPROVED_PRODUCTION_DB_ID}`);
    process.exit(1);
  }
}

const wranglerBin = path.join(process.cwd(), 'node_modules', 'wrangler', 'bin', 'wrangler.js');
const recoverySqlPath = path.join(process.cwd(), 'scripts', 'data', 'restore-banks-293.sql');

if (!fs.existsSync(recoverySqlPath)) {
  console.error(`[restore-banks-table] FATAL: Recovery SQL not found at ${recoverySqlPath}`);
  process.exit(1);
}

const EXPECTED_RECOVERY_SHA256 = 'c4cb5d057c79e50111488d9e28bd099dd2e8b2fae7c22e027dce9e4ebf64c61d';
const recoveryRaw = fs.readFileSync(recoverySqlPath, 'utf8');
const recoverySha256 = crypto.createHash('sha256').update(recoveryRaw).digest('hex');

if (recoverySha256 !== EXPECTED_RECOVERY_SHA256) {
  console.error('[restore-banks-table] FATAL: Recovery SQL SHA-256 checksum mismatch!');
  console.error(`  Expected: ${EXPECTED_RECOVERY_SHA256}`);
  console.error(`  Actual:   ${recoverySha256}`);
  process.exit(1);
}

console.log('========================================================================');
console.log('[restore-banks-table] STARTING EMERGENCY PRODUCTION BANKS RESTORATION');
console.log(`  Database Target:   ${databaseName} (${remote ? 'REMOTE PRODUCTION' : 'LOCAL'})`);
console.log(`  Database UUID:     ${databaseId || (remote ? APPROVED_PRODUCTION_DB_ID : 'local')}`);
console.log(`  Target Recovery:   293 Original Bank Records`);
console.log(`  Recovery SHA-256:  ${recoverySha256} (VERIFIED)`);
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

// 1. Preflight status
const preRes = executeD1Sql('SELECT COUNT(*) as count FROM banks;');
console.log(`[restore-banks-table] Current banks table count before recovery: ${preRes?.[0]?.count}`);

// 2. Execute Recovery SQL
console.log('[restore-banks-table] Executing recovery SQL file (DELETE FROM banks + 293 INSERTs)...');
executeD1File(recoverySqlPath);
console.log('[restore-banks-table] Recovery file ingestion completed.');

// 3. Post-recovery verification
const postRes = executeD1Sql('SELECT COUNT(*) as count FROM banks;');
const restoredCount = Number(postRes?.[0]?.count || 0);
console.log(`[restore-banks-table] Restored banks count: ${restoredCount}`);

if (restoredCount !== 293) {
  console.error(`[restore-banks-table] ERROR: Restored count is ${restoredCount}, expected exactly 293!`);
  process.exit(1);
}

console.log('========================================================================');
console.log('[restore-banks-table] RESTORATION SUCCESSFUL: 293 ORIGINAL RECORDS RESTORED');
console.log('========================================================================');
