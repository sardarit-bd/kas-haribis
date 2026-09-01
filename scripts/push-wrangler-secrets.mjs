import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { loadEnvFile } from './load-env.mjs';

const root = process.cwd();
const envFile = path.join(root, '.env.production');

if (!fs.existsSync(envFile)) {
  console.log('No .env.production file found — skipping Wrangler secret sync.');
  process.exit(0);
}

const { env: parsed } = loadEnvFile({ production: true });
const secretKeys = [
  'AUTH_SECRET',
  'GOOGLE_CLIENT_ID',
  'GOOGLE_CLIENT_SECRET',
  'CARDKNOX_SETTINGS_KEY',
  'EMAIL_USER',
  'EMAIL_PASSWORD',
];

const secrets = Object.fromEntries(
  secretKeys
    .filter((key) => parsed[key]?.trim())
    .map((key) => [key, parsed[key].trim()]),
);

if (!Object.keys(secrets).length) {
  console.log('.env.production has no Wrangler secrets to push.');
  process.exit(0);
}

const wranglerBin = path.join(root, 'node_modules', 'wrangler', 'bin', 'wrangler.js');
const childEnv = {
  ...process.env,
  CLOUDFLARE_ACCOUNT_ID:
    parsed.CLOUDFLARE_ACCOUNT_ID?.trim() || process.env.CLOUDFLARE_ACCOUNT_ID,
};

let updated = 0;
let skipped = 0;

console.log(`Pushing ${Object.keys(secrets).length} secret(s) to Cloudflare...`);

for (const [key, value] of Object.entries(secrets)) {
  try {
    execFileSync(process.execPath, [wranglerBin, 'secret', 'put', key], {
      cwd: root,
      env: childEnv,
      input: value,
      stdio: ['pipe', 'inherit', 'pipe'],
      encoding: 'utf8',
    });
    console.log(`  ✓ ${key}`);
    updated += 1;
  } catch (error) {
    const message = `${error?.stderr || ''}${error?.message || ''}`;
    if (message.includes('10053') || message.includes('already in use')) {
      console.log(`  ~ ${key} (already configured, skipped)`);
      skipped += 1;
      continue;
    }
    throw error;
  }
}

console.log(`Wrangler secrets updated (${updated} set, ${skipped} skipped).`);
