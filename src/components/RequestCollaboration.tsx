import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/context/AuthContext';

interface RequestCollaborationProps {
  userId: string;
  userName: string;
  category: string;
  onSuccess?: () => void;
}

const RequestCollaboration = ({ userId, userName, category, onSuccess }: RequestCollaborationProps) => {
  const [loading, setLoading] = useState(false);
  const { token } = useAuth();
  const { toast } = useToast();
  const [message, setMessage] = useState(`Hi ${userName}, I'd like to collaborate with you on ${category}`);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    
    setLoading(true);
    try {
      const response = await fetch('/api/collab/requests', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          recipientId: userId,
          category,
          message,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.errors?.[0]?.msg || 'Failed to send request');
      }

      toast({
        title: 'Request Sent',
        description: `Your collaboration request has been sent to ${userName}`,
      });

      if (onSuccess) onSuccess();
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to send request',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="message">Message</Label>
        <Input
          id="message"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Enter your message..."
          required
        />
      </div>
      <Button type="submit" disabled={loading}>
        {loading ? 'Sending...' : 'Send Collaboration Request'}
      </Button>
    </form>
  );
};

export default RequestCollaboration;
