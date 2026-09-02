type RuntimeEnv = Record<string, any>;

async function runtime(): Promise<RuntimeEnv> {
  const { env } = await import('cloudflare:workers');
  return env as unknown as RuntimeEnv;
}

function fromHex(hex: string) {
  return Uint8Array.from(hex.match(/.{2}/g) || [], (value) =>
    parseInt(value, 16),
  );
}

function fromBase64(value: string) {
  return Uint8Array.from(atob(value), (character) => character.charCodeAt(0));
}

async function decrypt(value: string, secret: string) {
  const [ivText, encryptedText] = value.split('.');
  if (!ivText || !encryptedText)
    throw new Error('Invalid encrypted payment setting');
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

export async function getPaymentSettings() {
  const env = await runtime();
  if (!env.CARDKNOX_SETTINGS_KEY)
    throw new Error('Payment encryption is unavailable');
  await env.DB.prepare(
    'CREATE TABLE IF NOT EXISTS payment_settings (name TEXT PRIMARY KEY, value TEXT NOT NULL, updated_at TEXT NOT NULL)',
  ).run();
  const result = await env.DB.prepare(
    "SELECT name,value FROM payment_settings WHERE name IN ('apiKey','ifieldsKey','ifieldsToken')",
  ).all();
  const settings: Record<string, string> = {};
  for (const row of result.results as Array<{ name: string; value: string }>) {
    try {
      settings[row.name] = await decrypt(row.value, env.CARDKNOX_SETTINGS_KEY);
    } catch {
      settings[row.name] = '';
    }
  }
  return {
    env,
    apiKey: settings.apiKey || '',
    ifieldsKey: settings.ifieldsKey || '',
    ifieldsToken: settings.ifieldsToken || '',
  };
}
