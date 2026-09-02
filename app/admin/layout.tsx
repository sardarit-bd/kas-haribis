import type { ReactNode } from 'react';
import AdminNav from './admin-nav';
import AdminSidebar from './admin-sidebar';
import { getCurrentUser } from '../lib/auth';
import { isOwnerEmail, staffPermissions } from '../lib/admin-access';

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const user = await getCurrentUser();
  const email = user?.email || '';
  const isOwner = isOwnerEmail(email);

  let permissions: string[] = [];
  if (!isOwner && email) {
    try {
      const { env } = await import('cloudflare:workers');
      permissions = await staffPermissions(env.DB, email);
    } catch {}
  }

  return (
    <div className="bg-slate-50 min-h-screen">
      <AdminNav />
      <div className="grid grid-cols-12 gap-0 min-h-[calc(100vh-65px)]">
        <AdminSidebar isOwner={isOwner} permissions={permissions} />
        <main className="col-span-12 lg:col-span-9 xl:col-span-10 w-full bg-slate-50">
          {children}
        </main>
      </div>
    </div>
  );
}

