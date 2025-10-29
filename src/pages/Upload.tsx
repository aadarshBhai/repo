import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
 
import Footer from "@/components/Footer";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/components/ui/use-toast";
import { useNavigate } from "react-router-dom";

const Upload = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [textContent, setTextContent] = useState("");
  const [type, setType] = useState<'text' | 'audio' | 'video' | 'image'>('text');
  const [contentUrl, setContentUrl] = useState("");
  const [contentFile, setContentFile] = useState<File | null>(null);
  const [category, setCategory] = useState<string>("");
  const [submitting, setSubmitting] = useState(false);
  const [tribe, setTribe] = useState<string>("");
  const [country, setCountry] = useState<string>("");
  const [stateRegion, setStateRegion] = useState<string>("");
  const [village, setVillage] = useState<string>("");
  const [consentGiven, setConsentGiven] = useState(false);
  const [consentName, setConsentName] = useState("");
  const [consentFile, setConsentFile] = useState<File | null>(null);
  // Content warnings 'Other'
  const [warningOther, setWarningOther] = useState(false);
  const [warningOtherText, setWarningOtherText] = useState("");

  const categories = [
    "Folktales",
    "Folksongs",
    "Folk Dances",
    "Material Culture",
    "Ritual Practices"
  ];

  const tribesAll = [
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
    "Zeliang"
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
    "New Zealand": ["Auckland","Wellington","Canterbury","Otago","Waikato","Bay of Plenty","Northland","Southland","Hawke’s Bay","Manawatu-Wanganui","Taranaki","Gisborne","Marlborough","Nelson","West Coast"],
    "Australia": ["New South Wales (NSW)","Victoria (VIC)","Queensland (QLD)","Western Australia (WA)","South Australia (SA)","Tasmania (TAS)","Australian Capital Territory (ACT)","Northern Territory (NT)"],
    "United States of America": ["Alabama","Alaska","Arizona","Arkansas","California","Colorado","Connecticut","Delaware","Florida","Georgia","Hawaii","Idaho","Illinois","Indiana","Iowa","Kansas","Kentucky","Louisiana","Maine","Maryland","Massachusetts","Michigan","Minnesota","Mississippi","Missouri","Montana","Nebraska","Nevada","New Hampshire","New Jersey","New Mexico","New York","North Carolina","North Dakota","Ohio","Oklahoma","Oregon","Pennsylvania","Rhode Island","South Carolina","South Dakota","Tennessee","Texas","Utah","Vermont","Virginia","Washington","West Virginia","Wisconsin","Wyoming"],
    "Norway": ["Oslo","Viken","Innlandet","Vestfold og Telemark","Agder","Rogaland","Vestland","Møre og Romsdal","Trøndelag","Nordland","Troms og Finnmark"],
    "Sweden": ["Stockholm County","Västra Götaland County","Skåne County","Uppsala County","Södermanland County","Östergötland County","Jönköping County","Kronoberg County","Kalmar County","Gotland County","Blekinge County","Halland County","Värmland County","Örebro County","Västmanland County","Dalarna County","Gävleborg County","Västernorrland County","Jämtland County","Västerbotten County","Norrbotten County"],
    "India": ["Andhra Pradesh","Arunachal Pradesh","Assam","Bihar","Chhattisgarh","Goa","Gujarat","Haryana","Himachal Pradesh","Jharkhand","Karnataka","Kerala","Madhya Pradesh","Maharashtra","Manipur","Meghalaya","Mizoram","Nagaland","Odisha","Punjab","Rajasthan","Sikkim","Tamil Nadu","Telangana","Tripura","Uttar Pradesh","Uttarakhand","West Bengal","Delhi","Chandigarh","Puducherry","Lakshadweep","Andaman and Nicobar Islands","Dadra and Nagar Haveli and Daman and Diu","Ladakh","Jammu & Kashmir"],
  };

  // Derive tribe options by country/state (basic example: India -> Nagaland)
  const tribeOptions = useMemo(() => {
    if (country === 'India' && stateRegion === 'Nagaland') return tribesAll;
    return [] as string[];
  }, [country, stateRegion]);

  // Load/save form data to persist until successful submission
  useEffect(() => {
    try {
      const raw = localStorage.getItem('uploadForm');
      if (raw) {
        const saved = JSON.parse(raw);
        setTitle(saved.title || "");
        setTextContent(saved.textContent || "");
        setType(saved.type || 'text');
        setContentUrl(saved.contentUrl || "");
        setCategory(saved.category || "");
        setTribe(saved.tribe || "");
        setCountry(saved.country || "");
        setStateRegion(saved.stateRegion || "");
        setVillage(saved.village || "");
        setConsentGiven(Boolean(saved.consentGiven));
        setConsentName(saved.consentName || "");
        setWarningOther(Boolean(saved.warningOther));
        setWarningOtherText(saved.warningOtherText || "");
      }
    } catch {}
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const data = {
      title, textContent, type, contentUrl, category, tribe, country, stateRegion, village,
      consentGiven, consentName, warningOther, warningOtherText
    };
    try { localStorage.setItem('uploadForm', JSON.stringify(data)); } catch {}
  }, [title, textContent, type, contentUrl, category, tribe, country, stateRegion, village, consentGiven, consentName, warningOther, warningOtherText]);

  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex-1 py-12 px-4">
        <div className="container mx-auto max-w-3xl">
          <div className="text-center mb-8">
            <h1 className="text-4xl md:text-5xl font-heading font-bold text-primary mb-4">
              Upload Content
            </h1>
            <p className="text-lg text-muted-foreground">
              Share your cultural heritage with the community
            </p>
          </div>

          <div className="bg-background border rounded-lg p-6 space-y-6">
            <div>
              <h2 className="text-2xl font-heading">Content Submission Form</h2>
              <p className="text-sm text-muted-foreground">All fields are required for review</p>
            </div>

              {/* Category → Country → State/Region → Tribe → Village */}
              <div className="space-y-4">
                {/* Category */}
                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <Select value={category} onValueChange={setCategory}>
                    <SelectTrigger id="category">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((cat) => (
                        <SelectItem key={cat} value={cat.toLowerCase().replace(/\s+/g, '-')}>{cat}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Country */}
                <div className="space-y-2">
                  <Label htmlFor="country">Country</Label>
                  <Select value={country} onValueChange={(v) => { setCountry(v); setStateRegion(""); }}>
                    <SelectTrigger id="country">
                      <SelectValue placeholder="Select country" />
                    </SelectTrigger>
                    <SelectContent>
                      {countries.map((c) => (
                        <SelectItem key={c} value={c}>{c}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* State/Region */}
                <div className="space-y-2">
                  <Label htmlFor="state">State/Region</Label>
                  <Select value={stateRegion} onValueChange={setStateRegion} disabled={!country}>
                    <SelectTrigger id="state">
                      <SelectValue placeholder={country ? "Select state/region" : "Select country first"} />
                    </SelectTrigger>
                    <SelectContent>
                      {(regionsByCountry[country] || []).map((r) => (
                        <SelectItem key={r} value={r}>{r}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Tribe */}
                <div className="space-y-2">
                  <Label htmlFor="tribe">Tribe</Label>
                  <Select value={tribe} onValueChange={setTribe} disabled={tribeOptions.length === 0}>
                    <SelectTrigger id="tribe">
                      <SelectValue placeholder={tribeOptions.length ? "Select tribe" : "Select country/state first"} />
                    </SelectTrigger>
                    <SelectContent>
                      {tribeOptions.map((t) => (
                        <SelectItem key={t} value={t.toLowerCase()}>{t}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Village */}
                <div className="space-y-2">
                  <Label htmlFor="village">Village</Label>
                  <Input id="village" placeholder="Enter village" value={village} onChange={(e) => setVillage(e.target.value)} />
                </div>
              </div>

              {/* Content Section */}
              <div className="rounded-lg border p-4 bg-indigo-50/40">
                {/* Title */}
                <div className="space-y-2">
                  <Label htmlFor="title">Title</Label>
                  <Input id="title" placeholder="Enter content title" value={title} onChange={(e) => setTitle(e.target.value)} />
                </div>

                {/* Content Type */}
                <div className="space-y-2 mt-4">
                  <Label htmlFor="type">Content Type</Label>
                  <Select value={type} onValueChange={(v) => setType(v as any)}>
                    <SelectTrigger id="type">
                      <SelectValue placeholder="Select content type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="text">Text</SelectItem>
                      <SelectItem value="audio">Audio</SelectItem>
                      <SelectItem value="video">Video</SelectItem>
                      <SelectItem value="image">Image</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Text Content (Short Description) */}
                <div className="space-y-2 mt-4">
                  <Label htmlFor="text-content">Text Content (Short Description)</Label>
                  <Textarea
                    id="text-content"
                    placeholder={type === 'text' ? 'Write or paste the text content (used as both description and full text)' : 'Write a short description'}
                    rows={type === 'text' ? 8 : 5}
                    value={textContent}
                    onChange={(e) => setTextContent(e.target.value)}
                  />
                  {type === 'text' && (
                    <p className="text-xs text-muted-foreground">Or upload a PDF below.</p>
                  )}
                </div>

                {/* Content URL or File */}
                {type !== 'text' && (
                  <div className="space-y-2 mt-4">
                    <Label htmlFor="contentUrl">{type === 'image' ? 'Image URL' : (type === 'audio' ? 'Audio URL' : 'Video URL')}</Label>
                    <Input
                      id="contentUrl"
                      placeholder={type === 'image' ? 'https://example.com/file.jpg' : (type === 'audio' ? 'https://example.com/file.mp3' : 'https://example.com/file.mp4')}
                      value={contentUrl}
                      onChange={(e) => setContentUrl(e.target.value)}
                    />
                  </div>
                )}

                <div className="space-y-2 mt-4">
                  <Label htmlFor="content-file">{type === 'text' ? 'Upload PDF (optional)' : 'Upload Content File'}</Label>
                  <Input
                    id="content-file"
                    type="file"
                    accept={
                      type === 'video' ? 'video/*' : (
                        type === 'audio' ? 'audio/*' : (
                          type === 'image' ? 'image/*' : 'application/pdf'
                        )
                      )
                    }
                    onChange={(e) => setContentFile(e.target.files?.[0] || null)}
                  />
                </div>

                {/* Sensitivity Level */}
                <div className="space-y-2 mt-4">
                  <Label htmlFor="sensitivity">Sensitivity Level</Label>
                  <Select>
                    <SelectTrigger id="sensitivity">
                      <SelectValue placeholder="Select sensitivity level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="public">Public</SelectItem>
                      <SelectItem value="restricted">Restricted</SelectItem>
                      <SelectItem value="confidential">Confidential</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Content Warnings */}
                <div className="space-y-3 mt-4">
                  <Label>Content Warnings (check all that apply)</Label>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Checkbox id="ritual" />
                      <label htmlFor="ritual" className="text-sm cursor-pointer">Ritual Practices</label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox id="nudity" />
                      <label htmlFor="nudity" className="text-sm cursor-pointer">Partial Nudity</label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox id="cultural" />
                      <label htmlFor="cultural" className="text-sm cursor-pointer">Cultural Practices</label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox id="others" checked={warningOther} onCheckedChange={(v) => setWarningOther(Boolean(v))} />
                      <label htmlFor="others" className="text-sm cursor-pointer">Others</label>
                    </div>
                  </div>
                  {warningOther && (
                    <div className="space-y-2">
                      <Label htmlFor="others-text">Please specify</Label>
                      <Input id="others-text" placeholder="Type the content warning" value={warningOtherText} onChange={(e) => setWarningOtherText(e.target.value)} />
                    </div>
                  )}
                </div>
              </div>

              {/* Consent Section */}
              <div className="rounded-lg border p-4 bg-emerald-50/50">
                <div className="space-y-2">
                  <Label htmlFor="consent-file">Upload Consent File</Label>
                  <Input
                    id="consent-file"
                    type="file"
                    onChange={(e) => setConsentFile(e.target.files?.[0] || null)}
                  />
                </div>

                <div className="space-y-2 mt-4">
                  <Label htmlFor="consent-type">Consent Type</Label>
                  <Select>
                    <SelectTrigger id="consent-type">
                      <SelectValue placeholder="Select consent type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="written">Written</SelectItem>
                      <SelectItem value="audio">Audio</SelectItem>
                      <SelectItem value="video">Video</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2 mt-4">
                  <Label htmlFor="consent-name">Consent Name</Label>
                  <Input
                    id="consent-name"
                    placeholder="Name of consenting person"
                    value={consentName}
                    onChange={(e) => setConsentName(e.target.value)}
                  />
                </div>

                <div className="flex items-center space-x-2 mt-4">
                  <Checkbox id="consent-given" checked={consentGiven} onCheckedChange={(v) => setConsentGiven(Boolean(v))} />
                  <label htmlFor="consent-given" className="text-sm cursor-pointer">I confirm that consent has been given</label>
                </div>
              </div>

              {/* Submit Button */}
              <Button
                className="w-full"
                size="lg"
                disabled={
                  submitting ||
                  !title.trim() ||
                  !textContent.trim() ||
                  !category
                }
                onClick={async () => {
                  // Validate required fields (already gated by disabled)
                  try {
                    setSubmitting(true);
                    // Use selected values directly
                    const effectiveCategory = category;
                    const effectiveTribe = tribe || undefined;
                    const effectiveCountry = country || undefined;
                    const effectiveState = stateRegion || undefined;
                    const effectiveVillage = village || undefined;

                    // Enforce content presence rules
                    if (type === 'text' && !textContent.trim()) {
                      if (!contentFile) {
                        toast({ title: 'Missing content', description: 'Provide text content or upload a PDF', variant: 'destructive' });
                        setSubmitting(false);
                        return;
                      }
                    }
                    if ((type !== 'text') && !(contentFile || contentUrl.trim())) {
                      toast({ title: 'Missing media', description: 'Provide a media URL or upload a file', variant: 'destructive' });
                      setSubmitting(false);
                      return;
                    }

                    let mediaUrl = contentUrl.trim();
                    let consentFileUrl = "";

                    // Upload media file if provided
                    if (contentFile) {
                      const fd = new FormData();
                      fd.append('file', contentFile);
                      const token = typeof window !== 'undefined' ? localStorage.getItem('userToken') : null;
                      if (!token) {
                        toast({ title: 'Login required', description: 'Please login to upload files', variant: 'destructive' });
                        navigate('/login');
                        setSubmitting(false);
                        return;
                      }
                      const up = await fetch('/api/uploads', {
                        method: 'POST',
                        headers: { 'Authorization': `Bearer ${token}` },
                        body: fd
                      });
                      if (up.status === 401) {
                        toast({ title: 'Session expired', description: 'Please login again', variant: 'destructive' });
                        navigate('/login');
                        setSubmitting(false);
                        return;
                      }
                      const upData = await up.json();
                      if (!up.ok) throw new Error(upData?.errors?.[0]?.msg || 'Upload failed');
                      mediaUrl = upData.path || upData.url;
                    }

                    // Upload consent file if provided
                    if (consentFile) {
                      const fd2 = new FormData();
                      fd2.append('file', consentFile);
                      const token = typeof window !== 'undefined' ? localStorage.getItem('userToken') : null;
                      if (!token) {
                        toast({ title: 'Login required', description: 'Please login to upload files', variant: 'destructive' });
                        navigate('/login');
                        setSubmitting(false);
                        return;
                      }
                      const up2 = await fetch('/api/uploads', {
                        method: 'POST',
                        headers: { 'Authorization': `Bearer ${token}` },
                        body: fd2
                      });
                      if (up2.status === 401) {
                        toast({ title: 'Session expired', description: 'Please login again', variant: 'destructive' });
                        navigate('/login');
                        setSubmitting(false);
                        return;
                      }
                      const upData2 = await up2.json();
                      if (!up2.ok) throw new Error(upData2?.errors?.[0]?.msg || 'Consent upload failed');
                      consentFileUrl = upData2.path || upData2.url;
                    }

                    const token2 = typeof window !== 'undefined' ? localStorage.getItem('userToken') : null;
                    if (!token2) {
                      toast({ title: 'Login required', description: 'Please login to submit content', variant: 'destructive' });
                      navigate('/login');
                      setSubmitting(false);
                      return;
                    }

                    const res = await fetch('/api/submissions', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token2}` },
                      body: JSON.stringify({
                        title: title.trim(),
                        description: textContent.trim(),
                        category: effectiveCategory,
                        tribe: effectiveTribe,
                        country: effectiveCountry,
                        state: effectiveState,
                        village: effectiveVillage,
                        type,
                        contentUrl: ((type !== 'text') || (mediaUrl)) ? mediaUrl : undefined,
                        text: type === 'text' ? (textContent.trim() || undefined) : undefined,
                        consent: {
                          given: consentGiven,
                          name: consentName.trim(),
                          fileUrl: consentFileUrl || undefined,
                        }
                      })
                    });
                    if (res.status === 401) {
                      toast({ title: 'Session expired', description: 'Please login again', variant: 'destructive' });
                      navigate('/login');
                      setSubmitting(false);
                      return;
                    }
                    const data = await res.json();
                    if (!res.ok) throw new Error(data?.errors?.[0]?.msg || 'Submit failed');
                    toast({ title: 'Submitted for review', description: 'Your content was sent to admin for approval' });
                    // Reset form
                    setTitle("");
                    setTextContent("");
                    setType('text');
                    setContentUrl("");
                    setContentFile(null);
                    setCategory("");
                    setTribe("");
                    setCountry("");
                    setStateRegion("");
                    setVillage("");
                    setWarningOther(false);
                    setWarningOtherText("");
                    try { localStorage.removeItem('uploadForm'); } catch {}
                    navigate('/explore');
                  } catch (err: any) {
                    toast({ title: 'Error', description: err.message || 'Submit failed', variant: 'destructive' });
                  } finally {
                    setSubmitting(false);
                  }
                }}
              >
                {submitting ? 'Submitting...' : 'Submit for Review'}
              </Button>
            </div>
          </div>
      </div>
      <Footer />
    </div>
  );
};

export default Upload;
