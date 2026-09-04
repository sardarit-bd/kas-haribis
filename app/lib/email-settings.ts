type RuntimeEnv = Record<string, any>;

async function runtime(): Promise<RuntimeEnv> {
  const { env } = await import('cloudflare:workers');
  return env as unknown as RuntimeEnv;
}

function fromBase64(value: string) {
  return Uint8Array.from(atob(value), (character) => character.charCodeAt(0));
}

async function decrypt(value: string, secret: string) {
  const [ivText, encryptedText] = value.split('.');
  if (!ivText || !encryptedText)
    throw new Error('Invalid encrypted setting');
  const keyBuffer = await crypto.subtle.digest(
    'SHA-256',
    new TextEncoder().encode(secret),
  );
  const key = await crypto.subtle.importKey(
    'raw',
    keyBuffer,
    'AES-GCM',
    false,
    ['decrypt'],
  );
  const result = await crypto.subtle.decrypt(
    { name: 'AES-GCM', iv: fromBase64(ivText) },
    key,
    fromBase64(encryptedText),
  );
  return new TextDecoder().decode(result);
}

export async function getEmailSettings() {
  try {
    const env = await runtime();
    let user = '';
    let pass = '';
    const secret = env?.CARDKNOX_SETTINGS_KEY || 'kav-haribis-email-secret-key';
    if (env?.DB) {
      await env.DB.prepare(
        'CREATE TABLE IF NOT EXISTS email_settings (name TEXT PRIMARY KEY, value TEXT NOT NULL, updated_at TEXT NOT NULL)',
      ).run();
      const result = await env.DB.prepare(
        "SELECT name,value FROM email_settings WHERE name IN ('emailUser','emailPassword')",
      ).all();
      for (const row of result.results as Array<{ name: string; value: string }>) {
        try {
          const dec = await decrypt(row.value, secret);
          if (row.name === 'emailUser') user = dec;
          if (row.name === 'emailPassword') pass = dec;
        } catch {}
      }
    }
    return { user, pass };
  } catch {
    return { user: '', pass: '' };
  }
}
