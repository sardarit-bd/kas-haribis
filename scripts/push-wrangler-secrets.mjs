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
const tempFile = path.join(root, '.wrangler', 'secrets-bulk.json');

fs.mkdirSync(path.dirname(tempFile), { recursive: true });
fs.writeFileSync(tempFile, JSON.stringify(secrets, null, 2));

console.log(`Pushing ${Object.keys(secrets).length} secret(s) to Cloudflare...`);
execFileSync(process.execPath, [wranglerBin, 'secret', 'bulk', tempFile], {
  stdio: 'inherit',
  cwd: root,
});

fs.rmSync(tempFile, { force: true });
console.log('Wrangler secrets updated.');
