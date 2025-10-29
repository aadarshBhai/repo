import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Normalize media URLs so absolute localhost/backend URLs become relative
// This lets Netlify proxy '/uploads/*' to the backend seamlessly
export function mediaSrc(u?: string) {
  if (!u) return "";
  try {
    // If it's already a relative path, return as-is
    if (u.startsWith("/")) return u;
    // If it's a bare filename (no scheme, no leading slash), assume legacy local upload
    // and prefix with '/uploads/' so Netlify proxies to backend static server
    if (!/^https?:\/\//i.test(u)) {
      // Avoid double prefix if it already contains 'uploads/' without leading slash
      if (u.startsWith("uploads/")) return `/${u}`;
      return `/uploads/${u}`;
    }
    const url = new URL(u, typeof window !== 'undefined' ? window.location.origin : 'http://localhost');
    const path = `${url.pathname}${url.search}${url.hash}`;
    if (path.startsWith("/uploads/")) return path;
    return u;
  } catch {
    return u;
  }
}
