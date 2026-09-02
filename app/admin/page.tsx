import { headers } from 'next/headers';
import { requireChatGPTUser } from '../chatgpt-auth';
import {
  ADMIN_SECTIONS,
  isOwnerEmail,
  staffPermissions
} from '../lib/admin-access';
import {
  ActivityTrendChart,
  CategoryDistributionBarChart
} from './dashboard-charts';

export const dynamic = 'force-dynamic';

async function getStats(db: any) {
  const stats = {
    submissions: 0,
    banks: 0,
    questions: 0,
    donations: 0,
  };

  
  try {
    const res = await db.prepare('SELECT COUNT(*) as count FROM contact_submissions').first();
    stats.submissions = Number(res?.count || 0);
  } catch {}

  try {
    const res = await db.prepare('SELECT COUNT(*) as count FROM banks').first();
    stats.banks = Number(res?.count || 0);
  } catch {}

  try {
    const res = await db.prepare('SELECT COUNT(*) as count FROM questions').first();
    stats.questions = Number(res?.count || 0);
  } catch {}

  try {
    const res = await db.prepare('SELECT COUNT(*) as count FROM donations').first();
    stats.donations = Number(res?.count || 0);
  } catch {}

  return stats;
}

export default async function AdminPage() {
  const user = await requireChatGPTUser('/admin'),
    requestHeaders = await headers(),
    staffEmail = String(
      requestHeaders.get('x-kh-staff-email') || '',
    ).toLowerCase(),
    actualEmail = staffEmail || user.email.toLowerCase(),
    owner = isOwnerEmail(actualEmail);

  const { env } = await import('cloudflare:workers');

  const permissions = owner
    ? ADMIN_SECTIONS.map((section) => section.key)
    : await staffPermissions(env.DB, actualEmail);

  if (!owner) {
    return (
      <main className="p-6 max-w-4xl mx-auto">
        <div className="bg-white border border-red-200 rounded-2xl p-8 text-center text-slate-800 shadow-sm">
          <div className="w-12 h-12 rounded-full bg-red-50 border border-red-200 flex items-center justify-center mx-auto mb-4 text-red-600 font-bold text-xl">
            ✕
          </div>
          <h1 className="text-xl font-semibold mb-1 text-slate-900">Unauthorized Access</h1>
          <p className="text-sm text-slate-600">
            The main dashboard overview is reserved for Admin Owners. Account <code className="text-amber-700 font-semibold">{actualEmail}</code> is not authorized to view this page.
          </p>
        </div>
      </main>
    );
  }

  const allowedSections = ADMIN_SECTIONS.filter((section) =>
    permissions.includes(section.key),
  );

  const stats = await getStats(env.DB);

  // Group sections logically into clean financial categories
  const categories = [
    {
      title: 'Analytics & Management',
      icon: '📊',
      keys: ['analytics', 'invoices', 'settings'],
    },
    {
      title: 'Financial Directories',
      icon: '🏦',
      keys: [
        'bank-research',
        'banks',
        'businesses',
        'loan-services',
        'savings',
        'investments',
      ],
    },
    {
      title: 'Halachic Services & Inquiries',
      icon: '📜',
      keys: [
        'heter-iska',
        'certification',
        'questions',
        'submissions',
        'genealogy',
      ],
    },
    {
      title: 'Publications & Education',
      icon: '📚',
      keys: [
        'articles',
        'seforim',
        'orders',
        'educational-center',
        'audio',
      ],
    },
    {
      title: 'Community & Alerts',
      icon: '📢',
      keys: [
        'alerts',
        'alert-tips',
        'alert-subscribers',
        'sponsors',
        'donations',
      ],
    },
  ];

  return (
    <div className="space-y-8 pb-12 text-slate-800 adminPage">
      {/* Clean Financial Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white border border-slate-200/90 rounded-2xl p-6 lg:p-7 shadow-xs">
        <div>
          <div className="flex items-center gap-2.5 mb-1.5">
            <span className="px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider bg-amber-50 text-amber-800 border border-amber-300 rounded-md">
              {owner ? 'Super Admin' : 'Staff Admin'}
            </span>
            <span className="text-xs text-slate-500 font-mono">
              {actualEmail}
            </span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Dashboard Overview
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Kav Haribis management portal for financial compliance, research, and halachic services.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {owner && (
            <a
              href="/admin/staff-access"
              className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg border border-slate-300 transition-colors flex items-center gap-1.5"
            >
              <span>Manage Staff</span>
            </a>
          )}
          <a
            href="/"
            target="_blank"
            rel="noreferrer"
            className="px-3.5 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-bold rounded-lg transition-colors flex items-center gap-1.5 shadow-xs"
          >
            <span>Live Site</span>
            <span>↗</span>
          </a>
        </div>
      </div>

      {/* Clean Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1 */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs hover:shadow-md transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Contact Submissions
            </span>
            <span className="w-8 h-8 rounded-lg bg-blue-50 border border-blue-200 text-blue-700 flex items-center justify-center text-sm">
              📬
            </span>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-2xl font-bold text-slate-900">
              {stats.submissions}
            </span>
            <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
              Active
            </span>
          </div>
        </div>

        {/* Card 2 */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs hover:shadow-md transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Bank Directory
            </span>
            <span className="w-8 h-8 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-700 flex items-center justify-center text-sm">
              🏦
            </span>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-2xl font-bold text-slate-900">
              {stats.banks}
            </span>
            <span className="text-[11px] font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
              Institutions
            </span>
          </div>
        </div>

        {/* Card 3 */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs hover:shadow-md transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Bais Horaah Questions
            </span>
            <span className="w-8 h-8 rounded-lg bg-amber-50 border border-amber-200 text-amber-700 flex items-center justify-center text-sm">
              ❓
            </span>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-2xl font-bold text-slate-900">
              {stats.questions}
            </span>
            <span className="text-[11px] font-semibold text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
              Inbox Queue
            </span>
          </div>
        </div>

        {/* Card 4 */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs hover:shadow-md transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Donation Records
            </span>
            <span className="w-8 h-8 rounded-lg bg-purple-50 border border-purple-200 text-purple-700 flex items-center justify-center text-sm">
              💳
            </span>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-2xl font-bold text-slate-900">
              {stats.donations}
            </span>
            <span className="text-[11px] font-semibold text-purple-700 bg-purple-50 px-2 py-0.5 rounded border border-purple-200">
              Verified
            </span>
          </div>
        </div>
      </div>

      {/* Analytics Charts & Graphs Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7">
          <ActivityTrendChart />
        </div>
        <div className="lg:col-span-5">
          <CategoryDistributionBarChart
            submissions={stats.submissions}
            banks={stats.banks}
            questions={stats.questions}
            donations={stats.donations}
          />
        </div>
      </div>

      {/* Clean Professional Service Directories */}
      <div className="space-y-8 pt-4">
        {categories.map((category) => {
          const categorySections = allowedSections.filter((sec) =>
            category.keys.includes(sec.key),
          );

          if (!categorySections.length) return null;

          return (
            <div key={category.title} className="space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b border-slate-200">
                <span className="text-lg">{category.icon}</span>
                <h2 className="text-base font-bold text-slate-900 tracking-tight">
                  {category.title}
                </h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {categorySections.map((sec) => (
                  <a
                    key={sec.key}
                    href={sec.href}
                    className="group bg-white hover:bg-slate-50 border border-slate-200/90 hover:border-slate-400 p-5 rounded-2xl transition-all duration-200 flex flex-col justify-between shadow-xs hover:shadow-md"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="text-sm font-bold text-slate-900 group-hover:text-amber-700 transition-colors">
                          {sec.title}
                        </h3>
                        <span className="text-slate-400 group-hover:text-amber-700 transition-colors text-xs font-bold">
                          ↗
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 leading-relaxed line-clamp-2">
                        {sec.description}
                      </p>
                    </div>
                  </a>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
