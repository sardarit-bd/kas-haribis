import { getCurrentUser, signOutPath } from '../lib/auth';
import { ADMIN_OWNER } from '../lib/admin-access';

export default async function AdminNav() {
  const user = await getCurrentUser();
  const logoutHref = signOutPath('/sign-in');

  const userName = user?.displayName || user?.fullName || 'Admin User';
  const userEmail = user?.email || '';
  const isOwner = userEmail.toLowerCase() === ADMIN_OWNER.toLowerCase();
  const role = isOwner ? 'Super Admin' : 'Administrator';

  // Extract initials for avatar (e.g. "Md Emon Hossen" -> "ME")
  const initials =
    userName
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((n) => n[0].toUpperCase())
      .join('') || 'A';

  return (
    <header className="w-full bg-white border-b border-slate-200 text-slate-800 px-4 lg:px-6 py-3 flex items-center justify-between sticky top-0 z-30 shadow-xs">
      {/* Brand Logo */}
      <a className="flex items-center gap-3 group" href="/admin">
        <span className="w-10 h-10 border-2 border-amber-600 rounded-full flex items-center justify-center text-amber-700 font-serif font-bold text-base bg-amber-50 group-hover:bg-amber-100 transition-colors">
          KH
        </span>
        <span className="flex flex-col">
          <b className="text-lg font-serif text-slate-900 leading-tight group-hover:text-amber-700 transition-colors">
            Kav Haribis
          </b>
          <small className="text-xs text-amber-800 leading-tight font-sans tracking-wide font-medium">
            Financial & Halachic Administration
          </small>
        </span>
      </a>

      {/* Right Side: View Site + Logged-in User Profile Header */}
      <div className="flex items-center gap-4 lg:gap-6">
        <a
          className="hidden sm:flex items-center gap-1.5 text-xs font-semibold text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-lg border border-slate-300 transition-colors"
          href="/"
        >
          <span>View site</span>
          <span className="text-amber-600 font-bold">↗</span>
        </a>

        {/* User Profile Card */}
        <div className="relative group pl-4 border-l border-slate-200">
          <button
            type="button"
            className="flex items-center gap-3 text-left cursor-pointer"
            aria-haspopup="true"
            aria-label="Account menu"
          >
            <div className="w-9 h-9 rounded-full bg-amber-100 border border-amber-300 text-amber-900 flex items-center justify-center font-bold text-xs shadow-xs">
              {initials}
            </div>
            <div className="hidden sm:flex flex-col text-left">
              <span className="text-sm font-semibold text-slate-900 leading-snug">
                {userName}
              </span>
              <span className="text-[11px] font-bold text-amber-700 leading-none">
                {role}
              </span>
            </div>
          </button>

          <div className="absolute right-0 top-full z-50 pt-2 opacity-0 invisible pointer-events-none transition-all duration-150 group-hover:opacity-100 group-hover:visible group-hover:pointer-events-auto group-focus-within:opacity-100 group-focus-within:visible group-focus-within:pointer-events-auto">
            <div className="w-56 rounded-xl border border-slate-200 bg-white shadow-lg overflow-hidden">
              <div className="px-4 py-3 border-b border-slate-100">
                <p className="text-sm font-semibold text-slate-900">{userName}</p>
                {userEmail ? (
                  <p className="mt-0.5 text-xs text-slate-500 truncate">{userEmail}</p>
                ) : null}
              </div>
              <a
                className="flex items-center gap-2 px-4 py-3 text-sm font-semibold text-red-600 hover:bg-red-50 transition-colors"
                href={logoutHref}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                  />
                </svg>
                <span>Log out</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
