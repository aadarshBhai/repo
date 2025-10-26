import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import Footer from "@/components/Footer";
import { useToast } from "@/components/ui/use-toast";
import { useNavigate } from "react-router-dom";

const Profile = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState<any | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editText, setEditText] = useState("");
  const [editContentUrl, setEditContentUrl] = useState("");

  const fetchMine = async () => {
    try {
      setLoading(true);
      const token = typeof window !== 'undefined' ? localStorage.getItem('userToken') : null;
      if (!token) {
        toast({ title: 'Login required', description: 'Please login to view your uploads', variant: 'destructive' });
        return;
      }
      const res = await fetch('/api/submissions/mine', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.status === 401) {
        toast({ title: 'Session expired', description: 'Please login again', variant: 'destructive' });
        return;
      }
      const data = await res.json();
      if (!res.ok) throw new Error(data?.errors?.[0]?.msg || 'Failed to load');
      setItems(Array.isArray(data) ? data : []);
    } catch (e: any) {
      toast({ title: 'Error', description: e.message || 'Failed to load', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('userToken');
    }
    toast({ title: 'Logged out' });
    navigate('/');
  };

  const startEdit = (item: any) => {
    setEditingId(item._id);
    setEditTitle(item.title || "");
    setEditDescription(item.description || "");
    setEditText(item.text || "");
    setEditContentUrl(item.contentUrl || "");
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditTitle("");
    setEditDescription("");
    setEditText("");
    setEditContentUrl("");
  };

  const saveEdit = async (id: string, type: string) => {
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('userToken') : null;
      if (!token) {
        toast({ title: 'Login required', description: 'Please login', variant: 'destructive' });
        return;
      }
      const body: any = {
        title: editTitle.trim(),
        description: editDescription.trim(),
      };
      if (type === 'text') {
        body.text = editText.trim();
      } else {
        body.contentUrl = editContentUrl.trim();
      }
      const res = await fetch(`/api/submissions/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.errors?.[0]?.msg || 'Update failed');
      toast({ title: 'Updated successfully' });
      cancelEdit();
      fetchMine();
    } catch (e: any) {
      toast({ title: 'Error', description: e.message || 'Update failed', variant: 'destructive' });
    }
  };

  const fetchProfile = async () => {
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('userToken') : null;
      if (!token) return;
      const res = await fetch('/api/auth/me', { headers: { Authorization: `Bearer ${token}` } });
      if (res.status === 401) return;
      const data = await res.json();
      if (!res.ok) throw new Error(data?.errors?.[0]?.msg || 'Failed to load profile');
      setProfile(data);
    } catch (e: any) {
      toast({ title: 'Error', description: e.message || 'Failed to load profile', variant: 'destructive' });
    }
  };

  useEffect(() => {
    fetchMine();
    fetchProfile();
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex-1 py-12 px-4">
        <div className="container mx-auto max-w-5xl">
          <div className="text-center mb-8">
            <h1 className="text-4xl md:text-5xl font-heading font-bold text-primary mb-4">
              Your Uploads
            </h1>
            <p className="text-lg text-muted-foreground">
              Manage content you've submitted. You can edit your uploads.
            </p>
          </div>

          {profile && (
            <Card className="card-texture mb-8">
              <CardHeader>
                <CardTitle className="text-2xl">Profile</CardTitle>
                <CardDescription>Your account details</CardDescription>
              </CardHeader>
              <CardContent className="flex items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="text-sm">Name: {profile.name}</div>
                  <div className="text-sm">Email: {profile.email}</div>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="secondary" onClick={logout}>Logout</Button>
                </div>
              </CardContent>
            </Card>
          )}

          {loading ? (
            <p className="text-muted-foreground">Loading...</p>
          ) : items.length === 0 ? (
            <p className="text-muted-foreground">No uploads yet.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {items.map((item) => (
                <Card key={item._id} className="card-texture">
                  <CardHeader>
                    <CardTitle className="text-xl line-clamp-1">{item.title}</CardTitle>
                    <CardDescription className="line-clamp-2">{item.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {item.type === 'video' && item.contentUrl ? (
                      <video src={item.contentUrl} controls className="w-full rounded" />
                    ) : item.type === 'audio' && item.contentUrl ? (
                      <audio src={item.contentUrl} controls className="w-full" />
                    ) : item.type === 'text' && item.contentUrl && /\.pdf(\?|$)/i.test(item.contentUrl) ? (
                      <div className="w-full">
                        <iframe
                          src={item.contentUrl}
                          title="PDF preview"
                          className="w-full h-80 border rounded"
                        />
                      </div>
                    ) : item.type === 'text' && item.text ? (
                      <p className="text-sm leading-relaxed whitespace-pre-wrap max-h-40 overflow-auto">{item.text}</p>
                    ) : (
                      <p className="text-sm text-muted-foreground">No preview available.</p>
                    )}

                    {editingId === item._id ? (
                      <div className="space-y-3">
                        <div className="grid gap-3">
                          <div className="space-y-1">
                            <Label htmlFor={`title-${item._id}`}>Title</Label>
                            <Input id={`title-${item._id}`} value={editTitle} onChange={(e) => setEditTitle(e.target.value)} />
                          </div>
                          <div className="space-y-1">
                            <Label htmlFor={`desc-${item._id}`}>Description</Label>
                            <Textarea id={`desc-${item._id}`} rows={3} value={editDescription} onChange={(e) => setEditDescription(e.target.value)} />
                          </div>
                          {item.type === 'text' ? (
                            <div className="space-y-1">
                              <Label htmlFor={`text-${item._id}`}>Text</Label>
                              <Textarea id={`text-${item._id}`} rows={6} value={editText} onChange={(e) => setEditText(e.target.value)} />
                            </div>
                          ) : (
                            <div className="space-y-1">
                              <Label htmlFor={`url-${item._id}`}>{item.type === 'audio' ? 'Audio URL' : (item.type === 'video' ? 'Video URL' : 'Content URL')}</Label>
                              <Input id={`url-${item._id}`} value={editContentUrl} onChange={(e) => setEditContentUrl(e.target.value)} />
                            </div>
                          )}
                        </div>
                        <div className="flex gap-2 justify-end">
                          <Button variant="secondary" size="sm" onClick={cancelEdit}>Cancel</Button>
                          <Button size="sm" onClick={() => saveEdit(item._id, item.type)}>Save</Button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between">
                        <span className="text-xs uppercase tracking-wide text-muted-foreground">{String(item.status)}</span>
                        <Button size="sm" onClick={() => startEdit(item)}>Edit</Button>
                      </div>
                    )}

                    <div className="flex flex-wrap gap-2 text-xs">
                      {item.category && (
                        <span className="px-2 py-1 rounded bg-muted text-foreground">Category: {String(item.category)}</span>
                      )}
                      {item.tribe && (
                        <span className="px-2 py-1 rounded bg-muted text-foreground">Tribe: {String(item.tribe)}</span>
                      )}
                    </div>

                    {item.consent && (
                      <div className="mt-3 text-sm space-y-1">
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

export default Profile;
