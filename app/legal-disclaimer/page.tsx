import { InteriorPage, SiteFooter, SiteHeader } from "../shared/site-shell";

const LagalDisclaimerPage = () => {
    return (
        <main className="min-h-screen bg-gray-200">
              <SiteHeader />
                <InteriorPage
                    eyebrow=""
                    title="Legal Disclaimer"
                    intro=""
                  />

                  <div className="container  px-4 lg:px-8 py-12 max-w-[900px]">
                    <h2 className="text-center text-[20px] lg:text-[24px] font-medium">
                        <b>Disclaimer:</b> Information on entities not certified by the Kav Haribis is provided only as general information, which may be incomplete or outdated. No warranty expressed or implied is made regarding accuracy, adequacy, completeness, legality, reliability or usefulness of this information. Users of this website are responsible for independently verifying any and all information. 
                    </h2>
                  </div>


              <SiteFooter />
            </main>
    );
};

export default LagalDisclaimerPage;