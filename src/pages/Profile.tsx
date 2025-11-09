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
import { authFetch } from "@/lib/api";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import RequestCollaboration from "@/components/RequestCollaboration";

interface UserProfile {
  _id: string;
  name: string;
  email: string;
  avatar?: string;
}

interface Submission {
  _id: string;
  title: string;
  description: string;
  type: 'text' | 'image' | 'video' | 'audio' | 'pdf';
  contentUrl?: string;
  text?: string;
  status: string;
  category?: string;
  tribe?: string;
  consent?: {
    given: boolean;
    name?: string;
    relation?: string;
    fileUrl?: string;
  };
}

const Profile = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { token, isAuthenticated, logout: ctxLogout } = useAuth();
  
  const [items, setItems] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editText, setEditText] = useState("");
  const [editContentUrl, setEditContentUrl] = useState("");

  const fetchMine = async () => {
    try {
      setLoading(true);
      const res = await authFetch('/api/submissions/mine');
      const data = await res.json();
      if (!res.ok) throw new Error(data?.errors?.[0]?.msg || 'Failed to load');
      setItems(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching submissions:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to fetch submissions',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    ctxLogout();
    toast({ title: 'Logged out' });
    navigate('/');
  };

  const startEdit = (item: Submission) => {
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
      const payload: any = {
        title: editTitle,
        description: editDescription,
      };

      if (type === 'text') {
        payload.text = editText;
      } else {
        payload.contentUrl = editContentUrl;
      }

      const res = await authFetch(`/api/submissions/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data?.errors?.[0]?.msg || 'Failed to update');
      }

      await fetchMine();
      cancelEdit();
      toast({ title: 'Updated successfully' });
    } catch (error) {
      console.error('Error updating submission:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to update submission',
        variant: 'destructive',
      });
    }
  };

  const fetchProfile = async () => {
    try {
      const res = await authFetch('/api/auth/me');
      const data = await res.json();
      if (!res.ok) throw new Error(data?.errors?.[0]?.msg || 'Failed to load profile');
      setUser(data.user);
    } catch (error) {
      console.error('Error fetching profile:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to load profile',
        variant: 'destructive',
      });
    }
  };

  useEffect(() => {
    fetchMine();
    fetchProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card>
          <CardHeader>
            <CardTitle>Authentication Required</CardTitle>
            <CardDescription>Please log in to view your profile.</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-4 py-8">
        <Tabs defaultValue="submissions" className="space-y-4">
          <TabsList>
            <TabsTrigger value="submissions">My Submissions</TabsTrigger>
            <TabsTrigger value="collaboration">Collaboration</TabsTrigger>
          </TabsList>

          <TabsContent value="submissions">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {/* Profile Card */}
              <div className="md:col-span-1">
                <Card>
                  <CardHeader>
                    <div className="flex flex-col items-center space-y-4">
                      <div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                        {user?.avatar ? (
                          <img 
                            src={mediaSrc(user.avatar)} 
                            alt="Profile" 
                            className="w-full h-full object-cover" 
                          />
                        ) : (
                          <span className="text-2xl">👤</span>
                        )}
                      </div>
                      <div className="text-center">
                        <h2 className="text-xl font-bold">{user?.name || 'User'}</h2>
                        <p className="text-sm text-muted-foreground">{user?.email}</p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <Button 
                      variant="outline" 
                      className="w-full" 
                      onClick={logout}
                    >
                      Logout
                    </Button>
                  </CardContent>
                </Card>
              </div>

              {/* Submissions Content */}
              <div className="md:col-span-3 space-y-6">
                <h1 className="text-3xl font-bold">My Submissions</h1>
                {loading ? (
                  <div>Loading...</div>
                ) : items.length === 0 ? (
                  <Card>
                    <CardContent className="pt-6 text-center text-muted-foreground">
                      No submissions found. Start by creating one!
                    </CardContent>
                  </Card>
                ) : (
                  <div className="space-y-4">
                    {items.map((item) => (
                      <Card key={item._id}>
                        <CardContent className="pt-6">
                          {editingId === item._id ? (
                            <div className="space-y-4">
                              <div className="space-y-2">
                                <Label htmlFor="edit-title">Title</Label>
                                <Input
                                  id="edit-title"
                                  value={editTitle}
                                  onChange={(e) => setEditTitle(e.target.value)}
                                />
                              </div>
                              <div className="space-y-2">
                                <Label htmlFor="edit-description">Description</Label>
                                <Textarea
                                  id="edit-description"
                                  value={editDescription}
                                  onChange={(e) => setEditDescription(e.target.value)}
                                />
                              </div>
                              {item.type === 'text' ? (
                                <div className="space-y-2">
                                  <Label htmlFor="edit-text">Content</Label>
                                  <Textarea
                                    id="edit-text"
                                    value={editText}
                                    onChange={(e) => setEditText(e.target.value)}
                                    className="min-h-[200px]"
                                  />
                                </div>
                              ) : (
                                <div className="space-y-2">
                                  <Label htmlFor="edit-content-url">Content URL</Label>
                                  <Input
                                    id="edit-content-url"
                                    value={editContentUrl}
                                    onChange={(e) => setEditContentUrl(e.target.value)}
                                    placeholder="https://example.com/content"
                                  />
                                </div>
                              )}
                              <div className="flex justify-end space-x-2">
                                <Button variant="outline" onClick={cancelEdit}>
                                  Cancel
                                </Button>
                                <Button onClick={() => saveEdit(item._id, item.type)}>
                                  Save Changes
                                </Button>
                              </div>
                            </div>
                          ) : (
                            <div>
                              <CardHeader className="p-0 pb-4">
                                <div className="flex justify-between items-start">
                                  <div>
                                    <CardTitle className="text-xl">{item.title}</CardTitle>
                                    <CardDescription className="line-clamp-2">
                                      {item.description}
                                    </CardDescription>
                                  </div>
                                  <Button 
                                    variant="outline" 
                                    size="sm"
                                    onClick={() => startEdit(item)}
                                  >
                                    Edit
                                  </Button>
                                </div>
                              </CardHeader>
                              
                              <div className="mt-4">
                                {item.type === 'video' && item.contentUrl && (
                                  <video 
                                    src={mediaSrc(item.contentUrl)} 
                                    controls 
                                    className="w-full rounded" 
                                  />
                                )}
                                {item.type === 'audio' && item.contentUrl && (
                                  <audio 
                                    src={mediaSrc(item.contentUrl)} 
                                    controls 
                                    className="w-full" 
                                  />
                                )}
                                {item.type === 'image' && item.contentUrl && (
                                  <img 
                                    src={mediaSrc(item.contentUrl)} 
                                    alt={item.title} 
                                    className="w-full h-auto rounded" 
                                  />
                                )}
                                {item.type === 'pdf' && item.contentUrl && (
                                  <div className="w-full h-[600px]">
                                    <iframe 
                                      src={mediaSrc(item.contentUrl)} 
                                      className="w-full h-full" 
                                      title={item.title}
                                    />
                                  </div>
                                )}
                                {item.type === 'text' && item.text && (
                                  <div className="prose max-w-none">
                                    {item.text}
                                  </div>
                                )}
                              </div>

                              {item.consent && (
                                <div className="mt-4 p-4 bg-muted/50 rounded-md">
                                  <h4 className="font-medium mb-2">Consent Information</h4>
                                  <div className="text-sm space-y-1">
                                    <div>
                                      <span className="text-muted-foreground">Status:</span>{' '}
                                      <span className="font-medium">
                                        {item.consent.given ? 'Consent Given' : 'No Consent'}
                                      </span>
                                    </div>
                                    {item.consent.name && (
                                      <div>
                                        <span className="text-muted-foreground">Name:</span>{' '}
                                        {item.consent.name}
                                      </div>
                                    )}
                                    {item.consent.relation && (
                                      <div>
                                        <span className="text-muted-foreground">Relation:</span>{' '}
                                        {item.consent.relation}
                                      </div>
                                    )}
                                  </div>
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
          </TabsContent>

          <TabsContent value="collaboration">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {/* Profile Card */}
              <div className="md:col-span-1">
                <Card>
                  <CardHeader>
                    <div className="flex flex-col items-center space-y-4">
                      <div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                        {user?.avatar ? (
                          <img 
                            src={mediaSrc(user.avatar)} 
                            alt="Profile" 
                            className="w-full h-full object-cover" 
                          />
                        ) : (
                          <span className="text-2xl">👤</span>
                        )}
                      </div>
                      <div className="text-center">
                        <h2 className="text-xl font-bold">{user?.name || 'User'}</h2>
                        <p className="text-sm text-muted-foreground">{user?.email}</p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <Button 
                      variant="outline" 
                      className="w-full" 
                      onClick={logout}
                    >
                      Logout
                    </Button>
                  </CardContent>
                </Card>
              </div>

              {/* Collaboration Content */}
              <div className="md:col-span-3 space-y-6">
                <h1 className="text-3xl font-bold">Collaboration</h1>
                <div className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>Collaboration Requests</CardTitle>
                      <CardDescription>
                        Manage your collaboration requests and connect with other users.
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      {user ? (
                        <RequestCollaboration 
                          userId={user._id}
                          userName={user.name || 'User'}
                          category="general"
                          onSuccess={() => {
                            toast({
                              title: 'Success',
                              description: 'Collaboration request sent successfully!',
                            });
                          }}
                        />
                      ) : (
                        <div>Loading user information...</div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
      <Footer />
    </div>
  );
};

export default Profile;
