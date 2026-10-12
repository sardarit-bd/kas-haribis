export default function AdminLoading() {
  return (
    <main
      className="adminPage"
      aria-busy="true"
      aria-label="Loading dashboard section"
    >
      <div className="adminShell animate-pulse">
        {/* Breadcrumb Skeleton */}
        <div className="flex items-center gap-2 mb-4">
          <div className="h-4 w-20 bg-slate-200 rounded" />
          <span className="text-slate-300">/</span>
          <div className="h-4 w-32 bg-slate-200 rounded" />
        </div>

        {/* Heading Skeleton */}
        <div className="adminHeading">
          <div className="space-y-2">
            <div className="h-10 w-64 bg-slate-200 rounded" />
            <div className="h-4 w-96 max-w-full bg-slate-200 rounded" />
          </div>
        </div>

        {/* Top Metric Cards Skeleton */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          <div className="h-28 bg-white border border-slate-200 rounded-xl p-4 shadow-xs" />
          <div className="h-28 bg-white border border-slate-200 rounded-xl p-4 shadow-xs" />
          <div className="h-28 bg-white border border-slate-200 rounded-xl p-4 shadow-xs" />
        </div>

        {/* Main Content Area Skeleton */}
        <div className="h-96 bg-white border border-slate-200 rounded-xl p-6 shadow-xs flex flex-col gap-4">
          <div className="h-6 w-48 bg-slate-100 rounded" />
          <div className="h-4 w-full bg-slate-100 rounded" />
          <div className="h-4 w-full bg-slate-100 rounded" />
          <div className="h-4 w-3/4 bg-slate-100 rounded" />
          <div className="h-4 w-5/6 bg-slate-100 rounded" />
        </div>
      </div>
    </main>
  );
}
