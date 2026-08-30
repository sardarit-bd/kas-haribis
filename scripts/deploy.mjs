import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const projectPath = process.cwd();

function windowsShortPath(longPath) {
  const quoted = `"${longPath.replace(/"/g, '""')}"`;
  const result = spawnSync(process.env.ComSpec || 'cmd.exe', [
    '/d',
    '/s',
    '/c',
    `for %I in (${quoted}) do @echo %~sI`,
  ], {
    encoding: 'utf8',
    shell: false,
  });

  const shortPath = result.stdout?.trim();
  if (result.status === 0 && shortPath && fs.existsSync(shortPath)) {
    return shortPath;
  }

  return longPath;
}

function resolveDeployCwd() {
  if (process.platform !== 'win32' || !/\s/.test(projectPath)) {
    return projectPath;
  }

  const shortPath = windowsShortPath(projectPath);
  if (shortPath !== projectPath) {
    console.log('Original path:');
    console.log(`  ${projectPath}`);
    console.log('\nUsing Windows short path:');
    console.log(`  ${shortPath}\n`);
  }

  return shortPath;
}

function run(command, args, cwd) {
  const result = spawnSync(command, args, {
    cwd,
    stdio: 'inherit',
    shell: false,
    env: process.env,
  });

  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
}

const deployCwd = resolveDeployCwd();

console.log('Building for production...\n');

const vinextCli = path.join(deployCwd, 'node_modules', 'vinext', 'dist', 'cli.js');
run(process.execPath, [vinextCli, 'build'], deployCwd);

console.log('\nDeploying to production...\n');

const wranglerJs = path.join(deployCwd, 'node_modules', 'wrangler', 'bin', 'wrangler.js');
run(process.execPath, [wranglerJs, 'deploy'], deployCwd);

console.log('\nSyncing Cloudflare secrets...\n');
run(process.execPath, ['scripts/push-wrangler-secrets.mjs'], projectPath);
