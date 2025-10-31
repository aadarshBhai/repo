import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Normalize media URLs and handle missing files gracefully
export function mediaSrc(u?: string): string {
  if (!u) return "";
  
  try {
    // If it's already a relative path, ensure it has the correct prefix
    if (u.startsWith("/")) {
      // Check if it's a local upload path
      if (u.startsWith("/uploads/")) {
        // For local uploads, we'll handle the missing file case in the UI
        return u;
      }
      return u;
    }

    // Handle Cloudinary URLs
    if (u.includes('res.cloudinary.com')) {
      const url = new URL(u);
      const path = url.pathname;
      
      // For PDFs, ensure we're using the raw/upload endpoint
      if (/\.pdf(\?|#|$)/i.test(path)) {
        // Check if the URL has the /uploads/ segment which might be causing 404
        const pathParts = path.split('/');
        const uploadsIndex = pathParts.findIndex(part => part === 'uploads');
        
        if (uploadsIndex > -1) {
          // Rebuild the path without the /uploads/ segment
          const newPath = [...pathParts.slice(0, uploadsIndex), ...pathParts.slice(uploadsIndex + 1)].join('/');
          url.pathname = newPath;
          u = url.toString();
        }
        
        // Ensure we're using the raw/upload endpoint
        return u.replace(/\/(image|video)\/upload\//i, "/raw/upload/");
      }
      
      // Add parameters to prevent auto-download for Cloudinary
      if (!url.search) {
        url.search = '?'; 
      } else if (!url.search.endsWith('&')) {
        url.search += '&';
      }
      
      // Add flags to prevent auto-download
      url.search += 'dl=0&_i=AA';
      
      return url.toString();
    }

    // Handle local file paths
    if (!/^https?:\/\//i.test(u)) {
      // This is a bare filename, treat as local upload
      return `/uploads/${u.replace(/^uploads\//, '')}`;
    }

    // For other URLs, return as-is but add no-download params if it's a direct file
    const url = new URL(u);
    if (/\.(pdf|docx?|xlsx?|pptx?|mp4|mp3|wav|ogg|mov|avi|webm|zip|rar|7z)(\?|#|$)/i.test(url.pathname)) {
      if (!url.search) url.search = '?';
      if (!url.search.includes('dl=')) {
        url.search += (url.search === '?' ? '' : '&') + 'dl=0';
      }
      return url.toString();
    }

    return u;
  } catch (error) {
    console.error('Error processing media URL:', error);
    return u;
  }
}

// Check if a URL points to a potentially downloadable file
export function isFileUrl(url: string): boolean {
  if (!url) return false;
  return /\.(pdf|docx?|xlsx?|pptx?|mp4|mp3|wav|ogg|mov|avi|webm|zip|rar|7z)(\?|#|$)/i.test(url);
}
