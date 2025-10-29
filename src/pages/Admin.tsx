import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import Footer from "@/components/Footer";
import { FileText, CheckCircle, XCircle, Users } from "lucide-react";
import { mediaSrc } from "@/lib/utils";
 

const Admin = () => {
  const [activeSection, setActiveSection] = useState("pending");
  const navigate = useNavigate();
  const { toast } = useToast();
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const renderConsentPreview = (url: string) => {
    const u = mediaSrc(url);
    if (/(\.(png|jpe?g|gif|webp|bmp|svg)(\?|$))/i.test(u)) {
      return <img src={u} alt="Consent file" className="w-full h-auto rounded" />;
    }
    if (/(\.(mp4|webm|ogg)(\?|$))/i.test(u)) {
      return <video src={u} controls className="w-full rounded" />;
    }
    if (/(\.(mp3|wav|ogg)(\?|$))/i.test(u)) {
      return <audio src={u} controls className="w-full" />;
    }
    return (
      <div className="space-y-2">
        <iframe src={u} title="Consent preview" className="w-full h-64 md:h-80 border rounded" />
        <div>
          <a href={u} target="_blank" rel="noreferrer" className="underline text-primary text-sm">Open in new tab</a>
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
                {items.map((user) => (
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
                          <iframe
                            src={mediaSrc(item.contentUrl)}
                            title="PDF preview"
                            className="w-full h-80 border rounded"
                          />
                        </div>
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
                                {renderConsentPreview(String(item.consent.fileUrl))}
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
