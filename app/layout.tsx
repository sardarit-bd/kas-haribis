import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import './article-fixes.css';
import './article-pdf-viewer.css';
import './about-modern.css';
import './seforim-digital.css';
import './seforim-cart.css';
import './seforim-admin-pdf.css';
import './admin-empty-message.css';
import './seforim-format-choice.css';
import './savings.css';
import './investments.css';
import './alerts.css';
import './tip-submissions.css';
import './modern-alerts.css';
import './featured-alert-control.css';
import './audio-modern.css';
import './submissions.css';
import './contact-hub.css';
import './bank-research.css';
import './bank-research-prompt.css';
import './bank-introduction.css';
import './rav-roth-quote.css';
import './bank-directory-hero.css';
import './bank-directory-views.css';
import './home-modern.css';
import './home-services-modern.css';
import './service-rotator.css';
import './invoices.css';
import './donation-receipts.css';
import './receipt-download.css';
import './homepage-preview.css';
import './homepage-preview-offerings.css';
import './homepage-preview-life.css';
import './homepage-preview-pictures.css';
import './homepage-box-preview.css';
import './homepage-box-preview-expanded.css';
import './homepage-box-preview-moving.css';
import './homepage-box-preview-vertical.css';
import './homepage-box-preview-groups.css';
import './homepage-preview-mission.css';
import './quick-actions-preview.css';
import './certification.css';
import './certified-lender.css';
import './common-questions.css';
import './certification-admin.css';
import './genealogy-services.css';
import './reading-circle.css';
import './membership-account.css';
import './programs-impact.css';
import './heter-advisory.css';
import SponsorBanner from './shared/sponsor-banner';
import AnalyticsTracker from './shared/analytics-tracker';
import ArticlePdfLinks from './shared/article-pdf-links';
import './analytics-admin.css';
import './analytics-daily.css';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
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
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <SponsorBanner />
        <AnalyticsTracker />
        <ArticlePdfLinks />
        {children}
      </body>
    </html>
  );
}
