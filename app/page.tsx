import { Courses } from "@/components/landingpage/Courses";
import { Features } from "@/components/landingpage/Features";
import { Hero } from "@/components/landingpage/Hero";
import { Navigation } from "@/components/landingpage/Navigation";
import { Testimonials } from "@/components/landingpage/Testimonials";
import { Footer } from "@/components/landingpage/Footer";


export default async function Home() {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <Hero />
      <Features />
      <Courses />
      <Testimonials />
      <Footer />
    </div>
  );
}
