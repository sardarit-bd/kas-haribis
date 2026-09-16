import { listBanks } from '../lib/directories';
import { InteriorPage, SiteFooter, SiteHeader } from '../shared/site-shell';
import BankDirectoryClient from './bank-directory-client';

export const dynamic = 'force-dynamic';

export default async function BankDirectory() {
  const { env } = await import('cloudflare:workers');
  const banks = await listBanks(env.DB);
  return (
    <main className="min-h-screen bg-gray-200">
      <SiteHeader />
      <div className="overflow-x-hidden">
        {/* Hero Section */}
       
       <InteriorPage
             eyebrow="KOSHER Bank DIRECTORY"
             title="Kosher Bank Directory"
             intro="Search the Kav Haribis research directory for banks, lenders and financial institutions. Review the listed status and open each record for additional information."
           />

        {/* Directory Listing Component */}
        <BankDirectoryClient
          banks={banks.map((bank) => ({ ...bank, source: '' }))}
        />
      </div>
      <SiteFooter />
    </main>
  );
}
