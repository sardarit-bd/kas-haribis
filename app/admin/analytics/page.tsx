import { requireChatGPTUser } from '../../chatgpt-auth';
import ProductBreadcrumb from '../../componnent/ProductBreadcrumb';
import { canAccessSection } from "../../lib/admin-access";
import { ensureAnalytics } from '../../lib/analytics';
export const dynamic = 'force-dynamic';
const label = (p: string) =>
  p === '/'
    ? 'Home'
    : p === '/bank-directory'
      ? 'Bank Directory'
      : p === '/audio'
        ? 'Shiurim & Audio'
        : p === '/bais-horaah'
          ? 'Ask Bais Horaah'
          : p === '/heter-iska'
            ? 'Heter Iska'
            : p === '/ribis-alerts'
              ? 'Ribbis Alerts'
              : p;
const ranges: Record<string, string> = {
  '14': '-13 days',
  '30': '-29 days',
  '90': '-89 days',
  all: '',
};
const breadcrumbs = [
  { label: 'Dashboard', href: '/admin' },
  { label: 'Visitor Analytics', href: '/admin/analytics' },
];
export default async function AnalyticsAdmin({
  searchParams,
}: {
  searchParams: Promise<{ range?: string }>;
}) {
  const { env } = await import('cloudflare:workers');
  const u = await requireChatGPTUser('/admin/analytics');
  if (!(await canAccessSection(env.DB, u.email, 'analytics')))
    return (
      <main className="adminPage">
        <div className="adminShell">
          <h1>Not authorized</h1>
        </div>
      </main>
    );
  await ensureAnalytics(env.DB);
  const params = await searchParams,
    daysBack = params.range === '30d' ? 30 : params.range === '90d' ? 90 : 7,
    cutoff = new Date(Date.now() - daysBack * 86400000).toISOString(),
    where = `WHERE created_at >= '${cutoff}'`,
    daily = `SELECT strftime('%Y-%m-%d',created_at) day,COUNT(*) views,COUNT(DISTINCT visitor_id) visitors FROM site_analytics`;
  const [t, p, a, d, r, h] = await Promise.all([
    env.DB.prepare(
      `SELECT COUNT(*) views,COUNT(DISTINCT visitor_id) visitors FROM site_analytics ${where}`,
    ).first(),
    env.DB.prepare(
      `SELECT path,COUNT(*) views FROM site_analytics ${where} AND event_type='pageview' GROUP BY path ORDER BY views DESC LIMIT 15`,
    ).all(),
    env.DB.prepare(
      `SELECT COALESCE(NULLIF(item_name,''),'Unknown sponsor') sponsor,COUNT(*) clicks,COUNT(DISTINCT visitor_id) visitors FROM site_analytics WHERE event_type='ad_click' GROUP BY sponsor ORDER BY clicks DESC LIMIT 20`,
    ).all(),
    env.DB.prepare(`${daily} ${where} GROUP BY day ORDER BY day`).all(),
    env.DB.prepare(
      `SELECT event_type,path,item_name,created_at FROM site_analytics ORDER BY id DESC LIMIT 30`,
    ).all(),
    env.DB.prepare(`${daily} GROUP BY day ORDER BY day DESC`).all(),
  ]);
  const total = t as any,
    days = d.results as any[],
    history = h.results as any[],
    max = Math.max(1, ...days.map((x) => Number(x.views)));
  const range = (await searchParams).range || '30';
  return (
    <main className="adminPage analyticsAdmin">
      <div className="adminShell">
        <ProductBreadcrumb breadcrumbs={breadcrumbs} backbtn={true} />
        <div className="adminHeading">
          <div>
            <h1>Visitor analytics</h1>
            <p>Anonymous page views and sponsor-advertisement engagement.</p>
          </div>
          <span className="analyticsLive">● Tracking active</span>
        </div>
        <section className="analyticsStats">
          <article>
            <small>TOTAL PAGE VIEWS</small>
            <b>{total?.views || 0}</b>
          </article>
          <article>
            <small>APPROX. UNIQUE VISITORS</small>
            <b>{total?.visitors || 0}</b>
          </article>
          <article>
            <small>VISITORS — LAST 24 HOURS</small>
            <b>{total?.visitors_today || 0}</b>
          </article>
          <article>
            <small>AD DETAIL CLICKS</small>
            <b>{total?.ad_clicks || 0}</b>
          </article>
        </section>
        <section className="analyticsChart">
          <div className="analyticsChartHead">
            <div>
              <p className="eyebrow gold">DAILY TRAFFIC</p>
              <h2>
                {range === 'all' ? 'All recorded days' : `Last ${range} days`}
              </h2>
            </div>
            <nav>
              {Object.keys(ranges).map((x) => (
                <a
                  className={x === range ? 'active' : ''}
                  href={`/admin/analytics?range=${x}`}
                  key={x}
                >
                  {x === 'all' ? 'All time' : `${x} days`}
                </a>
              ))}
            </nav>
          </div>
          <div className="analyticsBars">
            {days.length ? (
              days.map((x) => (
                <span key={x.day}>
                  <i
                    style={{
                      height: `${Math.max(8, (Number(x.views) / max) * 100)}%`,
                    }}
                    title={`${x.views} views · ${x.visitors} visitors · ${x.clicks} ad clicks`}
                  ></i>
                  <b>{x.views}</b>
                  <small>{String(x.day).slice(5)}</small>
                </span>
              ))
            ) : (
              <p>New visits will begin appearing here.</p>
            )}
          </div>
        </section>
        <section className="dailyHistory">
          <div>
            <p className="eyebrow gold">PERMANENT DAILY RECORD</p>
            <h2>Traffic by calendar day</h2>
            <p>Every recorded day remains listed here.</p>
          </div>
          <div className="dailyHistoryTable">
            <header>
              <b>Date</b>
              <b>Page views</b>
              <b>Visitors</b>
              <b>Ad clicks</b>
            </header>
            {history.length ? (
              history.map((x) => (
                <div key={x.day}>
                  <strong>
                    {new Date(x.day + 'T12:00:00').toLocaleDateString('en-US', {
                      month: 'long',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </strong>
                  <span>{x.views}</span>
                  <span>{x.visitors}</span>
                  <span>{x.clicks}</span>
                </div>
              ))
            ) : (
              <p>No traffic has been recorded yet.</p>
            )}
          </div>
        </section>
        <div className="analyticsColumns">
          <section>
            <h2>Most-viewed pages</h2>
            <div className="analyticsTable">
              {(p.results as any[]).map((x, i) => (
                <div key={x.path}>
                  <span>
                    <i>{i + 1}</i>
                    <b>{label(x.path)}</b>
                    <small>{x.path}</small>
                  </span>
                  <strong>
                    {x.views}
                    <small> views</small>
                  </strong>
                  <em>{x.visitors} visitors</em>
                </div>
              ))}
            </div>
          </section>
          <section>
            <h2>Sponsor engagement</h2>
            <div className="analyticsTable">
              {(a.results as any[]).length ? (
                (a.results as any[]).map((x, i) => (
                  <div key={x.sponsor}>
                    <span>
                      <i>{i + 1}</i>
                      <b>{x.sponsor}</b>
                      <small>Advertisement details opened</small>
                    </span>
                    <strong>
                      {x.clicks}
                      <small> clicks</small>
                    </strong>
                    <em>{x.visitors} visitors</em>
                  </div>
                ))
              ) : (
                <div className="analyticsEmpty">
                  Advertisement clicks will appear here.
                </div>
              )}
            </div>
          </section>
        </div>
        <section className="analyticsRecent">
          <h2>Recent activity</h2>
          {(r.results as any[]).map((x, i) => (
            <div key={i}>
              <span className={x.event_type}>
                {x.event_type === 'ad_click' ? 'AD CLICK' : 'PAGE VIEW'}
              </span>
              <b>
                {x.event_type === 'ad_click'
                  ? x.item_name || 'Sponsor'
                  : label(x.path)}
              </b>
              <small>
                {new Date(x.created_at + 'Z').toLocaleString('en-US', {
                  timeZone: 'America/New_York',
                })}
              </small>
            </div>
          ))}
        </section>
        <p className="analyticsPrivacy">
          Privacy: visitor counts use a random identifier stored in the
          visitor’s browser. This dashboard does not record card information,
          form contents, names, email addresses, or precise location.
        </p>
      </div>
    </main>
  );
}
