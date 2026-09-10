import { listBanks } from '../lib/directories';
import { SiteFooter, SiteHeader } from '../shared/site-shell';
import BankDirectoryClient from './bank-directory-client';
import BankResearchForm from './bank-research-form';

export const dynamic = 'force-dynamic';

export default async function BankDirectory() {
  const { env } = await import('cloudflare:workers');
  const banks = await listBanks(env.DB);
  return (
    <main className="min-h-screen bg-[#fbfaf7]">
      <SiteHeader />
      <div className="overflow-x-hidden">
        {/* Hero Section */}
        <section className="relative overflow-hidden bg-gradient-to-br from-[#071728] via-[#102a43] to-[#0e304b] text-white border-b-2 border-[#c69b46]">
          <div className="container px-4 sm:px-8 py-[80px] grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-[50px] items-center relative z-10">
            <div className="relative z-10">
              <p className="text-[#c69b46] font-bold text-xs tracking-widest uppercase mb-1">
                KOSHER BANK RESEARCH CENTER
              </p>
              <h1 className="text-white font-serif font-bold text-3xl sm:text-4xl md:text-5xl lg:text-[58px] leading-[1.1] my-3">
                Kosher Bank Directory
              </h1>
              <p className="text-[#cbd5e1] text-base sm:text-[17px] leading-[1.8] max-w-[640px]">
                Search the Kav Haribis research directory for banks, lenders and
                financial institutions. Review the listed status and open each
                record for additional information.
              </p>
            </div>

            <blockquote
              className="relative z-10 m-0 p-6 sm:p-[34px_38px] border border-[#c69b46]/50 bg-[#071728]/85 backdrop-blur-md shadow-[0_20px_50px_rgba(0,0,0,0.35)]"
              dir="rtl"
              lang="he"
            >
              <span className="absolute left-5 top-1.5 font-serif text-6xl sm:text-[72px] text-[#c69b46]/35 leading-none" aria-hidden="true">״</span>
              <p className="m-0 font-serif text-xl sm:text-[24px] font-medium leading-[1.75] text-white">
                עוד ראיתי לעורר שמאד נצרך לברר ה״באנק״ השייכין לישראלים ולפרסם
                הרשימות של ה״באנקים״ שיש עליהן חשש רבית למנוע הרבים ממכשול הרבית,
                ומה מאד הי׳ ראוי למנות ע״ז אנשים מוכשרים היודעין לברר ענין זה, ושכרם
                יהי׳ הרבח מאד ובכלל מזכי רבים יחשבו.
              </p>
              <div className="mt-5 pt-4 border-t border-white/15 flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-[14px]" dir="ltr">
                <span className="w-10 h-0.5 bg-[#c69b46] shrink-0 hidden sm:inline-block"></span>
                <div>
                  <strong className="text-[#e5c474] text-[15px] font-bold block">הגאון הרב יחזקאל ראטה זצ״ל</strong>
                  <small className="text-[#cbd5e1] text-[11px] block">Harav Yechezkel Roth zt״l</small>
                </div>
              </div>
            </blockquote>
          </div>
        </section>

        {/* Directory Listing Component */}
        <BankDirectoryClient
          banks={banks.map((bank) => ({ ...bank, source: '' }))}
        />

        {/* Research Form Component */}
        <BankResearchForm />
      </div>
      <SiteFooter />
    </main>
  );
}
