import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import heroBg from "@/assets/hero-bg.jpg";
import { useRef } from "react";
import { ArrowDown } from "lucide-react";

const Landing = () => {
  const howRef = useRef<HTMLDivElement | null>(null);
  const roadmapRef = useRef<HTMLDivElement | null>(null);
  const visualsRef = useRef<HTMLDivElement | null>(null);

  const scrollTo = (ref: React.RefObject<HTMLDivElement>) => {
    ref.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div className="min-h-screen flex flex-col overflow-x-hidden font-sans leading-relaxed">
      <Navigation />

      {/* Hero Section */}
      <section
        className="relative h-[86svh] md:h-[92svh] flex items-center justify-start overflow-hidden"
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
        <div className="relative z-10 w-full px-0 md:px-0">
          <div className="max-w-2xl md:max-w-3xl lg:max-w-3xl text-left pl-4 sm:pl-6 md:pl-8">
            <h1 className="font-body uppercase tracking-[0.08em] text-primary-foreground text-4xl md:text-6xl lg:text-7xl leading-[1.1] font-semibold">
              Heritage Repository
            </h1>
            <h2 className="font-body uppercase tracking-[0.22em] text-primary-foreground/95 text-lg md:text-2xl lg:text-3xl mt-1 font-medium">
              Consent-Based, Tiered Digital Archive
            </h2>
            <p className="text-primary-foreground/90 text-sm md:text-base max-w-[55ch] mt-5">
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

          <div className="mt-6 md:mt-8 flex items-center justify-start gap-3 text-primary-foreground/90 pl-4 sm:pl-6 md:pl-8">
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
            <h2 className="text-2xl md:text-3xl font-semibold heading-accent inline-block">How to Use the Repository</h2>
            <p className="mt-3 md:mt-4 text-sm md:text-base text-muted-foreground max-w-2xl mx-auto">
              Discover, contribute, and steward cultural knowledge in an ethical, consent-first way.
            </p>
            <p className="mt-2 text-xs md:text-sm text-muted-foreground max-w-2xl mx-auto">
              Follow these three simple steps to explore and participate responsibly.
            </p>
          </div>

          <ol className="space-y-6 md:space-y-8 max-w-3xl mx-auto">
            <li className="rounded-xl p-5 md:p-6 md:pr-40 bg-card/80 backdrop-blur border relative overflow-hidden">
              <div className="flex items-center gap-3 text-primary mb-2">
                <h3 className="text-lg md:text-xl font-semibold">Learn & Explore</h3>
              </div>
              <div className="hidden md:block absolute right-4 top-4 w-32 h-32 rounded-lg overflow-hidden border-2 border-primary/20">
                <img 
                  src="/collection.jpg" 
                  alt="Explore and learn about cultural heritage"
                  className="w-full h-full object-cover"
                />
              </div>
              <ul className="list-disc pl-5 text-sm md:text-base text-foreground/85 space-y-1">
                <li>Browse Folksongs, Folktales, Ritual Practices and Material Culture contributed by communities.</li>
                <li>Each entry displays its consent level — Public, Restricted, or Confidential.</li>
                <li>Access detailed descriptions, listen to audio clips, view cultural videos and read cultural content </li>
                <li>Save your cultural stories to your collection for future learning.</li>
              </ul>
              <p className="mt-3 text-xs md:text-sm text-foreground/80">Respect each item's consent tier — not all content is meant for public use.</p>
            </li>

            <li className="rounded-xl p-5 md:p-6 md:pr-40 bg-card/80 backdrop-blur border relative overflow-hidden">
              <div className="flex items-center gap-3 text-primary mb-2">
                <h3 className="text-lg md:text-xl font-semibold">Contribute Ethically</h3>
              </div>
              <div className="hidden md:block absolute right-4 top-4 w-32 h-32 rounded-lg overflow-hidden border-2 border-primary/20">
                <img 
                  src="/contribute.jpg" 
                  alt="Contribute to cultural preservation"
                  className="w-full h-full object-cover"
                />
              </div>
              <ul className="list-disc pl-5 text-sm md:text-base text-foreground/85 space-y-1">
                <li>Share your own Folksongs, Folktales, Ritual Practices and Material Culture as text, image, audio, or video.</li>
                <li>Ensure you have clear community consent before uploading.</li>
                <li>Fill in all required metadata: category, tribe, region, and a short description.</li>
                <li>Upload a consent document and select the right sensitivity level (Public / Restricted / Confidential).</li>
              </ul>
              <p className="mt-3 text-xs md:text-sm text-foreground/80">Submissions are reviewed by community elders and cultural experts before publication.</p>
            </li>

            <li className="rounded-xl p-5 md:p-6 md:pr-40 bg-card/80 backdrop-blur border relative overflow-hidden">
              <div className="flex items-center gap-3 text-primary mb-2">
                <h3 className="text-lg md:text-xl font-semibold">Follow the Roadmap</h3>
              </div>
              <div className="hidden md:block absolute right-4 top-4 w-32 h-32 rounded-lg overflow-hidden border-2 border-primary/20">
                <img 
                  src="/follow.jpg" 
                  alt="Follow our cultural preservation roadmap"
                  className="w-full h-full object-cover"
                />
              </div>
              <ul className="list-disc pl-5 text-sm md:text-base text-foreground/85 space-y-1">
                <li>Collection: Gathering Folk Stories and Material Culture with consent.</li>
                <li>Verification: Elders and community experts ensure accuracy and sensitivity.</li>
                <li>Publication: Approved items are published with tiered access.</li>
              </ul>
              <p className="mt-3 text-xs md:text-sm text-foreground/80">You can explore learning roadmaps built by experts and culture bearers to understand traditions deeply.</p>
              <p className="mt-1 text-xs md:text-sm text-foreground/80">This ensures every shared story remains authentic and ethically preserved.</p>
            </li>
          </ol>

          <div className="mt-10 md:mt-12 text-center flex flex-col sm:flex-row items-center justify-center gap-3">
            <Button asChild size="sm">
              <Link to="/explore">Start Exploring</Link>
            </Button>
            <Button asChild variant="secondary" size="sm">
              <Link to="/upload">Contribute a Story</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Roadmaps */}
      <section ref={roadmapRef} className="relative py-16 md:py-24 bg-muted/3 border-t border-border/60">
        <div className="relative max-w-6xl mx-auto px-4">
          <div className="mb-8 md:mb-12 text-center">
            <h2 className="text-2xl md:text-3xl font-semibold heading-accent inline-block">Heritage Repository Roadmap</h2>
            <p className="mt-3 md:mt-4 text-sm md:text-base text-muted-foreground max-w-2xl mx-auto">A clear path from collection to publication.</p>
            <p className="mt-2 text-xs md:text-sm text-muted-foreground max-w-3xl mx-auto">Every cultural submission follows a transparent, consent-based process to ensure authenticity and ethical cultural preservation.</p>
          </div>

          <div className="max-w-3xl mx-auto">
            <div className="space-y-6">
              <div className="rounded-xl p-5 md:p-6 md:pr-40 bg-card/80 backdrop-blur border relative overflow-hidden">
                <h3 className="text-lg md:text-xl font-semibold text-primary">Collection</h3>
                <div className="hidden md:block absolute right-4 top-4 w-32 h-32 rounded-lg overflow-hidden border-2 border-primary/20">
                  <img 
                    src={"/collection.jpg"}
                    alt="Collection of cultural artifacts"
                    className="w-full h-full object-cover"
                  />
                </div>
                <p className="mt-2 text-sm md:text-base text-foreground/85">Community members document Folksongs, Folktales, Ritual Practices and Material Culture with informed consent from the knowledge holders.</p>
                <p className="mt-2 text-xs md:text-sm text-foreground/80"><em>Goal: Preserve Cultural Heritage Ethically</em></p>
              </div>

              <div className="my-3 md:my-4 text-center" aria-hidden></div>

              <div className="rounded-xl p-5 md:p-6 md:pr-40 bg-card/80 backdrop-blur border relative overflow-hidden">
                <h3 className="text-lg md:text-xl font-semibold text-primary">Verification</h3>
                <div className="hidden md:block absolute right-4 top-4 w-32 h-32 rounded-lg overflow-hidden border-2 border-primary/20">
                  <img 
                    src={"/verification.jpg"}
                    alt="Verification process by community elders"
                    className="w-full h-full object-cover"
                  />
                </div>
                <p className="mt-2 text-sm md:text-base text-foreground/85">Community elders and cultural experts carefully review each submission for accuracy, sensitivity, and cultural integrity.</p>
                <p className="mt-2 text-xs md:text-sm text-foreground/80"><em>Goal: Ensure Authenticity and Ethical Handling.</em></p>
              </div>

              <div className="my-3 md:my-4 text-center" aria-hidden></div>

              <div className="rounded-xl p-5 md:p-6 md:pr-40 bg-card/80 backdrop-blur border relative overflow-hidden">
                <div className="flex items-center gap-3 text-primary mb-2">
                  <h3 className="text-lg md:text-xl font-semibold">Publication</h3>
                </div>
                <div className="hidden md:block absolute right-4 top-4 w-32 h-32 rounded-lg overflow-hidden border-2 border-primary/20">
                  <img 
                    src={"/publication.jpg"}
                    alt="Publication with tiered access"
                    className="w-full h-full object-cover"
                  />
                </div>
                <p className="text-sm md:text-base text-foreground/85 mb-3">
                  Once verified, the content is published in the Repository with tiered access:
                </p>
                <ul className="list-disc pl-5 text-sm md:text-base text-foreground/85 space-y-1">
                  <li><span className="font-medium">Public</span> → Open for all viewers</li>
                  <li><span className="font-medium">Restricted</span> → Limited to researchers/learners</li>
                  <li><span className="font-medium">Confidential</span> → Accessible only to designated custodians</li>
                </ul>
                <p className="mt-3 text-xs md:text-sm text-foreground/80">
                  <span className="font-medium">Goal:</span> Protect Cultural Heritage Knowledge while promoting cultural awareness, education and cultural continuity.
                </p>
              </div>

              <blockquote className="mt-8 md:mt-10 border-l-2 pl-4 text-sm md:text-base text-foreground/85">
                <p className="font-medium">"From Collection to Continuity"</p>
                <p className="text-muted-foreground">Every cultural story travels through this ethical roadmap before it becomes part of our shared archive.</p>
              </blockquote>
            </div>
          </div>
        </div>
      </section>

      {/* Visuals / Media highlight */}
      <section ref={visualsRef} className="relative py-16 md:py-24 bg-muted/3 border-t border-border/60">
        <div className="absolute inset-0 -z-10 bg-gradient-to-b from-background via-background to-background" />
        <div className="relative max-w-6xl mx-auto px-4">
          <div className="mb-12 text-center">
            <h2 className="text-2xl md:text-3xl font-bold heading-accent inline-block">Photos from the Archive</h2>
            <p className="mt-3 md:mt-4 text-sm md:text-base text-muted-foreground max-w-2xl mx-auto">
              A glimpse of real visual stories. Captions and tags help contextualize each photo.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
            {[
              { src: '/rituals.jpg', caption: 'Community gathering at dusk', tags: ['community','ritual'] },
              { src: '/material.jpg', caption: 'Handwoven patterns', tags: ['weaving','material-culture'] },
              { src: '/folksongs.jpg', caption: 'Oral history recording', tags: ['oral-history','audio'] },
              { src: '/folkdances.jpg', caption: 'Traditional dance practice', tags: ['dance'] },
              { src: '/tools.jpg', caption: 'Craft tools and artifacts', tags: ['tools','craft'] },
              { src: '/folktales.jpg', caption: 'Mountain village landscape', tags: ['landscape','village'] },
            ].map((g, i) => (
              <figure key={i} className="group relative overflow-hidden rounded-xl border bg-background">
                <img src={g.src} alt={g.caption} loading="lazy" className="w-full h-48 md:h-52 object-cover group-hover:scale-[1.02] transition-transform" />
                <figcaption className="p-3">
                  <p className="text-sm text-foreground/90">{g.caption}</p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {g.tags.map(t => (
                      <span key={t} className="text-[10px] px-2 py-0.5 rounded bg-muted/20 border">{t}</span>
                    ))}
                  </div>
                </figcaption>
              </figure>
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
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Landing;
