import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { ADMIN_OWNER, staffPermissions } from './app/lib/admin-access';
import { getUserFromCookieHeader } from './app/lib/auth';
import { ADMIN_ELEVATED_HEADER } from './app/lib/request-auth';

const apiRules: Array<[string, string]> = [
  ['/api/analytics', 'analytics'],
  ['/api/admin/invoices', 'invoices'],
  ['/api/admin/invoice-pdf', 'invoices'],
  ['/api/certification-applications', 'certification'],
  ['/api/certification-attachment', 'certification'],
  ['/api/contact-submissions', 'submissions'],
  ['/api/contact-attachment', 'submissions'],
  ['/api/bank-research', 'bank-research'],
  ['/api/bank-researchers', 'bank-research'],
  ['/api/bank-research-reviewers', 'bank-research'],
  ['/api/articles', 'articles'],
  ['/api/article-file', 'articles'],
  ['/api/admin/article-upload', 'articles'],
  ['/api/educational-resources', 'educational-center'],
  ['/api/educational-file', 'educational-center'],
  ['/api/admin/educational-upload', 'educational-center'],
  ['/api/ribbis-alerts', 'alerts'],
  ['/api/alert-tips', 'alert-tips'],
  ['/api/alert-subscriptions', 'alert-subscribers'],
  ['/api/questions', 'questions'],
  ['/api/heter-documents', 'heter-iska'],
  ['/api/admin/heter', 'heter-iska'],
  ['/api/sponsors', 'sponsors'],
  ['/api/seforim', 'seforim'],
  ['/api/admin/seforim', 'seforim'],
  ['/api/banks', 'banks'],
  ['/api/admin/bank-report-codes', 'banks'],
  ['/api/admin/bank-premium-members', 'banks'],
  ['/api/businesses', 'businesses'],
  ['/api/admin/business-logo', 'businesses'],
  ['/api/loan-services', 'loan-services'],
  ['/api/admin/loan-service-logo', 'loan-services'],
  ['/api/savings-accounts', 'savings'],
  ['/api/admin/savings-logo', 'savings'],
  ['/api/investment-opportunities', 'investments'],
  ['/api/admin/investment-logo', 'investments'],
  ['/api/audio', 'audio'],
  ['/api/admin/audio-upload', 'audio'],
  ['/api/payment-settings', 'settings'],
];

function sectionFor(pathname: string) {
  if (pathname === '/admin') return 'dashboard';
  if (
    pathname.startsWith('/admin/staff-access') ||
    pathname.startsWith('/api/admin-staff-access')
  )
    return null;
  if (pathname.startsWith('/admin/')) return pathname.split('/')[2] || null;
  return (
    apiRules.find(
      ([prefix]) => pathname === prefix || pathname.startsWith(prefix + '/'),
    )?.[1] || null
  );
}

export async function proxy(request: NextRequest) {
  const user = await getUserFromCookieHeader(request.headers.get('cookie'));
  const email = String(user?.email || '')
    .trim()
    .toLowerCase();
  if (!email || email === ADMIN_OWNER.toLowerCase()) return NextResponse.next();
  const section = sectionFor(request.nextUrl.pathname);
  if (!section) return NextResponse.next();
  const { env } = await import('cloudflare:workers');
  const permissions = await staffPermissions(env.DB, email);
  const allowed =
    section === 'dashboard'
      ? permissions.length > 0
      : permissions.includes(section);
  if (!allowed) return NextResponse.next();
  const headers = new Headers(request.headers);
  headers.set('x-kh-staff-email', email);
  headers.set(ADMIN_ELEVATED_HEADER, '1');
  return NextResponse.next({ request: { headers } });
}

export const config = { matcher: ['/admin/:path*', '/api/:path*'] };
