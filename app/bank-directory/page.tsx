import { listBanks } from '../lib/directories';
import { SiteFooter, SiteHeader } from '../shared/site-shell';
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
       
       <section className="bg-slate-50/50">
          <section className="bg-[#102a43] text-white py-12 md:py-16 text-center">
            <div className="container px-4 sm:px-8">
              <h1 className="text-3xl md:text-4xl font-semibold max-w-6xl mx-auto text-white mb-3">{"KBRS had searched the globe to bring you the proper guidelines to the Kashruth status of Financial Institutions"}</h1>
              <p className="text-slate-300 text-base sm:text-lg leading-relaxed font-normal max-w-5xl mx-auto pt-5"> {"The Kosher Bank Directory is based on the opinions of Harav Yisroel Belsky Zatzal and YBL”T Harav Moshe Shternbuch Shlita and Harav Ari Marberger Shlita and Other Rabbonim who are experts in the Field, and what seems to be to be common custom in many Kehilos in the United States ."}</p>
              <p className="text-slate-300 text-base sm:text-sm py-5 leading-relaxed font-normal max-w-5xl mx-auto"> {"Disclaimer- the meaning of Jewish or  not Jewish, is not based on the actual fact of if one is Jewish or not, but it’s based on what we feel how halacha holds we should view the situation.  "}</p>
              <p className="text-slate-300 text-base sm:text-sm leading-relaxed font-normal max-w-5xl mx-auto"> {"Disclaimer: Information on entities not certified by the Kav Haribis is provided only as general information, which may be incomplete or outdated. No warranty expressed or implied is made regarding accuracy, adequacy, completeness, legality, reliability or usefulness of this information. Users of this website are responsible for independently verifying any and all information. "}</p>
            </div>
          </section>
        </section>

        {/* Directory Listing Component */}
        <BankDirectoryClient
          banks={banks.map((bank) => ({ ...bank, source: '' }))}
        />
      </div>
      <SiteFooter />
    </main>
  );
}
