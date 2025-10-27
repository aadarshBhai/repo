import { useEffect, useState } from "react";
import { useParams, Link, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import Footer from "@/components/Footer";
import { ArrowLeft } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { mediaSrc } from "@/lib/utils";

const Category = () => {
  const { categoryName } = useParams();
  const [searchParams] = useSearchParams();
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const displayName = categoryName
    ?.split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        setLoading(true);
        const tribe = searchParams.get('tribe');
        const country = searchParams.get('country');
        const state = searchParams.get('state');
        const qs = new URLSearchParams();
        if (categoryName) qs.set('category', categoryName);
        if (tribe) qs.set('tribe', tribe);
        if (country) qs.set('country', country);
        if (state) qs.set('state', state);
        const res = await fetch(`/api/submissions?${qs.toString()}`);
        const data = await res.json();
        if (!res.ok) throw new Error(data?.errors?.[0]?.msg || 'Failed to load category content');
        if (active) setItems(Array.isArray(data) ? data : []);
      } catch (e: any) {
        if (active) setError(e.message || 'Failed to load category content');
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => { active = false; };
  }, [categoryName, searchParams]);

  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex-1 py-12 px-4">
      <div className="container mx-auto max-w-7xl">
        <Button variant="ghost" className="mb-8" asChild>
          <Link to={{ pathname: "/explore", search: searchParams.toString() }}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Explore
          </Link>
        </Button>

        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-heading font-bold text-primary mb-4">
            {displayName}
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Browse the collection of {displayName?.toLowerCase()} from various Naga tribes
          </p>
        </div>
        {loading ? (
          <p className="text-center text-muted-foreground">Loading content...</p>
        ) : error ? (
          <p className="text-center text-destructive">{error}</p>
        ) : items.length === 0 ? (
          <div className="mt-12 text-center">
            <p className="text-muted-foreground">No approved content in this category yet.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {items.map((item) => (
              <Card key={item._id} className="card-texture h-full overflow-hidden">
                <CardHeader>
                  <CardTitle className="text-xl font-heading text-primary">{item.title}</CardTitle>
                  <CardDescription className="text-sm">{item.description}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {item.type === 'video' && item.contentUrl ? (
                    <video src={mediaSrc(item.contentUrl)} controls className="w-full rounded" />
                  ) : item.type === 'audio' && item.contentUrl ? (
                    <audio src={mediaSrc(item.contentUrl)} controls className="w-full" />
                  ) : item.type === 'text' && item.contentUrl && /\.pdf(\?|$)/i.test(item.contentUrl) ? (
                    <div className="w-full">
                      <iframe
                        src={mediaSrc(item.contentUrl)}
                        title="PDF"
                        className="w-full h-80 border rounded"
                      />
                    </div>
                  ) : item.type === 'text' && item.text ? (
                    <p className="text-sm leading-relaxed whitespace-pre-wrap">{item.text}</p>
                  ) : null}

                  {item.consent && (
                    <div className="mt-2 text-sm space-y-1">
                      <div>
                        <span className="text-muted-foreground">Consent:</span>{' '}
                        <span>{item.consent.given ? 'Given' : 'Not given'}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Name:</span>{' '}
                        <span>{String(item.consent.name || '')}</span>
                      </div>
                      {item.consent.relation && (
                        <div>
                          <span className="text-muted-foreground">Relation:</span>{' '}
                          <span>{String(item.consent.relation)}</span>
                        </div>
                      )}
                      {item.consent.fileUrl && (
                        <div className="rounded border bg-background p-2">
                          <iframe
                            src={String(item.consent.fileUrl)}
                            title="Consent preview"
                            className="w-full h-64 md:h-80 border-0 rounded"
                          />
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
      </div>
      <Footer />
    </div>
  );
};

export default Category;

