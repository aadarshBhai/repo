import Footer from "@/components/Footer";

const About = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex-1 py-10 md:py-16 px-4">
        <div className="container mx-auto max-w-6xl">
          {/* Hero */}
          <div className="text-center mb-10 md:mb-14">
            <h1 className="text-4xl md:text-5xl font-heading font-bold text-primary mb-4">
              About Us
            </h1>
            <div className="max-w-3xl mx-auto space-y-4 text-base md:text-lg leading-relaxed text-foreground">
              <p>
                This Heritage Repository is an ethical, consent-based digital archive dedicated to preserving and sharing indigenous cultural heritage, beginning with the Naga community.
              </p>
              <p>
                It bridges tradition and technology through community-led documentation of folktales, folksongs, folk dances, ritual practices, and material culture using tools like 3D scanning, drone imaging, and high-resolution recording.
              </p>
              <p>
                Culture is stored and shared only with explicit consent from its knowledge holders, maintaining authenticity and ownership. Each entry undergoes cultural verification by elders and scholars and may be classified as public, restricted, or confidential to protect sacred knowledge.
              </p>
              <p>
                Viewers are encouraged to approach with awareness and cultural sensitivity. If any practices feel too personal or sacred, they may skip or exit; otherwise, they may proceed with respect for the deep ancestral and communal significance.
              </p>
              <p>
                Guided by ethical consent, cultural accuracy, and community governance, this repository empowers communities to manage and control their heritage in the digital space—supporting continuity, not erasure.
              </p>
            </div>
          </div>

          {/* Two-up sections */}
          <div className="grid gap-8 md:grid-cols-2">
            <section className="space-y-3">
              <h2 className="text-2xl font-heading font-semibold text-primary">Our Mission</h2>
              <p className="text-foreground leading-relaxed">
                Build an accessible, community-informed archive that honors traditional knowledge, supports cultural continuity, and empowers the next generation with authentic resources.
              </p>
            </section>
            <section className="space-y-3">
              <h2 className="text-2xl font-heading font-semibold text-primary">Our Approach</h2>
              <p className="text-foreground leading-relaxed">
                Work closely with community members, elders, and cultural practitioners to ensure respectful representation and appropriate sensitivity for cultural materials.
              </p>
            </section>
          </div>

          {/* Highlights */}
          <div className="mt-10 md:mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <div className="rounded-xl p-5 bg-card">
              <h3 className="text-lg font-semibold mb-2 text-foreground">Consent-First</h3>
              <p className="text-sm leading-relaxed text-foreground">Every entry is published only with informed permission and clear terms of sharing.</p>
            </div>
            <div className="rounded-xl p-5 bg-card">
              <h3 className="text-lg font-semibold mb-2 text-foreground">Community-Led</h3>
              <p className="text-sm leading-relaxed text-foreground">Curation and verification are guided by community elders, scholars, and culture bearers.</p>
            </div>
            <div className="rounded-xl p-5 bg-card">
              <h3 className="text-lg font-semibold mb-2 text-foreground">Cultural Care</h3>
              <p className="text-sm leading-relaxed text-foreground">Sensitive materials are protected through tiered access and cultural safeguards.</p>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default About;
