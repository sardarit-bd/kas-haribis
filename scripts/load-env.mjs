import fs from 'node:fs';
import path from 'node:path';
import { parseEnv } from 'node:util';

const root = process.cwd();

export function resolveEnvFile({ production = false } = {}) {
  if (production) {
    return path.join(root, '.env.production');
  }
  return path.join(root, '.env.local');
}

export function loadEnvFile({ production = false } = {}) {
  const envFile = resolveEnvFile({ production });
  if (!fs.existsSync(envFile)) {
    throw new Error(
      `Missing ${path.basename(envFile)}. Copy env.example to ${path.basename(envFile)} and fill in your values.`,
    );
  }

  const parsed = parseEnv(fs.readFileSync(envFile, 'utf8'));
  const env = Object.fromEntries(
    Object.entries(parsed).map(([key, value]) => [key, String(value).trim()]),
  );

  for (const [key, value] of Object.entries(env)) {
    if (value && process.env[key] === undefined) {
      process.env[key] = value;
    }
  }

  return { env, envFile };
}

export function requireEnv(env, key, hint) {
  const value = env[key]?.trim();
  if (!value) {
    throw new Error(`Missing ${key} in env file.${hint ? ` ${hint}` : ''}`);
  }
  return value;
}
