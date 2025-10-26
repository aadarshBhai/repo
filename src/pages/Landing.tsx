import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import heroBg from "@/assets/hero-bg.jpg";

const Landing = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />
      {/* Hero Section */}
      <section 
        className="relative h-screen flex items-center justify-center"
        style={{
          backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5)), url(${heroBg})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat'
        }}
      >
        <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-heading font-bold text-primary-foreground mb-4 hero-text-shadow">
            Heritage Repository
          </h1>
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-heading font-semibold text-primary-foreground mb-6 hero-text-shadow">
            Consent-Based, Tiered Digital Archive
          </h2>
          <p className="text-lg md:text-xl text-primary-foreground/90 mb-12 italic hero-text-shadow">
            "Safeguarding  Heritage — Ethically and Authentically."
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button variant="hero" size="lg" className="w-full sm:w-auto text-base md:text-lg px-8 py-6" asChild>
              <Link to="/explore">
                Explore the Repository
              </Link>
            </Button>
            <Button variant="hero" size="lg" className="w-full sm:w-auto text-base md:text-lg px-8 py-6" asChild>
              <Link to="/login">
                Login / Upload Content
              </Link>
            </Button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Landing;
