import { Suspense } from "react";
import Navigation from "@/components/navigation";
import Hero from "@/components/sections/hero";
import About from "@/components/sections/about";
import Projects from "@/components/sections/projects";
import Certifications from "@/components/sections/certifications";
import Skills from "@/components/sections/skills";
import Learning from "@/components/sections/learning";
import Resources from "@/components/sections/resources";
import Contact from "@/components/sections/contact";
import Footer from "@/components/footer";

export default function Home() {
  return (
    <>
      <Navigation />
      <main id="main-content">
        <Hero />
        <Suspense>
          <About />
          <Projects />
          <Certifications />
          <Skills />
          <Learning />
          <Resources />
          <Contact />
        </Suspense>
      </main>
      <Footer />
    </>
  );
}
