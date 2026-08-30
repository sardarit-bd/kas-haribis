import fs from 'node:fs';
import path from 'node:path';

const defaults = {
  WORKER_NAME: 'kav-haribis-site',
  D1_DATABASE_NAME: 'kav-haribis-db',
  R2_BUCKET_NAME: 'kav-haribis-files',
};

const required = [
  'CLOUDFLARE_ACCOUNT_ID',
  'APP_URL',
  'AUTH_SECRET',
  'GOOGLE_CLIENT_ID',
  'GOOGLE_CLIENT_SECRET',
  'D1_DATABASE_ID',
];

const optional = ['CARDKNOX_SETTINGS_KEY'];

function normalizeValue(key, raw) {
  let value = raw?.trim() || defaults[key] || '';
  if (key === 'APP_URL' && value.startsWith('APP_URL=')) {
    value = value.slice('APP_URL='.length).trim();
  }
  return value;
}

function envValue(key) {
  return normalizeValue(key, process.env[key]);
}

const missing = required.filter((key) => !envValue(key));
if (missing.length) {
  console.error('Missing required GitHub Actions secrets:\n');
  for (const key of missing) {
    console.error(`  - ${key}`);
  }
  console.error(
    '\nAdd them at: GitHub repo → Settings → Secrets and variables → Actions → New repository secret',
  );
  console.error(
    'Also add CLOUDFLARE_API_TOKEN (used later in the deploy steps).\n',
  );
  process.exit(1);
}

const keys = [...required, ...Object.keys(defaults), ...optional];
const lines = keys
  .filter((key, index, all) => all.indexOf(key) === index)
  .map((key) => {
    const value = envValue(key);
    return value ? `${key}=${value}` : null;
  })
  .filter(Boolean);

const target = path.join(process.cwd(), '.env.production');
fs.writeFileSync(target, `${lines.join('\n')}\n`, 'utf8');
console.log(`Wrote ${lines.length} variable(s) to .env.production for CI.`);
