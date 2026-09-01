import ProductBreadcrumb from '../../componnent/ProductBreadcrumb';
import { requireChatGPTUser } from '../../chatgpt-auth';
import { listAudio } from '../../lib/directories';
import AudioManager from './audio-manager';
import { isOwnerEmail } from "../../lib/admin-access";
export const dynamic = 'force-dynamic';

const breadcrumbs = [
  { label: 'Dashboard', href: '/admin' },
  { label: 'Audio & Shiurim', href: '/admin/audio' },
];

export default async function AudioAdmin() {
  const user = await requireChatGPTUser('/admin/audio');
  if (!isOwnerEmail(user.email))
    return (
      <main className="adminPage">
        <div className="adminShell">
          <h1>Not authorized</h1>
        </div>
      </main>
    );
  const { env } = await import('cloudflare:workers');
  const audios = await listAudio(env.DB);
  return (
    <main className="adminPage">
      <div className="adminShell">
        <ProductBreadcrumb breadcrumbs={breadcrumbs} backbtn={true} />
        <div className="adminHeading">
          <div>
            <h1>Audio Manager</h1>
            <p>Add, rename, replace or remove shiurim and recordings.</p>
          </div>
          <a href="/audio">View public library →</a>
        </div>
        <AudioManager initialAudios={audios} />
      </div>
    </main>
  );
}
