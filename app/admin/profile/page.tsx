import ProductBreadcrumb from '../../componnent/ProductBreadcrumb';
import { requireChatGPTUser } from '../../chatgpt-auth';
import { isOwnerEmail, getStaffMemberName } from '../../lib/admin-access';
import { getAdminProfileName } from '../../lib/admin-profile';
import ProfileNameEditor from './profile-name-editor';

export const dynamic = 'force-dynamic';

const breadcrumbs = [
  { label: 'Dashboard', href: '/admin' },
  { label: 'Account Settings', href: '/admin/profile' },
];

export default async function AdminProfilePage() {
  const user = await requireChatGPTUser('/admin/profile');
  const userEmail = (user.email || '').trim().toLowerCase();
  const isOwner = isOwnerEmail(userEmail);

  let profileName = '';
  let staffName = '';
  if (userEmail) {
    try {
      const { env } = await import('cloudflare:workers');
      // 1. Saved admin profile name takes highest precedence
      profileName = await getAdminProfileName(env.DB, userEmail);

      // 2. If not found and not an owner, check staff table
      if (!profileName && !isOwner) {
        staffName = await getStaffMemberName(env.DB, userEmail);
      }
    } catch {}
  }

  // Determine if a real personal/staff name exists vs. defaulting to email/fallback
  const candidateName = (profileName || staffName || user.fullName || user.name || '').trim();
  const hasCustomName =
    Boolean(candidateName) &&
    candidateName.toLowerCase() !== userEmail &&
    candidateName.toLowerCase() !== 'user';
  const resolvedDisplayName = hasCustomName ? candidateName : '';

  const role = isOwner ? 'Administrator' : 'Staff';

  // Compute initials for display avatar
  const avatarInitials = (hasCustomName ? candidateName : userEmail)
    .split(/[\s@._-]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() || '')
    .join('') || 'A';

  return (
    <main className="adminPage">
      <div className="adminShell">
        <ProductBreadcrumb breadcrumbs={breadcrumbs} backbtn={true} />

        <div className="adminHeading">
          <div>
            <h1>Account Settings</h1>
            <p>Manage your display identity and view administrative session details.</p>
          </div>
        </div>

        <div className="max-w-3xl space-y-6">
          {/* Identity Card */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-xs">
            <div className="flex items-center gap-4 pb-6 border-b border-slate-100">
              <div
                className="w-14 h-14 rounded-full bg-amber-100 border border-amber-300 text-amber-900 flex items-center justify-center font-bold text-lg shadow-xs shrink-0 select-none"
                aria-hidden="true"
              >
                {avatarInitials}
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-900 font-serif">
                  {hasCustomName ? candidateName : userEmail}
                </h2>
                <div className="mt-1 flex items-center gap-2">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-200">
                    {role}
                  </span>
                  <span className="text-xs text-slate-500">
                    Authenticated session
                  </span>
                </div>
              </div>
            </div>

            <dl className="divide-y divide-slate-100 text-sm">
              <div className="py-4 grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-4 items-center">
                <dt className="font-semibold text-slate-600">Display Name</dt>
                <dd className="sm:col-span-2 text-slate-900">
                  <ProfileNameEditor initialName={resolvedDisplayName} />
                </dd>
              </div>

              <div className="py-4 grid grid-cols-1 sm:grid-cols-3 gap-1 sm:gap-4">
                <dt className="font-semibold text-slate-600">Email Address</dt>
                <dd className="sm:col-span-2 font-mono text-slate-900 break-all">
                  {user.email}
                </dd>
              </div>

              <div className="py-4 grid grid-cols-1 sm:grid-cols-3 gap-1 sm:gap-4">
                <dt className="font-semibold text-slate-600">Access Role</dt>
                <dd className="sm:col-span-2 text-slate-900 flex flex-wrap items-center gap-2">
                  <span className="font-semibold text-slate-900">{role}</span>
                  <span className="text-xs text-slate-500">
                    {isOwner
                      ? '— Full administrative owner access'
                      : '— Assigned staff access permissions'}
                  </span>
                </dd>
              </div>

              <div className="py-4 grid grid-cols-1 sm:grid-cols-3 gap-1 sm:gap-4">
                <dt className="font-semibold text-slate-600">Session Status</dt>
                <dd className="sm:col-span-2 text-slate-900 flex items-center gap-2">
                  <span
                    className="inline-block w-2 h-2 rounded-full bg-emerald-500"
                    aria-hidden="true"
                  />
                  <span className="font-medium text-emerald-700">Active</span>
                </dd>
              </div>
            </dl>
          </div>

          {/* Security & Access Notice */}
          <div className="rounded-xl border border-slate-200 bg-slate-100/70 p-4 text-xs leading-relaxed text-slate-700 flex items-start gap-3">
            <div
              className="w-5 h-5 rounded-full bg-slate-200 text-slate-600 flex items-center justify-center shrink-0 font-bold text-xs mt-0.5 select-none"
              aria-hidden="true"
            >
              i
            </div>
            <div>
              <strong className="font-semibold text-slate-900 block mb-0.5">
                Display Identity Management
              </strong>
              <span>
                Your display name is saved to your administrator profile and updates your header badge immediately. Email address and security credentials remain strictly managed by server access controls.
              </span>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
