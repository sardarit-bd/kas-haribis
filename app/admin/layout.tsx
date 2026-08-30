import type { ReactNode } from 'react';
import AdminNav from './admin-nav';
import AdminSidebar from './admin-sidebar';

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <div className="bg-slate-50 min-h-screen">
      <AdminNav />
      <div className="grid grid-cols-12 gap-0 min-h-[calc(100vh-65px)]">
        <AdminSidebar />
        <main className="col-span-12 lg:col-span-9 xl:col-span-10 w-full bg-slate-50">
          {children}
        </main>
      </div>
    </div>
  );
}
