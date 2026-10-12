import assert from 'node:assert/strict';
import test from 'node:test';

function parseAnalyticsRange(rawParam) {
  const rawRange = String(rawParam || '30').toLowerCase().trim();
  const range =
    rawRange === '14' || rawRange === '14d'
      ? '14'
      : rawRange === '30' || rawRange === '30d'
        ? '30'
        : rawRange === '90' || rawRange === '90d'
          ? '90'
          : rawRange === 'all'
            ? 'all'
            : '30';

  const daysBack =
    range === '14' ? 14
    : range === '30' ? 30
    : range === '90' ? 90
    : null;

  const now = Date.now();
  const cutoff = daysBack
    ? new Date(now - daysBack * 86400000).toISOString()
    : null;

  const where = cutoff ? `WHERE created_at >= '${cutoff}'` : '';
  const pageViewWhere = where
    ? `${where} AND event_type='page_view'`
    : "WHERE event_type='page_view'";
  const sponsorWhere = where
    ? `${where} AND event_type='ad_click'`
    : "WHERE event_type='ad_click'";

  return { range, daysBack, cutoff, where, pageViewWhere, sponsorWhere };
}

function formatTimestamp(ts) {
  if (!ts) return 'Unknown date';
  try {
    const raw = String(ts).trim();
    const normalized = raw.endsWith('Z') || raw.includes('+') ? raw : raw + 'Z';
    const date = new Date(normalized);
    if (isNaN(date.getTime())) {
      const fallback = new Date(raw);
      if (isNaN(fallback.getTime())) return 'Recent';
      return fallback.toLocaleString('en-US', { timeZone: 'America/New_York' });
    }
    return date.toLocaleString('en-US', { timeZone: 'America/New_York' });
  } catch {
    return 'Recent';
  }
}

test('analytics range parser correctly handles all ranges', () => {
  // 14 days
  const r14 = parseAnalyticsRange('14');
  assert.equal(r14.range, '14');
  assert.equal(r14.daysBack, 14);
  assert.match(r14.where, /^WHERE created_at >= '/);
  assert.match(r14.pageViewWhere, /AND event_type='page_view'$/);

  // 14d backward compatibility
  const r14d = parseAnalyticsRange('14d');
  assert.equal(r14d.range, '14');
  assert.equal(r14d.daysBack, 14);

  // 30 days
  const r30 = parseAnalyticsRange('30');
  assert.equal(r30.range, '30');
  assert.equal(r30.daysBack, 30);
  assert.match(r30.where, /^WHERE created_at >= '/);

  // 30d backward compatibility
  const r30d = parseAnalyticsRange('30d');
  assert.equal(r30d.range, '30');
  assert.equal(r30d.daysBack, 30);

  // Default when undefined
  const rDef = parseAnalyticsRange(undefined);
  assert.equal(rDef.range, '30');
  assert.equal(rDef.daysBack, 30);

  // 90 days
  const r90 = parseAnalyticsRange('90');
  assert.equal(r90.range, '90');
  assert.equal(r90.daysBack, 90);

  // 90d backward compatibility
  const r90d = parseAnalyticsRange('90d');
  assert.equal(r90d.range, '90');
  assert.equal(r90d.daysBack, 90);

  // All-time removes where cutoff
  const rAll = parseAnalyticsRange('all');
  assert.equal(rAll.range, 'all');
  assert.equal(rAll.daysBack, null);
  assert.equal(rAll.cutoff, null);
  assert.equal(rAll.where, '');
  assert.equal(rAll.pageViewWhere, "WHERE event_type='page_view'");
  assert.equal(rAll.sponsorWhere, "WHERE event_type='ad_click'");
});

test('timestamp formatting handles single and double Z safely', () => {
  const formattedWithZ = formatTimestamp('2026-10-12T11:15:00.000Z');
  assert.match(formattedWithZ, /2026/);
  assert.doesNotMatch(formattedWithZ, /Invalid Date/);

  const formattedWithoutZ = formatTimestamp('2026-10-12T11:15:00');
  assert.match(formattedWithoutZ, /2026/);
  assert.doesNotMatch(formattedWithoutZ, /Invalid Date/);

  assert.equal(formatTimestamp(null), 'Unknown date');
  assert.equal(formatTimestamp(''), 'Unknown date');
  assert.equal(formatTimestamp('invalid'), 'Recent');
});
