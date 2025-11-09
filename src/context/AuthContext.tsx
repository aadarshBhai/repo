import { createContext, useCallback, useContext, useMemo, useState, useEffect } from 'react';
import { toast } from '@/components/ui/use-toast';

interface User {
  id: string;
  name: string;
  email: string;
  createdAt: string;
}

interface AuthContextType {
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (token: string) => void;
  logout: () => void;
  refreshToken: () => Promise<boolean>;
  user: User | null;
  setUser: (user: User | null) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Create a custom authFetch function that uses the token from the context
const createAuthFetch = (token: string | null) => async (url: string, options: RequestInit = {}) => {
  const headers = new Headers(options.headers);
  
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }
  
  if (!headers.has('Content-Type') && !(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }

  const response = await fetch(`/api${url}`, {
    ...options,
    headers,
    credentials: 'include',
  });

  // Handle 401 Unauthorized
  if (response.status === 401) {
    // Try to refresh token
    const refreshResponse = await fetch('/api/auth/refresh-token', {
      method: 'POST',
      credentials: 'include',
    });

    if (refreshResponse.ok) {
      const data = await refreshResponse.json();
      if (data.token) {
        localStorage.setItem('auth_token', data.token);
        // Retry the original request with new token
        headers.set('Authorization', `Bearer ${data.token}`);
        return fetch(`/api${url}`, {
          ...options,
          headers,
          credentials: 'include',
        });
      }
    }

    // If refresh fails, clear auth state
    localStorage.removeItem('auth_token');
    window.location.href = '/login';
    throw new Error('Session expired. Please log in again.');
  }

  return response;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string | null>(() => {
    try {
      return localStorage.getItem('auth_token');
    } catch {
      return null;
    }
  });
  
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // Derive isAuthenticated from token and user
  const isAuthenticated = useMemo(() => {
    const hasToken = !!token;
    const hasUser = !!user;
    console.log('isAuthenticated check:', { hasToken, hasUser });
    return hasToken && hasUser;
  }, [token, user]);
  
  // Debug log when auth state changes
  useEffect(() => {
    console.log('Auth state updated:', { token, user, isAuthenticated });
  }, [token, user, isAuthenticated]);

  // Function to validate token on app load
  const validateToken = useCallback(async () => {
    const storedToken = localStorage.getItem('auth_token');
    console.log('validateToken called with token:', !!storedToken);
    
    if (!storedToken) {
      console.log('No token found in storage');
      setIsLoading(false);
      return false;
    }

    try {
      // Set the token in state first
      setToken(storedToken);
      
      // Create an authFetch instance with the stored token
      const authFetch = createAuthFetch(storedToken);
      
      // Validate the token with the server
      console.log('Validating token with server...');
      const response = await authFetch('/auth/me');
      
      if (response.ok) {
        const userData = await response.json();
        console.log('Token validation successful, user data:', userData);
        setUser(userData);
        return true;
      } else {
        console.log('Token validation failed, clearing auth state');
        // If token is invalid, clear it from state and storage
        setToken(null);
        setUser(null);
        localStorage.removeItem('auth_token');
        return false;
      }
    } catch (error) {
      console.error('Token validation error:', error);
      // On network errors, keep the user logged in but show a warning
      toast({
        title: 'Connection Error',
        description: 'Unable to verify session. Working in offline mode.',
        variant: 'destructive',
      });
      return true; // Keep the user logged in
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Check token on initial load
  useEffect(() => {
    const checkAuth = async () => {
      const isValid = await validateToken();
      if (!isValid) {
        const currentPath = window.location.pathname;
        if (currentPath !== '/login' && currentPath !== '/signup') {
          window.location.href = `/login?redirect=${encodeURIComponent(currentPath)}`;
        }
      }
    };
    
    checkAuth();
  }, [validateToken]);

  const login = useCallback(async (t: string) => {
    try {
      const v = String(t);
      // First set the token in state and storage
      setToken(v);
      localStorage.setItem('auth_token', v);
      
      // Create an authFetch instance with the new token
      const authFetch = createAuthFetch(v);
      
      // Fetch user data after login
      const response = await authFetch('/auth/me');

      if (response.ok) {
        const userData = await response.json();
        // Update user state
        setUser(userData);
        
        // Debug log
        console.log('Login successful, user data:', userData);
        
        // Redirect to profile page after successful login
        window.location.href = '/profile';
        return true;
      } else {
        console.error('Failed to fetch user data after login');
        // If we can't fetch user data, clear the token
        localStorage.removeItem('auth_token');
        setToken(null);
        setUser(null);
        return false;
      }
    } catch (error) {
      console.error('Error during login:', error);
      // Clear any partial state on error
      localStorage.removeItem('auth_token');
      setToken(null);
      setUser(null);
      return false;
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      // Call logout API if needed
      if (token) {
        const authFetch = createAuthFetch(token);
        await authFetch('/auth/logout', {
          method: 'POST',
        });
      }
    } catch (error) {
      console.error('Error during logout:', error);
    } finally {
      // Always clear auth state, even if the API call fails
      setToken(null);
      setUser(null);
      localStorage.removeItem('auth_token');
      
      // Redirect to home page after logout
      window.location.href = '/';
    }
  }, []);

  const refreshToken = useCallback(async (): Promise<boolean> => {
    try {
      const response = await fetch('/api/auth/refresh-token', {
        method: 'POST',
        credentials: 'include',
      });

      if (response.ok) {
        const data = await response.json();
        if (data.token) {
          setToken(data.token);
          localStorage.setItem('auth_token', data.token);
          
          // Fetch user data after token refresh
          const authFetch = createAuthFetch(data.token);
          const userResponse = await authFetch('/auth/me');
          if (userResponse.ok) {
            const userData = await userResponse.json();
            setUser(userData);
          }
          
          return true;
        }
      }
      return false;
    } catch (error) {
      console.error('Error refreshing token:', error);
      return false;
    }
  }, []);

  const value = useMemo(() => ({
    token,
    isAuthenticated,
    isLoading,
    login,
    logout,
    refreshToken,
    user,
    setUser,
  }), [token, isAuthenticated, isLoading, login, logout, refreshToken, user]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
