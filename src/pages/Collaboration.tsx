import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';

interface CollaborationRequest {
  id: string;
  requesterId: string;
  recipientId: string;
  requesterName: string;
  recipientName: string;
  category: string;
  status: 'pending' | 'accepted' | 'rejected';
  createdAt: string;
}

const Collaboration = () => {
  const { token, isAuthenticated } = useAuth();
  const [requests, setRequests] = useState<CollaborationRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchRequests = async () => {
    if (!isAuthenticated || !token) return;
    
    try {
      const response = await fetch('/api/collab/requests', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      setRequests(data);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to fetch collaboration requests',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleResponse = async (id: string, action: 'accept' | 'reject') => {
    try {
      const response = await fetch(`/api/collab/requests/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ action }),
      });

      if (!response.ok) throw new Error('Failed to update request');
      
      await fetchRequests();
      toast({
        title: 'Success',
        description: `Request ${action}ed successfully`,
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update request',
        variant: 'destructive',
      });
    }
  };

  useEffect(() => {
    fetchRequests();
  }, [isAuthenticated, token]);

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card>
          <CardHeader>
            <CardTitle>Authentication Required</CardTitle>
            <CardDescription>Please log in to view collaboration requests.</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div>Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Collaboration Requests</h1>
        
        {requests.length === 0 ? (
          <Card>
            <CardHeader>
              <CardTitle>No collaboration requests</CardTitle>
              <CardDescription>You don't have any collaboration requests yet.</CardDescription>
            </CardHeader>
          </Card>
        ) : (
          <div className="space-y-4">
            {requests.map((request) => (
              <Card key={request.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle>
                        {request.requesterName} wants to collaborate on {request.category}
                      </CardTitle>
                      <CardDescription>
                        Status: {request.status}
                      </CardDescription>
                    </div>
                    <div className="flex space-x-2">
                      {request.status === 'pending' && (
                        <>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleResponse(request.id, 'reject')}
                          >
                            Reject
                          </Button>
                          <Button 
                            size="sm"
                            onClick={() => handleResponse(request.id, 'accept')}
                          >
                            Accept
                          </Button>
                        </>
                      )}
                      {request.status === 'accepted' && (
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => window.location.href = `/chat/${request.requesterId}`}
                        >
                          Start Chat
                        </Button>
                      )}
                    </div>
                  </div>
                </CardHeader>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Collaboration;
