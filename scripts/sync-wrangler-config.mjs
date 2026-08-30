import fs from 'node:fs';
import path from 'node:path';
import { loadEnvFile, requireEnv } from './load-env.mjs';

const production = process.argv.includes('--production');
let loaded;

if (production && fs.existsSync(path.join(process.cwd(), '.env.production'))) {
  loaded = loadEnvFile({ production: true });
} else if (production) {
  console.warn('.env.production not found — using .env.local for wrangler sync.');
  loaded = loadEnvFile({ production: false });
} else {
  loaded = loadEnvFile({ production: false });
}

const { env, envFile } = loaded;

const config = {
  $schema: 'node_modules/wrangler/config-schema.json',
  name: requireEnv(env, 'WORKER_NAME', 'Example: kav-haribis-site'),
  account_id: requireEnv(env, 'CLOUDFLARE_ACCOUNT_ID'),
  compatibility_date: '2025-08-01',
  compatibility_flags: ['nodejs_compat'],
  main: './worker/index.ts',
  assets: {
    directory: 'dist/client',
    not_found_handling: 'none',
    binding: 'ASSETS',
  },
  images: {
    binding: 'IMAGES',
  },
  vars: {
    APP_URL: requireEnv(
      env,
      'APP_URL',
      'Use http://localhost:5173 locally or your production URL.',
    ),
  },
  d1_databases: [
    {
      binding: 'DB',
      database_name: requireEnv(env, 'D1_DATABASE_NAME'),
      database_id: requireEnv(env, 'D1_DATABASE_ID'),
      migrations_dir: 'drizzle',
    },
  ],
  r2_buckets: [
    {
      binding: 'BUCKET',
      bucket_name: requireEnv(env, 'R2_BUCKET_NAME'),
    },
  ],
};

const target = path.join(process.cwd(), 'wrangler.jsonc');
fs.writeFileSync(target, `${JSON.stringify(config, null, 2)}\n`, 'utf8');

console.log(
  `Updated wrangler.jsonc from ${path.basename(envFile)} (${production ? 'production' : 'local'}).`,
);
