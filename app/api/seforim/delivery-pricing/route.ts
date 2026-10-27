import { canAccessSection } from '../../../lib/admin-access';
import { getRequestEmail, isOwnerRequest } from '../../../lib/request-auth';
import {
  getSeforimDeliveryPrice,
  setSeforimDeliveryPrice,
  validateDeliveryPrice,
} from '../../../lib/seforim';

async function runtime() {
  const { env } = await import('cloudflare:workers');
  return env;
}

export async function GET() {
  try {
    const env = await runtime();
    const deliveryPrice = await getSeforimDeliveryPrice(env?.DB);
    return Response.json({ deliveryPrice });
  } catch {
    return Response.json({ deliveryPrice: 0 });
  }
}

export async function POST(request: Request) {
  const env = await runtime();
  const email = await getRequestEmail(request);
  const isOwner = await isOwnerRequest(request);
  const canSeforim =
    Boolean(email) && (await canAccessSection(env?.DB, email, 'seforim'));
  const canSettings =
    Boolean(email) && (await canAccessSection(env?.DB, email, 'settings'));

  if (!isOwner && !canSeforim && !canSettings) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = (await request.json().catch(() => ({}))) as any;
    const validation = validateDeliveryPrice(body?.deliveryPrice);
    if (!validation.valid) {
      return Response.json({ error: validation.error }, { status: 400 });
    }

    const savedPrice = await setSeforimDeliveryPrice(
      env.DB,
      validation.price,
    );
    return Response.json({ saved: true, deliveryPrice: savedPrice });
  } catch (error) {
    return Response.json(
      {
        error:
          error instanceof Error
            ? error.message
            : 'Could not save delivery price.',
      },
      { status: 500 },
    );
  }
}

export async function PUT(request: Request) {
  return POST(request);
}
