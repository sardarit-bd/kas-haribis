import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

test('About Us page includes the Founder Credit section with exact text and placement', () => {
  const aboutPath = path.resolve('app/about-us/page.tsx');
  const aboutContent = fs.readFileSync(aboutPath, 'utf8');

  // Verify elements presence
  assert.ok(
    aboutContent.includes('KAV HARIBIS FOUNDER'),
    'Must include uppercase label "KAV HARIBIS FOUNDER"',
  );
  assert.ok(
    aboutContent.includes('Rabbi Yaakov Yitzchaok Jacob'),
    'Must include founder name "Rabbi Yaakov Yitzchaok Jacob"',
  );
  assert.ok(
    aboutContent.includes('bg-[#c69b46]'),
    'Must include gold divider styling',
  );

  // Verify placement: after Committee Members and before BottomCTA
  const committeeIndex = aboutContent.indexOf('Committee Members');
  const founderIndex = aboutContent.indexOf('KAV HARIBIS FOUNDER');
  const bottomCtaIndex = aboutContent.indexOf('<BottomCTA');

  assert.ok(committeeIndex !== -1, 'Committee Members section must exist');
  assert.ok(founderIndex !== -1, 'Founder Credit block must exist');
  assert.ok(bottomCtaIndex !== -1, 'BottomCTA must exist');

  assert.ok(
    committeeIndex < founderIndex,
    'Founder Credit must appear after Committee Members',
  );
  assert.ok(
    founderIndex < bottomCtaIndex,
    'Founder Credit must appear before BottomCTA',
  );
});
