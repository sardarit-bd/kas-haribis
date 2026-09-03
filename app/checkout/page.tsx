import { SiteFooter, SiteHeader } from '../shared/site-shell';

import CheckoutClientPage from './checkout-client';

export const metadata = {
  title: 'Checkout | Kav Haribis Seforim Store',
  description: 'Complete your order for Kav Haribis printed books and digital PDF publications.',
};

export default function CheckoutPage() {
  return (
    <>
      <SiteHeader />
      <CheckoutClientPage />
      <SiteFooter />
    </>
  );
}
