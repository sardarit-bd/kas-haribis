import { requireChatGPTUser } from '../../chatgpt-auth';
import ProductBreadcrumb from '../../componnent/ProductBreadcrumb';
import { isOwnerEmail } from "../../lib/admin-access";
import SponsorManager from './sponsor-manager';
export const dynamic = 'force-dynamic';

const breadcrumbs = [
  { label: 'Dashboard', href: '/admin' },
  { label: 'Sponsors & Advertisements', href: '/admin/sponsors' },
];

export default async function Sponsors() {
  const user = await requireChatGPTUser('/admin/sponsors');
  if (!isOwnerEmail(user.email))
    return (
      <main className="adminPage">
        <div className="adminShell">
          <h1>Not authorized</h1>
        </div>
      </main>
    );
  return (
    <main className="adminPage">
      <div className="adminShell">
        <ProductBreadcrumb breadcrumbs={breadcrumbs} backbtn={true} />
        <div className="adminHeading">
          <div>
            <h1>Sponsor manager</h1>
            <p>Add or remove advertisements shown on Kav Haribis.</p>
          </div>
        </div>
        <SponsorManager />
      </div>
    </main>
  );
}
