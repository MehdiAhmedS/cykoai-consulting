import Hero from "@/components/sections/Hero";
import WhatWeDo from "@/components/sections/WhatWeDo";
import Services from "@/components/sections/Services";
import WhyCykoai from "@/components/sections/WhyCykoai";
import NameStory from "@/components/sections/NameStory";
import Philosophy from "@/components/sections/Philosophy";
import Process from "@/components/sections/Process";
import Contact from "@/components/sections/Contact";

export default function Home() {
  return (
    <main>
      <Hero />
      <WhatWeDo />
      <Services />
      <WhyCykoai />
      <NameStory />
      <Philosophy />
      <Process />
      <Contact />
    </main>
  );
}
