import vinext from 'vinext';
import { defineConfig, loadEnv } from 'vite';

function workerVarsFromEnv(env: Record<string, string>) {
  const entries: Record<string, string> = {
    APP_URL: env.APP_URL || 'http://localhost:5173',
  };

  for (const key of [
    'AUTH_SECRET',
    'GOOGLE_CLIENT_ID',
    'GOOGLE_CLIENT_SECRET',
    'CARDKNOX_SETTINGS_KEY',
  ]) {
    const value = env[key]?.trim();
    if (value) entries[key] = value;
  }

  return entries;
}

export default defineConfig(async ({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');

  process.env.WRANGLER_WRITE_LOGS ??= 'false';
  process.env.WRANGLER_LOG_PATH ??= '.wrangler/logs';
  process.env.MINIFLARE_REGISTRY_PATH ??= '.wrangler/registry';

  const { cloudflare } = await import('@cloudflare/vite-plugin');

  return {
    server: {
      host: '0.0.0.0',
      allowedHosts: ['terminal.local', 'localhost', '127.0.0.1'],
    },
    plugins: [
      vinext(),
      cloudflare({
        viteEnvironment: { name: 'rsc', childEnvironments: ['ssr'] },
        inspectorPort: false,
        config: {
          vars: workerVarsFromEnv(env),
        },
      }),
    ],
  };
});
