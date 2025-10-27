import { useEffect, useMemo, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { CardDescription, CardTitle } from "@/components/ui/card";
import Footer from "@/components/Footer";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { mediaSrc } from "@/lib/utils";

const categories = [
  { label: "Folktales", value: "folktales" },
  { label: "Folksongs", value: "folksongs" },
  { label: "Folk Dances", value: "folk-dances" },
  { label: "Traditional Attire", value: "traditional-attire" },
  { label: "Ritual Practices", value: "ritual-practices" },
];

const countries = [
  "New Zealand",
  "Australia",
  "United States of America",
  "Norway",
  "Sweden",
  "India",
];

const regionsByCountry: Record<string, string[]> = {
  "New Zealand": [
    "Auckland",
    "Wellington",
    "Canterbury",
    "Otago",
    "Waikato",
    "Bay of Plenty",
    "Northland",
    "Southland",
    "Hawke’s Bay",
    "Manawatu-Wanganui",
    "Taranaki",
    "Gisborne",
    "Marlborough",
    "Nelson",
    "West Coast",
  ],
  "Australia": [
    "New South Wales (NSW)",
    "Victoria (VIC)",
    "Queensland (QLD)",
    "Western Australia (WA)",
    "South Australia (SA)",
    "Tasmania (TAS)",
    "Australian Capital Territory (ACT)",
    "Northern Territory (NT)",
  ],
  "United States of America": [
    "Alabama","Alaska","Arizona","Arkansas","California","Colorado","Connecticut","Delaware","Florida","Georgia","Hawaii","Idaho","Illinois","Indiana","Iowa","Kansas","Kentucky","Louisiana","Maine","Maryland","Massachusetts","Michigan","Minnesota","Mississippi","Missouri","Montana","Nebraska","Nevada","New Hampshire","New Jersey","New Mexico","New York","North Carolina","North Dakota","Ohio","Oklahoma","Oregon","Pennsylvania","Rhode Island","South Carolina","South Dakota","Tennessee","Texas","Utah","Vermont","Virginia","Washington","West Virginia","Wisconsin","Wyoming",
  ],
  "Norway": [
    "Oslo","Viken","Innlandet","Vestfold og Telemark","Agder","Rogaland","Vestland","Møre og Romsdal","Trøndelag","Nordland","Troms og Finnmark",
  ],
  "Sweden": [
    "Stockholm County","Västra Götaland County","Skåne County","Uppsala County","Södermanland County","Östergötland County","Jönköping County","Kronoberg County","Kalmar County","Gotland County","Blekinge County","Halland County","Värmland County","Örebro County","Västmanland County","Dalarna County","Gävleborg County","Västernorrland County","Jämtland County","Västerbotten County","Norrbotten County",
  ],
  "India": [
    "Andhra Pradesh","Arunachal Pradesh","Assam","Bihar","Chhattisgarh","Goa","Gujarat","Haryana","Himachal Pradesh","Jharkhand","Karnataka","Kerala","Madhya Pradesh","Maharashtra","Manipur","Meghalaya","Mizoram","Nagaland","Odisha","Punjab","Rajasthan","Sikkim","Tamil Nadu","Telangana","Tripura","Uttar Pradesh","Uttarakhand","West Bengal","Delhi","Chandigarh","Puducherry","Lakshadweep","Andaman and Nicobar Islands","Dadra and Nagar Haveli and Daman and Diu","Ladakh","Jammu & Kashmir",
  ],
};

const Explore = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [disclaimerOpen, setDisclaimerOpen] = useState(false);
  const [pendingHref, setPendingHref] = useState<string | null>(null);
  const [openConsentId, setOpenConsentId] = useState<string | null>(null);

  const q = searchParams.get("q") || "";
  const tribe = searchParams.get("tribe") || "";
  const category = searchParams.get("category") || "";
  const sort = (searchParams.get("sort") || "latest") as "latest" | "oldest" | "views";
  const country = searchParams.get("country") || "";
  const stateRegion = searchParams.get("state") || "";

  const tribes = [
    "Angami",
    "Ao",
    "Chakhesang",
    "Chang",
    "Khiamniungan",
    "Konyak",
    "Lotha",
    "Phom",
    "Pochury",
    "Rengma",
    "Sangtam",
    "Sumi",
    "Yimchunger",
    "Zeliang",
  ];

  const changeParam = (key: string, value: string) => {
    const next = new URLSearchParams(searchParams);
    if (value) next.set(key, value); else next.delete(key);
    if (key !== "page") next.delete("page");
    if (key === "country") next.delete("state");
    setSearchParams(next, { replace: true });
  };

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        setLoading(true);
        setError(null);
        const qs = new URLSearchParams();
        if (tribe) qs.set("tribe", tribe);
        if (category) qs.set("category", category);
        if (country) qs.set("country", country);
        if (stateRegion) qs.set("state", stateRegion);
        const res = await fetch(`/api/submissions?${qs.toString()}`);
        const data = await res.json();
        if (!res.ok) throw new Error(data?.errors?.[0]?.msg || "Failed to load content");
        if (active) setItems(Array.isArray(data) ? data : []);
      } catch (e: any) {
        if (active) setError(e.message || "Failed to load content");
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => { active = false; };
  }, [tribe, category, country, stateRegion]);

  const filtered = useMemo(() => {
    let arr = items.slice();
    if (q.trim()) {
      const needle = q.toLowerCase();
      arr = arr.filter((it) =>
        String(it.title || "").toLowerCase().includes(needle) ||
        String(it.tribe || "").toLowerCase().includes(needle) ||
        String(it.description || "").toLowerCase().includes(needle)
      );
    }
    if (sort === "latest") {
      arr.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
    } else if (sort === "oldest") {
      arr.sort((a, b) => new Date(a.createdAt || 0).getTime() - new Date(b.createdAt || 0).getTime());
    } else if (sort === "views") {
      arr.sort((a, b) => (Number(b.views) || 0) - (Number(a.views) || 0));
    }
    return arr;
  }, [items, q, sort]);

  const fmtAgo = (iso?: string) => {
    if (!iso) return "";
    const diff = Date.now() - new Date(iso).getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    if (days <= 0) return "Today";
    if (days === 1) return "1 day ago";
    return `${days} days ago`;
  };

  const handleCardClick = (href: string, sensitivity?: string) => {
    const level = String(sensitivity || "public").toLowerCase();
    if (level === "restricted" || level === "confidential") {
      setPendingHref(href);
      setDisclaimerOpen(true);
      return;
    }
    navigate(href);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex-1 py-8 px-4">
        <div className="container mx-auto max-w-7xl">
          <div className="mb-6 grid grid-cols-1 md:grid-cols-12 gap-3">
            <div className="md:col-span-6">
              <Input
                value={q}
                onChange={(e) => changeParam("q", e.target.value)}
                placeholder="Search by title, tribe, or keyword…"
                aria-label="Search"
              />
            </div>
            <div className="md:col-span-2">
              <Select value={sort} onValueChange={(v) => changeParam("sort", v)}>
                <SelectTrigger aria-label="Sort by">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="latest">Sort by: Latest</SelectItem>
                  <SelectItem value="oldest">Sort by: Oldest</SelectItem>
                  <SelectItem value="views">Sort by: Most Viewed</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="md:col-span-2">
              <Select value={category} onValueChange={(v) => changeParam("category", v)}>
                <SelectTrigger aria-label="Category">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((c) => (
                    <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="md:col-span-2">
              <Select value={country} onValueChange={(v) => changeParam("country", v)}>
                <SelectTrigger aria-label="Country">
                  <SelectValue placeholder="Country" />
                </SelectTrigger>
                <SelectContent>
                  {countries.map((c) => (
                    <SelectItem key={c} value={c}>{c}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="md:col-span-2">
              <Select value={stateRegion} onValueChange={(v) => changeParam("state", v)} disabled={!country}>
                <SelectTrigger aria-label="State or Region">
                  <SelectValue placeholder={country ? "State/Region" : "Select country first"} />
                </SelectTrigger>
                <SelectContent>
                  {(regionsByCountry[country] || []).map((r) => (
                    <SelectItem key={r} value={r}>{r}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="md:col-span-2">
              <Select value={tribe} onValueChange={(v) => changeParam("tribe", v)}>
                <SelectTrigger aria-label="Tribe">
                  <SelectValue placeholder="Tribe" />
                </SelectTrigger>
                <SelectContent>
                  {tribes.map((t) => (
                    <SelectItem key={t} value={t.toLowerCase()}>{t}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="md:col-span-12 flex gap-2">
              <Button variant="outline" onClick={() => setSearchParams({}, { replace: true })}>Reset</Button>
            </div>
          </div>

          {loading ? (
            <p className="text-center text-muted-foreground">Loading content…</p>
          ) : error ? (
            <p className="text-center text-destructive">{error}</p>
          ) : filtered.length === 0 ? (
            <div className="mt-12 text-center">
              <p className="text-muted-foreground">No content found.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filtered.map((item) => {
                const href = `/category/${String(item.category || "").toLowerCase()}?${searchParams.toString()}`;
                const thumbIsPdf = item.type === 'text' && item.contentUrl && /\.pdf(\?|$)/i.test(item.contentUrl);
                const hasMedia = Boolean(item.contentUrl);
                return (
                  <button
                    key={item._id}
                    onClick={() => handleCardClick(href, item.sensitivity)}
                    className="w-full text-left rounded-xl overflow-hidden border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                    style={{ background: '#FFF8F0' }}
                  >
                    <div className="relative h-40 bg-neutral-100 overflow-hidden">
                      {hasMedia ? (
                        item.type === 'video' ? (
                          <video src={mediaSrc(item.contentUrl)} className="w-full h-full object-cover" muted />
                        ) : item.type === 'audio' ? (
                          <div className="w-full h-full flex items-center justify-center bg-neutral-200 text-neutral-600">
                            <audio src={mediaSrc(item.contentUrl)} controls className="w-11/12" onClick={(e) => e.stopPropagation()} />
                          </div>
                        ) : thumbIsPdf ? (
                          <iframe
                            src={mediaSrc(item.contentUrl)}
                            title="PDF preview"
                            className="w-full h-full border-0"
                          />
                        ) : (
                          <img src={mediaSrc(item.contentUrl)} alt={item.title} className="w-full h-full object-cover" />
                        )
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-neutral-200 text-neutral-600">No preview</div>
                      )}
                    </div>
                    <div className="p-4">
                      <div className="flex items-start justify-between gap-2">
                        <CardTitle className="text-lg font-heading line-clamp-2 text-foreground">{item.title}</CardTitle>
                      </div>
                      <CardDescription className="mt-1 line-clamp-2 text-sm">{item.description}</CardDescription>
                      <div className="mt-3 flex items-center gap-2 flex-wrap">
                        {item.tribe && (
                          <Badge className="bg-[#A67B5B] text-white hover:bg-[#A67B5B]">{String(item.tribe)}</Badge>
                        )}
                        {item.category && (
                          <Badge variant="secondary">{String(item.category)}</Badge>
                        )}
                        {item.createdAt && (
                          <span className="text-xs text-muted-foreground">{fmtAgo(item.createdAt)}</span>
                        )}
                      </div>

                      {item.consent && (
                        <div className="mt-2 text-xs space-y-2">
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
                            <div>
                              <button
                                type="button"
                                className="text-primary underline"
                                onClick={(e) => { e.stopPropagation(); setOpenConsentId(openConsentId === item._id ? null : item._id); }}
                              >
                                {openConsentId === item._id ? 'Hide consent (PDF)' : 'View consent (PDF)'}
                              </button>
                            </div>
                          )}
                          {item.consent.fileUrl && openConsentId === item._id && (
                            <div className="rounded border bg-background p-2" onClick={(e) => e.stopPropagation()}>
                              <iframe
                                src={mediaSrc(String(item.consent.fileUrl))}
                                title="Consent PDF"
                                className="w-full h-40 md:h-56 border-0 rounded"
                              />
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>
      <Footer />

      <AlertDialog open={disclaimerOpen} onOpenChange={setDisclaimerOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>⚠️ Cultural Sensitivity Notice</AlertDialogTitle>
            <AlertDialogDescription>
              This content may include sacred or sensitive cultural material. Please view with respect and do not reproduce or redistribute without consent.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Go Back</AlertDialogCancel>
            <AlertDialogAction onClick={() => { if (pendingHref) navigate(pendingHref); setPendingHref(null); }}>I Understand, Continue</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Explore;

