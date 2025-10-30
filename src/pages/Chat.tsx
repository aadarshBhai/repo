import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/context/AuthContext';
import { io, Socket } from 'socket.io-client';

const Chat = () => {
  const { otherUserId } = useParams();
  const { token, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [allowed, setAllowed] = useState(false);
  const [checking, setChecking] = useState(true);
  const [message, setMessage] = useState('');
  const [history, setHistory] = useState<{ from: 'me' | 'them'; text: string }[]>([]);
  const [socket, setSocket] = useState<Socket | null>(null);

  useEffect(() => {
    const check = async () => {
      try {
        if (!isAuthenticated || !token || !otherUserId) return;
        const res = await fetch(`/api/collab/can-chat/${otherUserId}`, { headers: { Authorization: `Bearer ${token}` } });
        const data = await res.json();
        setAllowed(Boolean(data?.allowed));
      } catch (e: any) {
        toast({ title: 'Error', description: e.message || 'Failed to check', variant: 'destructive' });
      } finally {
        setChecking(false);
      }
    };
    check();
  }, [isAuthenticated, token, otherUserId]);

  useEffect(() => {
    if (!allowed || !token || !otherUserId) return;
    const wsUrl = import.meta.env.DEV ? 'http://localhost:5000' : undefined;
    const s = io(wsUrl ?? '/', { auth: { token } });
    setSocket(s);

    s.on('connect_error', (err: any) => {
      toast({ title: 'Socket error', description: err?.message || 'Failed to connect', variant: 'destructive' });
    });
    s.on('error', (payload: any) => {
      if (payload?.message) {
        toast({ title: 'Chat error', description: payload.message, variant: 'destructive' });
      }
    });
    s.on('joined', () => {
      // joined room OK
    });
    s.on('message', (m: { from: string; text: string }) => {
      setHistory((h) => [...h, { from: 'them', text: m.text }]);
    });

    s.emit('join', { otherUserId });

    return () => {
      s.disconnect();
      setSocket(null);
    };
  }, [allowed, token, otherUserId]);

  const send = () => {
    if (!allowed) return;
    if (!message.trim()) return;
    setHistory((h) => [...h, { from: 'me', text: message.trim() }]);
    socket?.emit('message', { otherUserId, text: message.trim() });
    setMessage('');
  };

  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex-1 py-12 px-4">
        <div className="container mx-auto max-w-3xl">
          <Card className="card-texture">
            <CardHeader>
              <CardTitle className="text-2xl">Chat</CardTitle>
              <CardDescription>
                {checking ? 'Checking permission...' : allowed ? 'You can chat.' : 'Chat disabled until collaboration is accepted.'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-72 overflow-auto rounded border p-3 mb-4 space-y-2 bg-background">
                {history.length === 0 ? (
                  <div className="text-sm text-muted-foreground">No messages yet.</div>
                ) : (
                  history.map((m, idx) => (
                    <div key={idx} className={m.from === 'me' ? 'text-right' : 'text-left'}>
                      <span className="inline-block px-3 py-1 rounded bg-secondary text-secondary-foreground">
                        {m.text}
                      </span>
                    </div>
                  ))
                )}
              </div>
              <div className="flex items-center gap-2">
                <Input
                  placeholder={allowed ? 'Type a message' : 'Chat disabled'}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  disabled={!allowed}
                />
                <Button onClick={send} disabled={!allowed}>Send</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Chat;
