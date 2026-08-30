import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { loadEnvFile, requireEnv } from './load-env.mjs';

const remote = process.argv.includes('--remote');
const { env } = loadEnvFile({ production: remote });
const databaseName = requireEnv(env, 'D1_DATABASE_NAME');

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

execFileSync(process.execPath, args, { stdio: 'inherit', cwd: process.cwd() });
