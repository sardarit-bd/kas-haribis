import { getSeforimDeliveryPrice } from '../lib/seforim';
import { SiteFooter, SiteHeader } from '../shared/site-shell';

import CheckoutClientPage from './checkout-client';

export const metadata = {
  title: 'Checkout | Kav Haribis Seforim Store',
  description: 'Complete your order for Kav Haribis printed books and digital PDF publications.',
};

export const dynamic = 'force-dynamic';

export default async function CheckoutPage() {
  let deliveryPrice = 0;
  try {
    const { env } = await import('cloudflare:workers');
    deliveryPrice = await getSeforimDeliveryPrice(env?.DB);
  } catch {}

  return (
    <>
      <SiteHeader />
      <CheckoutClientPage initialDeliveryPrice={deliveryPrice} />
      <SiteFooter />
    </>
  );
}

