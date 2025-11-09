import { lazy, Suspense } from 'react';
import { Loader2 } from 'lucide-react';

// Lazy load the Chat component
const Chat = lazy(() => import('./Chat'));

const ChatWidget = () => {
  return (
    <div className="fixed bottom-4 right-4 z-[9999]" style={{ zIndex: 9999 }}>
      <Suspense 
        fallback={
          <div className="w-14 h-14 bg-blue-600 rounded-full flex items-center justify-center shadow-lg">
            <Loader2 className="h-6 w-6 text-white animate-spin" />
          </div>
        }
      >
        <Chat />
      </Suspense>
    </div>
  );
};

export default ChatWidget;