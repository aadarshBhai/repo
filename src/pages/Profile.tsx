import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import Footer from "@/components/Footer";
import { useToast } from "@/components/ui/use-toast";
import { useNavigate } from "react-router-dom";
import { mediaSrc } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";

const Profile = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { token, isAuthenticated, logout: ctxLogout } = useAuth();
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState<any | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editText, setEditText] = useState("");
  const [editContentUrl, setEditContentUrl] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [contributors, setContributors] = useState<any[]>([]);
  const [searching, setSearching] = useState(false);
  const [requests, setRequests] = useState<any[]>([]);
  const categories = [
    "Folktales",
    "Folkdance",
    "Folksongs",
    "Material Culture",
    "Ritual Practices",
  ];

  const fetchMine = async () => {
    try {
      setLoading(true);
      if (!isAuthenticated || !token) {
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
    ctxLogout();
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
      if (!isAuthenticated || !token) {
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
      if (!isAuthenticated || !token) return;
      const res = await fetch('/api/auth/me', { headers: { Authorization: `Bearer ${token}` } });
      if (res.status === 401) return;
      const data = await res.json();
      if (!res.ok) throw new Error(data?.errors?.[0]?.msg || 'Failed to load profile');
      setProfile(data);
    } catch (e: any) {
      toast({ title: 'Error', description: e.message || 'Failed to load profile', variant: 'destructive' });
    }
  };

  const fetchContributors = async () => {
    try {
      setSearching(true);
      setContributors([]);
      const category = selectedCategory.trim();
      if (!category) {
        toast({ title: 'Choose a category', variant: 'destructive' });
        return;
      }
      const res = await fetch(`/api/collab/contributors?category=${encodeURIComponent(category.toLowerCase())}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data?.errors?.[0]?.msg || 'Failed to search');
      setContributors(Array.isArray(data) ? data : []);
    } catch (e: any) {
      toast({ title: 'Error', description: e.message || 'Search failed', variant: 'destructive' });
    } finally {
      setSearching(false);
    }
  };

  const sendRequest = async (recipientId: string, category: string) => {
    try {
      if (!isAuthenticated || !token) {
        toast({ title: 'Login required', description: 'Please login', variant: 'destructive' });
        return;
      }
      const res = await fetch('/api/collab/requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ recipientId, category }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.errors?.[0]?.msg || 'Failed to send');
      toast({ title: 'Collaboration request sent' });
      fetchRequests();
    } catch (e: any) {
      toast({ title: 'Error', description: e.message || 'Failed to send', variant: 'destructive' });
    }
  };

  const fetchRequests = async () => {
    try {
      if (!isAuthenticated || !token) return;
      const res = await fetch('/api/collab/requests', { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.errors?.[0]?.msg || 'Failed to load requests');
      setRequests(Array.isArray(data) ? data : []);
    } catch (e: any) {
      toast({ title: 'Error', description: e.message || 'Failed to load requests', variant: 'destructive' });
    }
  };

  const respondRequest = async (id: string, action: 'accept' | 'reject') => {
    try {
      if (!isAuthenticated || !token) return;
      const res = await fetch(`/api/collab/requests/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ action }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.errors?.[0]?.msg || 'Failed to update');
      toast({ title: action === 'accept' ? 'Request accepted' : 'Request rejected' });
      fetchRequests();
    } catch (e: any) {
      toast({ title: 'Error', description: e.message || 'Failed to update', variant: 'destructive' });
    }
  };

  const canChatAndNavigate = async (otherUserId: string) => {
    try {
      if (!isAuthenticated || !token) {
        toast({ title: 'Login required', description: 'Please login', variant: 'destructive' });
        return;
      }
      const res = await fetch(`/api/collab/can-chat/${otherUserId}`, { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.errors?.[0]?.msg || 'Failed to check');
      if (data?.allowed) {
        // Navigate to chat route (to be implemented separately)
        navigate(`/chat/${otherUserId}`);
      } else {
        toast({ title: 'Chat not available', description: 'Collaboration must be accepted first', variant: 'destructive' });
      }
    } catch (e: any) {
      toast({ title: 'Error', description: e.message || 'Failed to check', variant: 'destructive' });
    }
  };

  useEffect(() => {
    fetchMine();
    fetchProfile();
    fetchRequests();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, token]);

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

          <div className="mb-6 rounded-lg border bg-emerald-50/60 text-emerald-900 p-4 flex items-start gap-3">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5 mt-0.5">
              <path fillRule="evenodd" d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12Zm9.75-6a.75.75 0 0 1 .75.75V12a.75.75 0 0 1-.39.659l-3.75 2.063a.75.75 0 1 1-.72-1.318l3.36-1.846V6.75a.75.75 0 0 1 .75-.75Z" clipRule="evenodd" />
            </svg>
            <p className="text-sm md:text-base">
              This section is maintained for further collaboration and networking.
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

          <Card className="card-texture mb-8">
            <CardHeader>
              <CardTitle className="text-2xl">Find Collaborators by Category</CardTitle>
              <CardDescription>Search users who uploaded in the same archive category</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col md:flex-row gap-3 items-start md:items-end">
                <div className="w-full md:w-64">
                  <Label htmlFor="category">Category</Label>
                  <select
                    id="category"
                    className="mt-1 w-full rounded border bg-background p-2"
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                  >
                    <option value="">Select a category</option>
                    {categories.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <Button onClick={fetchContributors} disabled={searching}>
                    {searching ? 'Searching...' : 'Search'}
                  </Button>
                </div>
              </div>

              {contributors.length > 0 && (
                <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {contributors.map((u) => (
                    <Card key={u.id} className="card-texture">
                      <CardHeader>
                        <CardTitle className="text-xl line-clamp-1">{u.name}</CardTitle>
                        <CardDescription>Category: {u.category}</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="flex items-center gap-2">
                          <Button size="sm" onClick={() => sendRequest(u.id, u.category)}>Send Collaboration</Button>
                          <Button size="sm" variant="secondary" onClick={() => canChatAndNavigate(u.id)}>Chat</Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="card-texture mb-8">
            <CardHeader>
              <CardTitle className="text-2xl">Collaboration Requests</CardTitle>
              <CardDescription>Manage incoming and outgoing requests</CardDescription>
            </CardHeader>
            <CardContent>
              {requests.length === 0 ? (
                <p className="text-sm text-muted-foreground">No collaboration requests yet.</p>
              ) : (
                <div className="space-y-3">
                  {requests.map((r) => {
                    const isRecipient = profile && String(r.recipientId) === String(profile.id);
                    return (
                      <div key={r.id} className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 rounded border p-3">
                        <div className="text-sm">
                          <div><span className="text-muted-foreground">From:</span> {r.requesterName}</div>
                          <div><span className="text-muted-foreground">To:</span> {r.recipientName}</div>
                          <div><span className="text-muted-foreground">Category:</span> {r.category}</div>
                          <div><span className="text-muted-foreground">Status:</span> {r.status}</div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button size="sm" variant="secondary" onClick={() => canChatAndNavigate(isRecipient ? r.requesterId : r.recipientId)}>
                            Chat
                          </Button>
                          {isRecipient && r.status === 'pending' && (
                            <>
                              <Button size="sm" onClick={() => respondRequest(r.id, 'accept')}>Accept</Button>
                              <Button size="sm" variant="destructive" onClick={() => respondRequest(r.id, 'reject')}>Reject</Button>
                            </>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>

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
                      <video src={mediaSrc(item.contentUrl)} controls className="w-full rounded" />
                    ) : item.type === 'audio' && item.contentUrl ? (
                      <audio src={mediaSrc(item.contentUrl)} controls className="w-full" />
                    ) : item.type === 'text' && item.contentUrl && /\.pdf(\?|$)/i.test(item.contentUrl) ? (
                      <div className="w-full">
                        <Button asChild variant="secondary" size="sm">
                          <a href={mediaSrc(item.contentUrl)} target="_blank" rel="noreferrer">Open PDF in new tab</a>
                        </Button>
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
                            <Button asChild variant="outline" size="sm">
                              <a href={String(item.consent.fileUrl)} target="_blank" rel="noreferrer">Open consent file</a>
                            </Button>
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
