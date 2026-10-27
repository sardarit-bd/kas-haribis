import { getPaymentSettings } from '../../lib/payment-settings';
import { getSeforimDeliveryPrice } from '../../lib/seforim';

export async function GET() {
  let deliveryPrice = 0;
  let ready = false;
  let ifieldsKey = '';

  try {
    const { env } = await import('cloudflare:workers');
    deliveryPrice = await getSeforimDeliveryPrice(env?.DB);
  } catch {}

  try {
    const settings = await getPaymentSettings();
    ready = Boolean(settings.apiKey && settings.ifieldsKey);
    ifieldsKey = settings.ifieldsKey;
  } catch {}

  return Response.json({
    ready,
    ifieldsKey,
    deliveryPrice,
  });
}

