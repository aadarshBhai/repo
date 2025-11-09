import { toast } from "@/components/ui/use-toast";

// Get the API base URL from environment variables
const API_BASE_URL = import.meta.env.VITE_API_URL || '';

export async function authFetch(url: string, options: RequestInit = {}) {
  const token = localStorage.getItem('auth_token');
  
  // Prepend the API base URL if the URL is not absolute
  const fullUrl = url.startsWith('http') ? url : `${API_BASE_URL}${url}`;
  
  // Set default headers
  const headers = new Headers(options.headers);
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }
  if (!headers.has('Content-Type') && !(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }

  try {
    const response = await fetch(fullUrl, {
      ...options,
      headers,
      credentials: 'include', // Important for cookies if using httpOnly
    });

    // Handle 401 Unauthorized
    if (response.status === 401) {
      // Try to refresh token
      const refreshResponse = await fetch(`${API_BASE_URL}/auth/refresh-token`, {
        method: 'POST',
        credentials: 'include',
      });

      if (refreshResponse.ok) {
        const data = await refreshResponse.json();
        if (data.token) {
          localStorage.setItem('auth_token', data.token);
          // Retry the original request with new token
          headers.set('Authorization', `Bearer ${data.token}`);
          const retryResponse = await fetch(fullUrl, {
            ...options,
            headers,
            credentials: 'include',
          });
          return retryResponse;
        }
      }

      // If refresh fails, redirect to login
      localStorage.removeItem('auth_token');
      window.location.href = `/login?redirect=${encodeURIComponent(window.location.pathname)}`;
      throw new Error('Session expired. Please log in again.');
    }

    // Handle other error statuses
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const errorMessage = errorData.message || 'An error occurred';
      
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
      
      throw new Error(errorMessage);
    }

    return response;
  } catch (error) {
    console.error('API call failed:', error);
    throw error;
  }
}

// Helper function for GET requests
export async function get(url: string, options: RequestInit = {}) {
  const response = await authFetch(url, { ...options, method: 'GET' });
  return response.json();
}

// Helper function for POST requests
export async function post(url: string, data: any, options: RequestInit = {}) {
  const isFormData = data instanceof FormData;
  const body = isFormData ? data : JSON.stringify(data);
  
  const response = await authFetch(url, {
    ...options,
    method: 'POST',
    body,
  });
  
  return response.json();
}

// Add other HTTP methods as needed (PUT, DELETE, etc.)
