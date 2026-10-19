import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const EXPECTED_DISCLAIMER =
  'All sales, transactions, agreements, and other dealings of any nature in which Kav Haribis is involved, whether directly or indirectly, that may involve any actual or potential concern of Ribis (interest prohibited under Jewish law), shall be governed by and subject to the most current version of Heter Iska Bris Pinchos, including any amendments or updates thereto.';

test('Home page contains the exact Heter Iska Bris Pinchos legal disclaimer', () => {
  const homePath = path.resolve('app/page.tsx');
  const homeContent = fs.readFileSync(homePath, 'utf8');

  // Verify exact text presence
  assert.ok(
    homeContent.includes(EXPECTED_DISCLAIMER),
    'Home page must contain the exact client-provided disclaimer text without alterations.',
  );

  // Verify section order: SubscriptionForm before disclaimer, disclaimer before SiteFooter
  const subIndex = homeContent.indexOf('<SubscriptionForm');
  const discIndex = homeContent.indexOf(EXPECTED_DISCLAIMER);
  const footerIndex = homeContent.indexOf('<SiteFooter');

  assert.ok(subIndex !== -1, 'SubscriptionForm must exist on Home page');
  assert.ok(discIndex !== -1, 'Disclaimer must exist on Home page');
  assert.ok(footerIndex !== -1, 'SiteFooter must exist on Home page');
  assert.ok(
    subIndex < discIndex,
    'SubscriptionForm must precede the legal disclaimer.',
  );
  assert.ok(
    discIndex < footerIndex,
    'Legal disclaimer must precede SiteFooter.',
  );
});

test('Disclaimer is restricted to the Home page and not in shared footer or About Us', () => {
  const footerPath = path.resolve('app/shared/site-shell.tsx');
  const footerContent = fs.readFileSync(footerPath, 'utf8');
  assert.ok(
    !footerContent.includes('Heter Iska Bris Pinchos'),
    'Shared site footer should not contain the home page disclaimer.',
  );

  const aboutPath = path.resolve('app/about-us/page.tsx');
  const aboutContent = fs.readFileSync(aboutPath, 'utf8');
  assert.ok(
    !aboutContent.includes(EXPECTED_DISCLAIMER),
    'About Us page should not have received the home page disclaimer.',
  );
});
