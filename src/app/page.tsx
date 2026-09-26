import Hero from "@/components/sections/Hero";
import Offers from "@/components/sections/Offers";
import Projects from "@/components/sections/Projects";
import Engagement from "@/components/sections/Engagement";
import Standards from "@/components/sections/Standards";
import TheName from "@/components/sections/NameStory";
import Contact from "@/components/sections/Contact";

export default function Home() {
  return (
    <main>
      <Hero />
      <Offers />
      <Projects />
      <Engagement />
      <Standards />
      <TheName />
      <Contact />
    </main>
  );
}
