import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { loadEnvFile, requireEnv } from './load-env.mjs';

const remote = process.argv.includes('--remote');
const { env } = loadEnvFile({ production: remote });
const databaseName = requireEnv(env, 'D1_DATABASE_NAME');
const accountId = requireEnv(env, 'CLOUDFLARE_ACCOUNT_ID');

const wranglerBin = path.join(
  process.cwd(),
  'node_modules',
  'wrangler',
  'bin',
  'wrangler.js',
);

const args = [
  wranglerBin,
  'd1',
  'migrations',
  'apply',
  databaseName,
  remote ? '--remote' : '--local',
];

const childEnv = {
  ...process.env,
  CLOUDFLARE_ACCOUNT_ID: accountId,
};

if (!childEnv.CLOUDFLARE_API_TOKEN?.trim()) {
  console.error(
    'CLOUDFLARE_API_TOKEN is missing. Add it as a GitHub Actions secret.',
  );
  process.exit(1);
}

execFileSync(process.execPath, args, {
  stdio: 'inherit',
  cwd: process.cwd(),
  env: childEnv,
});
