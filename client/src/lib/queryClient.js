import { QueryClient } from "@tanstack/react-query";
import { fetchWithTimeout, handleApiError } from './api-helper';

async function throwIfResNotOk(res) {
  if (!res.ok) {
    const text = await res.text() || res.statusText;
    throw new Error(`${res.status}: ${text}`);
  }
}

export async function apiRequest(method, url, data, options = {}) {
  try {
    // Use absolute URL if the URL doesn't start with /
    const apiUrl = url.startsWith('/') ? url : `/${url}`;
    
    // Default timeout is 10 seconds, but can be overridden
    const timeout = options.timeout || 10000;
    
    const res = await fetchWithTimeout(apiUrl, {
      method,
      headers: data ? { "Content-Type": "application/json" } : {},
      body: data ? JSON.stringify(data) : undefined,
      credentials: "include",
    }, timeout);
    
    await throwIfResNotOk(res);
    return res;
  } catch (error) {
    console.error(`API Request Error (${method} ${url}):`, error);
    throw error;
  }
}

export const getQueryFn = ({ on401 }) => async ({ queryKey }) => {
  try {
    const res = await fetchWithTimeout(queryKey[0], {
      credentials: "include",
    });
    
    if (on401 === "returnNull" && res.status === 401) {
      return null;
    }
    
    await throwIfResNotOk(res);
    return await res.json();
  } catch (error) {
    console.error(`Query Error (${queryKey[0]}):`, error);
    throw error;
  }
};

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: 30000, // 30 seconds instead of Infinity to ensure data freshness
      retry: 2, // Retry failed requests up to 2 times
    },
    mutations: {
      retry: 1, // Retry failed mutations once
      onError: (error) => {
        console.error("Mutation error:", error);
      }
    },
  },
});