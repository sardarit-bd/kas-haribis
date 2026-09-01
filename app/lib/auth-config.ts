type AuthEnv = {
  AUTH_SECRET?: string;
  GOOGLE_CLIENT_ID?: string;
  GOOGLE_CLIENT_SECRET?: string;
  APP_URL?: string;
};

export async function getAuthEnv(): Promise<Required<AuthEnv>> {
  const { env } = await import('cloudflare:workers');
  const runtimeEnv = (env || {}) as AuthEnv;
  const authSecret = String(
    runtimeEnv.AUTH_SECRET || process.env.AUTH_SECRET || '',
  ).trim();
  const googleClientId = String(
    runtimeEnv.GOOGLE_CLIENT_ID || process.env.GOOGLE_CLIENT_ID || '',
  ).trim();
  const googleClientSecret = String(
    runtimeEnv.GOOGLE_CLIENT_SECRET || process.env.GOOGLE_CLIENT_SECRET || '',
  ).trim();
  const appUrl = String(
    runtimeEnv.APP_URL || process.env.APP_URL || 'http://localhost:5173',
  )
    .trim()
    .replace(/\/+$/g, '');

  return {
    AUTH_SECRET: authSecret,
    GOOGLE_CLIENT_ID: googleClientId,
    GOOGLE_CLIENT_SECRET: googleClientSecret,
    APP_URL: appUrl,
  };
}

export function assertAuthConfigured(config: Required<AuthEnv>) {
  if (!config.AUTH_SECRET) {
    throw new Error(
      'AUTH_SECRET is not configured. Copy `.env.local.example` to `.env.local` for development, or `.env.production.example` to `.env.production` and run `npm run deploy:secrets` before production deploy.',
    );
  }
  if (!config.GOOGLE_CLIENT_ID || !config.GOOGLE_CLIENT_SECRET) {
    throw new Error(
      'Google OAuth is not configured. Set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET in `.env.local` (dev) or `.env.production` (prod).',
    );
  }
}
