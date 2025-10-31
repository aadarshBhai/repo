import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import Footer from "@/components/Footer";
import { FileText, CheckCircle, XCircle, Users } from "lucide-react";
import { mediaSrc, isFileUrl } from "@/lib/utils";
 

const Admin = () => {
  const [activeSection, setActiveSection] = useState("pending");
  const navigate = useNavigate();
  const { toast } = useToast();
  interface Submission {
    _id: string;
    title: string;
    description?: string;
    type?: string;
    contentUrl?: string;
    text?: string;
    status: string;
    consent?: {
      name: string;
      given: boolean;
      relation?: string;
      fileUrl?: string;
    };
    category?: string;
    tribe?: string;
    createdAt?: string;
  }

  interface User {
    _id: string;
    name?: string;
    email: string;
    createdAt?: string;
  }

  const [items, setItems] = useState<Array<Submission | User>>([]);
  const [loading, setLoading] = useState(false);

  const renderFilePreview = (url: string, type?: string) => {
    // Handle empty or invalid URLs
    if (!url) {
      return (
        <div className="p-4 text-center text-sm text-muted-foreground bg-muted/20 rounded">
          File not available
        </div>
      );
    }
    
    // Process the URL through mediaSrc utility
    const u = mediaSrc(url);
    
    // Handle invalid URL after processing
    if (!u) {
      return (
        <div className="p-4 text-center text-sm text-muted-foreground bg-muted/20 rounded">
          Could not load file: {url.length > 50 ? `${url.substring(0, 50)}...` : url}
        </div>
      );
    }
    
    // Check file type
    const isPdf = /\.pdf(\?|$)/i.test(u);
    const isImage = /(\.(png|jpe?g|gif|webp|bmp|svg)(\?|$))/i.test(u);
    const isVideo = /(\.(mp4|webm|ogg|mov|avi)(\?|$))/i.test(u);
    const isAudio = /(\.(mp3|wav|ogg)(\?|$))/i.test(u);
    
    // Handle PDF files
    if (isPdf) {
      // For PDFs, show a preview with download button instead of auto-rendering
      return (
        <div className="space-y-2">
          <div className="p-4 border rounded bg-muted/20 text-center">
            <FileText className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
            <p className="text-sm text-muted-foreground mb-3">PDF Document</p>
            <div className="flex flex-col sm:flex-row gap-2 justify-center">
              <a 
                href={u} 
                target="_blank" 
                rel="noopener noreferrer nofollow"
                className="px-3 py-1.5 text-sm bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
                onClick={(e) => e.stopPropagation()}
              >
                View PDF
              </a>
              <a 
                href={`${u}${u.includes('?') ? '&' : '?'}dl=1`} 
                download
                className="px-3 py-1.5 text-sm border rounded-md hover:bg-muted transition-colors"
                onClick={(e) => e.stopPropagation()}
              >
                Download
              </a>
            </div>
          </div>
        </div>
      );
    }

    if (isImage) {
      return (
        <img 
          src={u} 
          alt="File preview" 
          className="w-full h-auto rounded" 
          onError={(e) => {
            const el = e.target as HTMLImageElement;
            el.outerHTML = '<div class="p-4 text-center text-sm text-muted-foreground bg-muted/20 rounded">Image not found</div>';
          }}
        />
      );
    }

    if (isVideo) {
      return (
        <div className="relative">
          <video 
            src={u} 
            controls 
            className="w-full rounded"
            onError={(e) => {
              const el = e.target as HTMLVideoElement;
              el.outerHTML = '<div class="p-4 text-center text-sm text-muted-foreground bg-muted/20 rounded">Video not found</div>';
            }}
          />
        </div>
      );
    }

    if (isAudio) {
      return (
        <div className="relative">
          <audio 
            src={u} 
            controls 
            className="w-full"
            onError={(e) => {
              const el = e.target as HTMLAudioElement;
              el.outerHTML = '<div class="p-4 text-center text-sm text-muted-foreground bg-muted/20 rounded">Audio not found</div>';
            }}
          />
        </div>
      );
    }

    // For other file types, show a download link
    return (
      <div className="space-y-2">
        <div className="p-4 border rounded bg-muted/20 text-center">
          <FileText className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
          <p className="text-sm text-muted-foreground mb-3">Document</p>
          <a 
            href={u} 
            target="_blank" 
            rel="noopener noreferrer"
            className="inline-block px-3 py-1.5 text-sm bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
            onClick={(e) => e.stopPropagation()}
          >
            View File
          </a>
        </div>
      </div>
    );
  };

  const fetchItems = async (status: string) => {
    try {
      setLoading(true);
      const token = typeof window !== 'undefined' ? localStorage.getItem('adminToken') : null;
      const url = status === 'users'
        ? `/api/admin/users`
        : `/api/admin/submissions?status=${encodeURIComponent(status)}`;
      const res = await fetch(url, {
        headers: { Authorization: token ? `Bearer ${token}` : '' }
      });
      if (res.status === 401 || res.status === 403) {
        navigate('/admin/login', { replace: true });
        return;
      }
      const data = await res.json();
      if (!res.ok) throw new Error(data?.errors?.[0]?.msg || 'Failed to load');
      setItems(Array.isArray(data) ? data : []);
    } catch (e: any) {
      toast({ title: 'Error', description: e.message || 'Failed to load submissions', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const deleteItem = async (id: string) => {
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('adminToken') : null;
      if (!token) {
        navigate('/admin/login', { replace: true });
        return;
      }
      const ok = window.confirm('Are you sure you want to delete this submission? This cannot be undone.');
      if (!ok) return;
      const res = await fetch(`/api/admin/submissions/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.errors?.[0]?.msg || 'Delete failed');
      toast({ title: 'Deleted' });
      fetchItems(activeSection);
    } catch (e: any) {
      toast({ title: 'Error', description: e.message || 'Delete failed', variant: 'destructive' });
    }
  };

  useEffect(() => {
    fetchItems(activeSection);
  }, [activeSection]);

  const actOn = async (id: string, action: 'approve' | 'reject') => {
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('adminToken') : null;
      const res = await fetch(`/api/admin/submissions/${id}/${action}`, {
        method: 'PATCH',
        headers: { Authorization: token ? `Bearer ${token}` : '' }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.errors?.[0]?.msg || 'Action failed');
      toast({ title: `Marked as ${action}` });
      fetchItems(activeSection);
    } catch (e: any) {
      toast({ title: 'Error', description: e.message || 'Action failed', variant: 'destructive' });
    }
  };

  const handleLogout = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('adminToken');
    }
    navigate('/admin/login', { replace: true });
  };

  const menuItems = [
    { id: "pending", label: "Pending Submissions", icon: FileText },
    { id: "approved", label: "Approved Content", icon: CheckCircle },
    { id: "rejected", label: "Rejected Content", icon: XCircle },
    { id: "users", label: "User Management", icon: Users },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex flex-1">
        {/* Sidebar */}
        <aside className="w-64 bg-card p-6">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-heading font-bold text-primary">
              Admin Panel
            </h2>
            <Button variant="destructive" size="sm" onClick={handleLogout}>
              Logout
            </Button>
          </div>
          <nav className="space-y-2">
            {menuItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveSection(item.id)}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                    activeSection === item.id
                      ? "bg-primary text-primary-foreground"
                      : "hover:bg-muted text-foreground"
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="text-sm font-medium">{item.label}</span>
                </button>
              );
            })}
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-8">
          <div className="max-w-7xl mx-auto">
            <h1 className="text-4xl font-heading font-bold text-primary mb-8">
              {menuItems.find(item => item.id === activeSection)?.label}
            </h1>

            {loading ? (
              <p className="text-muted-foreground">Loading...</p>
            ) : items.length === 0 ? (
              <p className="text-muted-foreground">No items to display.</p>
            ) : activeSection === 'users' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {(items as User[]).map((user) => (
                  <Card key={user._id} className="card-texture">
                    <CardHeader>
                      <CardTitle className="text-xl line-clamp-1">{user.name || 'Unnamed User'}</CardTitle>
                      <CardDescription className="line-clamp-2">{user.email}</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-muted-foreground">Joined: {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : '-'}</span>
                        <div className="flex gap-2">
                          <Button size="sm" variant="destructive" onClick={() => deleteItem(user._id)}>Delete User</Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {(items as Submission[]).map((item) => (
                  <Card key={item._id} className="card-texture">
                    <CardHeader>
                      <CardTitle className="text-xl line-clamp-1">{item.title}</CardTitle>
                      <CardDescription className="line-clamp-2">{item.description}</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {item.contentUrl ? (
                        renderFilePreview(item.contentUrl, item.type)
                      ) : item.type === 'text' && item.text ? (
                        <p className="text-sm leading-relaxed whitespace-pre-wrap max-h-40 overflow-auto">{item.text}</p>
                      ) : (
                        <p className="text-sm text-muted-foreground">No preview available.</p>
                      )}

                      {item.consent && (
                        <div className="p-2 bg-muted rounded text-sm space-y-1 mt-2">
                          <p><strong>Consent Name:</strong> {item.consent.name}</p>
                          <p><strong>Consent Given:</strong> {item.consent.given ? "Yes" : "No"}</p>
                          {item.consent.relation && <p><strong>Relation:</strong> {item.consent.relation}</p>}
                          {item.consent.fileUrl && (
                            <div className="space-y-2">
                              <p className="font-medium">Consent File</p>
                              <div className="rounded border bg-background p-2">
                                {renderFilePreview(String(item.consent.fileUrl), 'pdf')}
                              </div>
                            </div>
                          )}
                        </div>
                      )}

                      <div className="flex items-center justify-between">
                        <span className="text-xs uppercase tracking-wide text-muted-foreground">{item.status}</span>
                        {activeSection === 'pending' && (
                          <div className="flex gap-2">
                            <Button size="sm" variant="default" onClick={() => actOn(item._id, 'approve')}>Approve</Button>
                            <Button size="sm" variant="destructive" onClick={() => actOn(item._id, 'reject')}>Reject</Button>
                          </div>
                        )}
                        {activeSection === 'approved' && (
                          <div className="flex gap-2">
                            <Button size="sm" variant="destructive" onClick={() => deleteItem(item._id)}>Delete</Button>
                          </div>
                        )}
                      </div>

                      <div className="flex flex-wrap gap-2 text-xs">
                        {item.category && (
                          <span className="px-2 py-1 rounded bg-muted text-foreground">Category: {String(item.category)}</span>
                        )}
                        {item.tribe && (
                          <span className="px-2 py-1 rounded bg-muted text-foreground">Tribe: {String(item.tribe)}</span>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </main>
      </div>
      <Footer />
    </div>
  );
};

export default Admin;
