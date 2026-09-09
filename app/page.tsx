import CommunityImpact from './componnent/CommunityImpact';
import HeroSlider from './componnent/HeroSlider';
import OfferingsGrid from './componnent/OfferingsGrid';
import OurMission from './componnent/OurMission';
import SubscriptionForm from './ribis-alerts/subscription-form';
import FeaturedSeforim from './shared/featured-seforim';
import LandingFaq from './shared/landing-faq';
import { SiteFooter, SiteHeader } from './shared/site-shell';
import SponsorBanner from './shared/sponsor-banner';

export default function HomePage() {
  return (
    <main className="min-h-screen bg-white">
      <SiteHeader />
      <HeroSlider />
      <SponsorBanner/>
      <OurMission />
      <OfferingsGrid />
      <FeaturedSeforim />
      <CommunityImpact />
      <LandingFaq />
      <SubscriptionForm />
      <SiteFooter showHeterNotice />
    </main>
  );
}
