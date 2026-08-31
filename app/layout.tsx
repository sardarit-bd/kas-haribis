import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './about-modern.css';
import './admin-empty-message.css';
import './alerts.css';
import './article-fixes.css';
import './article-pdf-viewer.css';
import './audio-modern.css';
import './bank-directory-hero.css';
import './bank-directory-views.css';
import './bank-introduction.css';
import './bank-research-prompt.css';
import './bank-research.css';
import './certification-admin.css';
import './certification.css';
import './certified-lender.css';
import './common-questions.css';
import './contact-hub.css';
import './donation-receipts.css';
import './featured-alert-control.css';
import './genealogy-services.css';
import './globals.css';
import './heter-advisory.css';
import './home-modern.css';
import './home-services-modern.css';
import './homepage-box-preview-expanded.css';
import './homepage-box-preview-groups.css';
import './homepage-box-preview-moving.css';
import './homepage-box-preview-vertical.css';
import './homepage-box-preview.css';
import './homepage-preview-life.css';
import './homepage-preview-mission.css';
import './homepage-preview-offerings.css';
import './homepage-preview-pictures.css';
import './homepage-preview.css';
import './investments.css';
import './invoices.css';
import './membership-account.css';
import './modern-alerts.css';
import './programs-impact.css';
import './quick-actions-preview.css';
import './rav-roth-quote.css';
import './reading-circle.css';
import './receipt-download.css';
import './savings.css';
import './seforim-admin-pdf.css';
import './seforim-cart.css';
import './seforim-digital.css';
import './seforim-format-choice.css';
import './service-rotator.css';
import './submissions.css';
import './tip-submissions.css';
// import SponsorBanner from './shared/sponsor-banner';
import './analytics-admin.css';
import './analytics-daily.css';
import AnalyticsTracker from './shared/analytics-tracker';
import ArticlePdfLinks from './shared/article-pdf-links';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Kav Haribis | Hilchos Ribbis Resources',
  description:
    'Torah education, practical guidance and communal resources for Hilchos Ribbis.',
  other: {
    'codex-preview': 'development',
  },
  icons: {
    icon: '/favicon.svg',
    shortcut: '/favicon.svg',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={inter.variable}>
      <body className={`${inter.className} antialiased`}>
        {/* <SponsorBanner /> */}
        <AnalyticsTracker />
        <ArticlePdfLinks />
        {children}
      </body>
    </html>
  );
}

