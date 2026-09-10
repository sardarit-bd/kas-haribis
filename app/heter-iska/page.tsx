import { InteriorPage, SiteFooter, SiteHeader } from "../shared/site-shell";
import HeterLibrary from './heter-library';

export default function HeterIska() {
  return (
    <main className="min-h-screen bg-[#fbfaf7]">
      <SiteHeader/>
      <InteriorPage
      eyebrow="AVAILABLE DOCUMENTS"
      title="Choose a Heter Iska"
      intro=" Compare the available forms below. Previewing is free; payment is
            required only for the protected PDF download."
      />
      <HeterLibrary />
      <SiteFooter/>
    </main>
  );
}
