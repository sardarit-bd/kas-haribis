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
  name: production
    ? requireEnv(env, 'WORKER_NAME', 'Example: kav-haribis-site')
    : (env.WORKER_NAME?.trim() || 'kav-haribis-site'),
  ...(production
    ? { account_id: requireEnv(env, 'CLOUDFLARE_ACCOUNT_ID') }
    : env.CLOUDFLARE_ACCOUNT_ID?.trim()
      ? { account_id: env.CLOUDFLARE_ACCOUNT_ID.trim() }
      : {}),
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
    APP_URL: production
      ? requireEnv(
          env,
          'APP_URL',
          'Use http://localhost:5173 locally or your production URL.',
        )
      : (env.APP_URL?.trim() || 'http://localhost:5173'),
  },
  d1_databases: [
    {
      binding: 'DB',
      database_name: production
        ? requireEnv(env, 'D1_DATABASE_NAME')
        : (env.D1_DATABASE_NAME?.trim() || 'kav_haribis_db'),
      database_id: production
        ? requireEnv(env, 'D1_DATABASE_ID')
        : (env.D1_DATABASE_ID?.trim() || 'local'),
      migrations_dir: 'drizzle',
    },
  ],
  r2_buckets: [
    {
      binding: 'BUCKET',
      bucket_name: production
        ? requireEnv(env, 'R2_BUCKET_NAME')
        : (env.R2_BUCKET_NAME?.trim() || 'kav-haribis-files'),
    },
  ],
};

const target = path.join(process.cwd(), 'wrangler.jsonc');
fs.writeFileSync(target, `${JSON.stringify(config, null, 2)}\n`, 'utf8');

console.log(
  `Updated wrangler.jsonc from ${path.basename(envFile)} (${production ? 'production' : 'local'}).`,
);
