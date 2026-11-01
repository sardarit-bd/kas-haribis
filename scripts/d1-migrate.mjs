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

const childEnv = {
  ...process.env,
  CLOUDFLARE_ACCOUNT_ID: accountId,
  CI: process.env.CI || 'true',
};

if (remote && !childEnv.CLOUDFLARE_API_TOKEN?.trim()) {
  console.error(
    'CLOUDFLARE_API_TOKEN is missing. Add it as a GitHub Actions secret.',
  );
  process.exit(1);
}

function executeSql(command) {
  try {
    const output = execFileSync(
      process.execPath,
      [
        wranglerBin,
        'd1',
        'execute',
        databaseName,
        remote ? '--remote' : '--local',
        `--command=${command}`,
        '--json',
      ],
      {
        encoding: 'utf8',
        cwd: process.cwd(),
        env: childEnv,
      },
    );
    const start = output.indexOf('[');
    const end = output.lastIndexOf(']');
    if (start === -1 || end === -1 || end < start) {
      return [];
    }
    const parsed = JSON.parse(output.slice(start, end + 1));
    return parsed?.[0]?.results || [];
  } catch (err) {
    console.warn(`[d1-migrate] SQL query warning: ${err?.message || err}`);
    return [];
  }
}

console.log(
  `[d1-migrate] Preparing migration for ${databaseName} (${remote ? 'remote' : 'local'})...`,
);

// 1. Pre-migration check: inspect admin_profiles table and columns
try {
  const profileCols = executeSql("PRAGMA table_info('admin_profiles');");
  const colNames = new Set(
    profileCols.map((c) => String(c.name).toLowerCase()),
  );

  if (colNames.size > 0 && !colNames.has('require_password')) {
    console.log(
      '[d1-migrate] admin_profiles exists but lacks require_password. Adding column safely...',
    );
    executeSql(
      'ALTER TABLE admin_profiles ADD COLUMN require_password INTEGER NOT NULL DEFAULT 0;',
    );
    console.log(
      '[d1-migrate] Successfully added require_password column to admin_profiles.',
    );
  } else if (colNames.has('require_password')) {
    console.log(
      '[d1-migrate] admin_profiles.require_password column already present. Safe to proceed.',
    );
  } else {
    console.log(
      '[d1-migrate] admin_profiles table not found; will be created by migrations.',
    );
  }
} catch (preCheckError) {
  console.warn('[d1-migrate] Pre-migration check non-fatal error:', preCheckError);
}

// 2. Apply migrations with Wrangler
const args = [
  wranglerBin,
  'd1',
  'migrations',
  'apply',
  databaseName,
  remote ? '--remote' : '--local',
];

console.log('[d1-migrate] Executing wrangler d1 migrations apply...');
execFileSync(process.execPath, args, {
  stdio: 'inherit',
  cwd: process.cwd(),
  env: childEnv,
});

// 3. Post-migration verification
console.log('[d1-migrate] Verifying schema post-migration...');
try {
  const verifiedCols = executeSql("PRAGMA table_info('admin_profiles');");
  const verifiedColNames = new Set(
    verifiedCols.map((c) => String(c.name).toLowerCase()),
  );
  if (!verifiedColNames.has('require_password')) {
    throw new Error(
      'Post-migration verification failed: require_password column missing in admin_profiles!',
    );
  }

  const loginAttempts = executeSql(
    "PRAGMA table_info('admin_login_attempts');",
  );
  if (!loginAttempts || loginAttempts.length === 0) {
    throw new Error(
      'Post-migration verification failed: admin_login_attempts table missing!',
    );
  }

  console.log(
    '[d1-migrate] Verified: admin_profiles (with require_password) and admin_login_attempts are present.',
  );
} catch (verifyError) {
  console.error('[d1-migrate] Post-migration verification error:', verifyError);
  throw verifyError;
}

