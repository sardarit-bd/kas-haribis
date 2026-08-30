import fs from 'node:fs';
import path from 'node:path';

const keys = [
  'CLOUDFLARE_ACCOUNT_ID',
  'WORKER_NAME',
  'APP_URL',
  'AUTH_SECRET',
  'GOOGLE_CLIENT_ID',
  'GOOGLE_CLIENT_SECRET',
  'D1_DATABASE_NAME',
  'D1_DATABASE_ID',
  'R2_BUCKET_NAME',
  'CARDKNOX_SETTINGS_KEY',
];

const lines = keys
  .map((key) => {
    const value = process.env[key]?.trim();
    return value ? `${key}=${value}` : null;
  })
  .filter(Boolean);

if (!lines.length) {
  console.error('No CI environment variables found to write .env.production.');
  process.exit(1);
}

const target = path.join(process.cwd(), '.env.production');
fs.writeFileSync(target, `${lines.join('\n')}\n`, 'utf8');
console.log(`Wrote ${lines.length} variable(s) to .env.production for CI.`);
