import { About } from "@/components/sections/about";
import { Contact } from "@/components/sections/contact";
import { Faq } from "@/components/sections/faq";
import { Hero } from "@/components/sections/hero";
import { Process } from "@/components/sections/process";
import { Services } from "@/components/sections/services";
import { Stack } from "@/components/sections/stack";
import { Stats } from "@/components/sections/stats";
import { Testimonials } from "@/components/sections/testimonials";
import { Works } from "@/components/sections/works";

export default function HomePage() {
  return (
    <main className="relative">
      <Hero />
      <Stats />
      <About />
      <Services />
      <Process />
      <Works />
      <Stack />
      <Testimonials />
      <Faq />
      <Contact />
    </main>
  );
}
