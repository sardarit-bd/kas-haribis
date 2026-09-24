import { listBanks } from '../lib/directories';
import { MotionDiv } from '../shared/motion-components';
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
        <section className="bankdirectoryherosectionbg">
          <section className="text-white py-12 md:py-16 text-center">
            <MotionDiv
              initial={{ opacity: 0, y: 25 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: 'easeOut' }}
              className="container px-4 sm:px-8"
            >
              <h1 className="text-3xl md:text-4xl font-semibold max-w-6xl mx-auto text-white mb-3">{"Kav Haribis Has Searched the Globe to Bring You Proper Guidelines for the Kashruth Status of Financial Institutions"}</h1>
              <p className="text-slate-300 text-base sm:text-lg leading-relaxed font-normal max-w-5xl mx-auto pt-5"> {'The Kosher Bank Directory is backed by the halachic guidance of Harav Pinchos Vind Shlita, based on the opinions and guidance of Harav Moshe Feinstein zatzal, Harav Yosef Shalom Elyashiv zatzal, Harav Yechezkel Roth zatzal, Harav Yisroel Belsky zatzal, YBL"T Harav Moshe Shternbuch Shlita, Harav Ari Marberger Shlita, and other Rabbonim who are experts in the field of Hilchos Ribis and financial institutions, together with the common practices observed in many Kehillos throughout the United States.'}</p>
              <p className="text-slate-300 text-base sm:text-sm py-5 leading-relaxed font-normal max-w-5xl mx-auto"> {"Disclaimer- the meaning of Jewish or  not Jewish, is not based on the actual fact of if one is Jewish or not, but it’s based on what we feel how halacha holds we should view the situation.  "}</p>
              <p className="text-slate-300 text-base sm:text-sm leading-relaxed font-normal max-w-5xl mx-auto"> {"Disclaimer: Information on entities not certified by the Kav Haribis is provided only as general information, which may be incomplete or outdated. No warranty expressed or implied is made regarding accuracy, adequacy, completeness, legality, reliability or usefulness of this information. Users of this website are responsible for independently verifying any and all information. "}</p>
            </MotionDiv>
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

