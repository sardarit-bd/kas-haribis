import CheckoutNotice from '../shared/checkout-notice';
import { SiteFooter, SiteHeader } from '../shared/site-shell';
export default function Donate() {
  return (
    <main>
      <SiteHeader/>
      <CheckoutNotice kind="donation" amount="Custom amount" />
     <SiteFooter/>
    </main>
  );
}
