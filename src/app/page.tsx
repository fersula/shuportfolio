import { Hero } from "@/components/hero/hero";
import { Manifesto } from "@/components/sections/manifesto";
import { Intro } from "@/components/sections/intro";
import { FeaturedWorks } from "@/components/sections/featured-works";
import { RefractionLab } from "@/components/sections/refraction-lab/refraction-lab";
import { Contact } from "@/components/sections/contact";
import { IndexSidebar } from "@/components/nav/index-sidebar";

export default function Home() {
  return (
    <main>
      <IndexSidebar />
      <Hero />
      <Manifesto />
      <Intro />
      <FeaturedWorks />
      <RefractionLab />
      <Contact />
    </main>
  );
}
