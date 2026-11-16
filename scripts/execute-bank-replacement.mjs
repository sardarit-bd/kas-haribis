import path from 'node:path';
import fs from 'node:fs';
import { execFileSync } from 'node:child_process';
import { loadEnvFile } from './load-env.mjs';

/**
 * Phase 8: Production Banks Table Replacement Script
 *
 * Scope:
 *   - Replaces ONLY the `banks` table.
 *   - Removes all 293 existing records.
 *   - Inserts all 344 transformed WordPress records.
 *   - Preserves all other 47 production tables untouched.
 *   - Preserves all 4 R2 PDF attachment keys.
 */

const remote = process.argv.includes('--remote');

if (!remote) {
  console.error('[replace-banks-table] FATAL: Must run with --remote flag.');
  process.exit(1);
}

let env = {};
try {
  env = loadEnvFile({ production: true }).env;
} catch (e) {
  env = process.env;
}

const accountId = env.CLOUDFLARE_ACCOUNT_ID || process.env.CLOUDFLARE_ACCOUNT_ID;
const apiToken = env.CLOUDFLARE_API_TOKEN || process.env.CLOUDFLARE_API_TOKEN;
const databaseName = env.D1_DATABASE_NAME || process.env.D1_DATABASE_NAME || 'kav-haribis-db';

if (!accountId || !apiToken) {
  console.error('[replace-banks-table] FATAL: Missing CLOUDFLARE_ACCOUNT_ID or CLOUDFLARE_API_TOKEN.');
  process.exit(1);
}

const wranglerBin = path.join(process.cwd(), 'node_modules', 'wrangler', 'bin', 'wrangler.js');
const datasetPath = path.join(process.cwd(), 'migration', 'transformed_banks_dataset.json');

if (!fs.existsSync(datasetPath)) {
  console.error(`[replace-banks-table] FATAL: Dataset file not found at ${datasetPath}`);
  process.exit(1);
}

const dataset = JSON.parse(fs.readFileSync(datasetPath, 'utf8'));

if (dataset.length !== 344) {
  console.error(`[replace-banks-table] FATAL: Expected 344 records, found ${dataset.length}`);
  process.exit(1);
}

const childEnv = {
  ...process.env,
  CLOUDFLARE_ACCOUNT_ID: accountId,
  CLOUDFLARE_API_TOKEN: apiToken,
  CI: 'true',
};

function executeD1Sql(sql) {
  const output = execFileSync(
    process.execPath,
    [
      wranglerBin,
      'd1',
      'execute',
      databaseName,
      '--remote',
      `--command=${sql}`,
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
}

console.log('========================================================================');
console.log('[replace-banks-table] STARTING BANKS TABLE DATASET REPLACEMENT');
console.log(`  Database Target:   ${databaseName}`);
console.log(`  Target Records:    344`);
console.log('========================================================================');

// Pre-check count
const preRes = executeD1Sql('SELECT COUNT(*) as count FROM banks;');
console.log(`[replace-banks-table] Current production banks count = ${preRes?.[0]?.count}`);

// Step 1: Remove all existing records
console.log('[replace-banks-table] Step 1: Removing all existing records from banks table...');
executeD1Sql('DELETE FROM banks;');
console.log('[replace-banks-table] Step 1 Complete: banks table emptied.');

// Step 2: Insert 344 records in batches of 25
console.log('[replace-banks-table] Step 2: Inserting 344 transformed WordPress records...');
const BATCH_SIZE = 25;

function esc(val) {
  if (val === null || val === undefined) return "''";
  return `'${String(val).replace(/'/g, "''")}'`;
}

for (let i = 0; i < dataset.length; i += BATCH_SIZE) {
  const batch = dataset.slice(i, i + BATCH_SIZE);
  const statements = batch.map((b) => {
    return `INSERT INTO banks (id, title, status, summary, comment, last_updated, full_report, institution_type, website, logo_url, researcher, source_urls, ownership_details, iska_details, internal_notes, sort_order, created_at, report_pdf_key, report_pdf_name) VALUES (${esc(b.id)}, ${esc(b.title)}, ${esc(b.status)}, ${esc(b.summary)}, ${esc(b.comment)}, ${esc(b.last_updated)}, ${esc(b.full_report)}, ${esc(b.institution_type)}, ${esc(b.website)}, ${esc(b.logo_url)}, ${esc(b.researcher)}, ${esc(b.source_urls)}, ${esc(b.ownership_details)}, ${esc(b.iska_details)}, ${esc(b.internal_notes)}, ${b.sort_order || 0}, ${esc(b.created_at)}, ${esc(b.report_pdf_key)}, ${esc(b.report_pdf_name)});`;
  });

  const batchSql = statements.join(' ');
  executeD1Sql(batchSql);
  console.log(`  - Inserted batch ${Math.floor(i / BATCH_SIZE) + 1} of ${Math.ceil(dataset.length / BATCH_SIZE)} (${Math.min(i + BATCH_SIZE, dataset.length)} / 344 records)`);
}

// Step 3: Verification
console.log('[replace-banks-table] Step 3: Verifying final state...');
const postRes = executeD1Sql('SELECT COUNT(*) as count FROM banks;');
const finalCount = Number(postRes?.[0]?.count || 0);
console.log(`[replace-banks-table] Final banks table count = ${finalCount}`);

if (finalCount !== 344) {
  console.error(`[replace-banks-table] ERROR: Final count is ${finalCount}, expected 344!`);
  process.exit(1);
}

const pdfRes = executeD1Sql("SELECT id, report_pdf_key FROM banks WHERE report_pdf_key != '';");
console.log(`[replace-banks-table] Preserved PDF attachments (${pdfRes.length}):`);
for (const p of pdfRes) {
  console.log(`  - ${p.id}: ${p.report_pdf_key}`);
}

if (pdfRes.length !== 4) {
  console.error(`[replace-banks-table] ERROR: Preserved PDFs count is ${pdfRes.length}, expected 4!`);
  process.exit(1);
}

console.log('========================================================================');
console.log('[replace-banks-table] COMPLETE BANKS REPLACEMENT SUCCESSFUL (344/344)');
console.log('========================================================================');
