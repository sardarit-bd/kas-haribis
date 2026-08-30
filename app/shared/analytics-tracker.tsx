'use client';
import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
function visitorId() {
  try {
    let id = localStorage.getItem('kh_visitor_id');
    if (!id) {
      id = crypto.randomUUID();
      localStorage.setItem('kh_visitor_id', id);
    }
    return id;
  } catch {
    return 'anonymous';
  }
}
export function trackSiteEvent(
  eventType: 'page_view' | 'ad_click',
  details: Record<string, string> = {},
) {
  if (typeof window === 'undefined') return;
  fetch('/api/analytics', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      eventType,
      path: location.pathname,
      visitorId: visitorId(),
      referrer: document.referrer,
      ...details,
    }),
    keepalive: true,
  }).catch(() => {});
}
export default function AnalyticsTracker() {
  const pathname = usePathname();
  useEffect(() => {
    if (!pathname.startsWith('/admin') && !pathname.includes('preview'))
      trackSiteEvent('page_view');
  }, [pathname]);
  return null;
}
