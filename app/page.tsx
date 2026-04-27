import { Header } from "@/app/components/header";
import { Hero } from "@/app/components/hero";
import { About } from "@/app/components/about";
import { Benefits } from "@/app/components/benefits";
import { HowItWorks } from "@/app/components/how-it-works";
import { Process } from "@/app/components/process";
import { Calculator } from "@/app/components/calculator";
import { Programs } from "@/app/components/programs";
import { Team } from "@/app/components/team";
import { Testimonials } from "@/app/components/testimonials";
import { FinalCTA } from "@/app/components/final-cta";
import { Footer } from "@/app/components/footer";

export default function Home() {
  return (
    <main className="bg-[#302012] text-[#F5F3ED]">
      <Header />
      <Hero />
      <About />
      <Benefits />
      <HowItWorks />
      <Process />
      <Calculator />
      <Programs />
      <Team />
      <Testimonials />
      <FinalCTA />
      <Footer />
    </main>
  );
}
