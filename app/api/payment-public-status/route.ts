import { getPaymentSettings } from '../../lib/payment-settings';

export async function GET() {
  try {
    const settings = await getPaymentSettings();
    return Response.json({
      ready: Boolean(settings.apiKey && settings.ifieldsKey),
      ifieldsKey: settings.ifieldsKey,
    });
  } catch {
    return Response.json({ ready: false, ifieldsKey: '' });
  }
}
