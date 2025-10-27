import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import heroBg from "@/assets/hero-bg.jpg";
import { useRef } from "react";
import { ArrowDown, PlayCircle, Map, Sparkles, Image as ImageIcon } from "lucide-react";

const Landing = () => {
  const howRef = useRef<HTMLDivElement | null>(null);
  const roadmapRef = useRef<HTMLDivElement | null>(null);
  const inspireRef = useRef<HTMLDivElement | null>(null);
  const visualsRef = useRef<HTMLDivElement | null>(null);

  const scrollTo = (ref: React.RefObject<HTMLDivElement>) => {
    ref.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />

      {/* Hero Section */}
      <section
        className="relative h-[86svh] md:h-[92svh] flex items-center justify-center overflow-hidden"
        style={{
          backgroundImage: `linear-gradient(rgba(0,0,0,0.45), rgba(0,0,0,0.5)), url(${heroBg})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
        }}
      >
        <div className="absolute inset-0 pattern-weave opacity-[.12]" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-secondary/20 to-transparent" />
        {/* Decorative abstract lines */}
        <svg className="pointer-events-none absolute inset-0 opacity-20 mix-blend-screen" viewBox="0 0 1440 900" preserveAspectRatio="none" aria-hidden>
          <path d="M0,600 C240,520 480,680 720,600 C960,520 1200,680 1440,600" fill="none" stroke="white" strokeWidth="2" />
          <path d="M0,500 C240,420 480,580 720,500 C960,420 1200,580 1440,500" fill="none" stroke="white" strokeWidth="1.5" />
          <path d="M0,700 C240,620 480,780 720,700 C960,620 1200,780 1440,700" fill="none" stroke="white" strokeWidth="1" />
        </svg>
        <div className="relative z-10 w-full max-w-6xl mx-auto px-6 md:px-8">
          <div className="max-w-2xl md:max-w-3xl lg:max-w-3xl text-left">
            <h1 className="font-body uppercase tracking-[0.08em] text-primary-foreground text-4xl md:text-6xl lg:text-7xl leading-[1.1] font-semibold">
              Heritage Repository
            </h1>
            <h2 className="font-body uppercase tracking-[0.22em] text-primary-foreground/95 text-xl md:text-3xl lg:text-4xl mt-1 font-medium">
              Consent-Based, Tiered Digital Archive
            </h2>
            <p className="text-primary-foreground/90 text-xs md:text-sm max-w-[55ch] mt-5">
              Safeguarding heritage — ethically and authentically. Discover, learn, and contribute with consent-first principles.
            </p>
            <div className="mt-6 flex flex-col sm:flex-row gap-3">
              <Button
                variant="outline"
                size="sm"
                className="w-full sm:w-auto rounded-full bg-white text-secondary hover:bg-white/90 px-6 py-5"
                asChild
              >
                <Link to="/explore">Learn More</Link>
              </Button>
            </div>
          </div>

          <div className="mt-6 md:mt-8 flex items-center justify-start gap-3 text-primary-foreground/90">
            <button
              onClick={() => scrollTo(howRef)}
              className="inline-flex items-center gap-2 rounded-full/50 text-xs md:text-sm hover:text-primary transition-colors"
              aria-label="Scroll to how it works"
            >
              Learn how it works
              <ArrowDown className="h-5 w-5 animate-bounce" />
            </button>
          </div>
        </div>

        {/* Subtle gradient for depth */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-background/40 to-transparent" />
      </section>

      {/* How It Works */}
      <section ref={howRef} className="relative py-16 md:py-24 bg-background border-t border-border/60">
        <div className="absolute inset-0 bg-tribal-shawl/5" />
        <div className="relative max-w-6xl mx-auto px-4">
          <div className="mb-12 text-center">
            <h2 className="text-2xl md:text-3xl font-semibold heading-accent inline-block">How to use the Repository</h2>
            <p className="mt-3 md:mt-4 text-sm md:text-base text-muted-foreground max-w-2xl mx-auto">
              Discover, contribute, and steward cultural knowledge in an ethical, consent-first way.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-5 md:gap-7">
            <div className="group rounded-xl p-5 md:p-6 bg-card/80 backdrop-blur card-texture border hover:shadow-xl hover:-translate-y-0.5 hover:scale-[1.01] transition-transform duration-200">
              <div className="flex items-center gap-3 text-primary mb-3">
                <PlayCircle className="h-6 w-6" />
                <h3 className="text-lg md:text-xl font-semibold">Explore & Learn</h3>
              </div>
              <p className="text-xs md:text-sm text-muted-foreground">
                Browse categorized archives, stories, and media with clear consent levels. Save items to your collection.
              </p>
            </div>

            <div className="group rounded-xl p-5 md:p-6 bg-card/80 backdrop-blur card-texture border hover:shadow-xl hover:-translate-y-0.5 hover:scale-[1.01] transition-transform duration-200">
              <div className="flex items-center gap-3 text-primary mb-3">
                <Sparkles className="h-6 w-6" />
                <h3 className="text-lg md:text-xl font-semibold">Contribute Respectfully</h3>
              </div>
              <p className="text-xs md:text-sm text-muted-foreground">
                Upload with community consent, metadata, and access tiers to protect sensitive knowledge.
              </p>
            </div>

            <div className="group rounded-xl p-5 md:p-6 bg-card/80 backdrop-blur card-texture border hover:shadow-xl transition-all">
              <div className="flex items-center gap-3 text-primary mb-3">
                <Map className="h-6 w-6" />
                <h3 className="text-lg md:text-xl font-semibold">Follow Roadmaps</h3>
              </div>
              <p className="text-sm md:text-[0.95rem] text-muted-foreground">
                Learn through guided paths built with elders and experts, from language to craft to rituals.
              </p>
            </div>
          </div>

          <div className="mt-10 text-center">
            <Button variant="default" size="sm" onClick={() => scrollTo(roadmapRef)}>
              View Learning Roadmaps
            </Button>
          </div>
        </div>
      </section>

      {/* Roadmaps */}
      <section ref={roadmapRef} className="relative py-16 md:py-24 bg-muted/3 border-t border-border/60">
        <div className="relative max-w-6xl mx-auto px-4">
          <div className="mb-12 text-center">
            <h2 className="text-2xl md:text-3xl font-semibold heading-accent inline-block">Roadmaps</h2>
            <p className="mt-3 md:mt-4 text-sm md:text-base text-muted-foreground max-w-2xl mx-auto">
              Structured, step-by-step learning journeys.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-5 md:gap-7">
            {[
              { title: "Oral Histories", steps: 6 },
              { title: "Traditional Weaving", steps: 8 },
              { title: "Songs & Chants", steps: 7 },
            ].map((r) => (
              <div key={r.title} className="rounded-xl overflow-hidden border bg-card/80 hover:shadow-xl transition-shadow">
                <div className="h-24 md:h-28 bg-gradient-to-r from-primary/20 via-accent/20 to-primary/20" />
                <div className="p-6">
                  <h3 className="text-base md:text-lg font-semibold">{r.title}</h3>
                  <p className="text-xs md:text-sm text-muted-foreground mt-1">{r.steps} stages • mixed media</p>
                  <div className="mt-3 md:mt-4 flex gap-2 md:gap-3">
                    <Button variant="secondary" size="sm">Preview</Button>
                    <Button asChild size="sm">
                      <Link to="/explore">Start</Link>
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-12 text-center">
            <Button variant="outline" size="sm" onClick={() => scrollTo(inspireRef)}>Get Inspired</Button>
          </div>
        </div>
      </section>

      {/* Motivation / Inspiration */}
      <section ref={inspireRef} className="relative py-16 md:py-24 bg-background border-t border-border/60">
        <div className="absolute inset-0 pattern-weave opacity-[.06]" />
        <div className="relative max-w-5xl mx-auto px-4">
          <div className="text-center mb-10">
            <h2 className="text-2xl md:text-3xl font-semibold heading-accent inline-block">Why this matters</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-5 md:gap-7">
            {[
              {
                q: "Knowledge lives in people. Archives should honor consent and context.",
                a: "Every contribution respects the community’s voice and choice.",
              },
              {
                q: "Preservation is a living practice.",
                a: "Roadmaps keep traditions teachable and accessible.",
              },
              {
                q: "Stories carry identity.",
                a: "Explore oral histories that uplift memory and belonging.",
              },
            ].map((item) => (
              <blockquote key={item.q} className="rounded-xl p-5 md:p-6 bg-card/80 backdrop-blur border">
                <p className="text-sm md:text-base leading-relaxed">“{item.q}”</p>
                <footer className="mt-3 md:mt-4 text-xs md:text-sm text-muted-foreground">{item.a}</footer>
              </blockquote>
            ))}
          </div>

          <div className="mt-12 text-center">
            <Button onClick={() => scrollTo(visualsRef)} variant="default" size="sm">
              See Visual Stories
            </Button>
          </div>
        </div>
      </section>

      {/* Visuals / Media highlight */}
      <section ref={visualsRef} className="relative py-16 md:py-24 bg-muted/3 border-t border-border/60">
        <div className="absolute inset-0 -z-10 bg-gradient-to-b from-background via-background to-background" />
        <div className="relative max-w-6xl mx-auto px-4">
          <div className="mb-12 text-center">
            <h2 className="text-2xl md:text-3xl font-bold heading-accent inline-block">Scenes from the Archive</h2>
            <p className="mt-3 md:mt-4 text-sm md:text-base text-muted-foreground max-w-2xl mx-auto">
              Ethereal blends, textures, and colors inspired by traditional motifs.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-4 md:gap-6">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="relative aspect-[4/3] overflow-hidden rounded-xl border group bg-gradient-to-br from-primary/10 via-accent/10 to-primary/10"
              >
                <div className="absolute inset-0 pattern-weave opacity-[.12] group-hover:opacity-20 transition-opacity" />
                <div className="absolute inset-0 flex items-center justify-center text-foreground/70 group-hover:text-foreground/90 transition-colors">
                  <ImageIcon className="h-6 w-6 md:h-8 md:w-8" />
                </div>
              </div>
            ))}
          </div>

          <div className="mt-10 md:mt-12 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Button asChild size="sm">
              <Link to="/explore">Explore More</Link>
            </Button>
            <Button asChild variant="secondary" size="sm">
              <Link to="/upload">Contribute a Story</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="relative py-14 md:py-16">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h3 className="text-xl md:text-2xl font-semibold">Join us in safeguarding living heritage</h3>
          <p className="mt-2 md:mt-3 text-sm md:text-base text-muted-foreground">Your curiosity and care help traditions thrive.</p>
          <div className="mt-5 md:mt-6 flex items-center justify-center gap-3">
            <Button asChild size="sm">
              <Link to="/signup">Create an account</Link>
            </Button>
            <Button variant="outline" asChild size="sm">
              <Link to="/about-us">Learn more</Link>
            </Button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Landing;
