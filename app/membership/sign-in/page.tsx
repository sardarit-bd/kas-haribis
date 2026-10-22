import { redirect } from 'next/navigation';
import { getMemberSignInDestination } from '../../lib/admin-access';
import { getCurrentUser } from '../../lib/auth';

export const dynamic = 'force-dynamic';

export default async function MemberSignInPage() {
  const user = await getCurrentUser();
  let db: any = null;
  try {
    const { env } = await import('cloudflare:workers');
    db = env?.DB;
  } catch {
    // In standalone or test runtimes
  }
  const destination = await getMemberSignInDestination(db, user?.email);
  redirect(destination);
}
