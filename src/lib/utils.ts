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
        // Convert local upload paths to Cloudinary format
        const filename = u.replace(/^\/uploads\//, '');
        return `https://res.cloudinary.com/dvg3aiqmb/raw/upload/${filename}`;
      }
      return u;
    }

    // Handle Cloudinary URLs
    if (u.includes('res.cloudinary.com')) {
      const url = new URL(u);
      const path = url.pathname;
      
      // For Cloudinary URLs, ensure we're using the correct resource type
      const isPdf = /\.pdf(\?|#|$)/i.test(path);
      const isVideo = /\.(mp4|webm|ogg|mov|avi|m3u8)(\?|#|$)/i.test(path);
      
      // For PDFs, ensure we're using the raw/upload endpoint
      if (isPdf || isVideo) {
        // Rebuild the URL with the correct resource type
        const cloudName = 'dvg3aiqmb';
        const resourceType = isPdf ? 'raw' : 'video';
        const publicId = path.split('/').pop() || '';
        
        // Construct the new URL
        const newUrl = new URL(`https://res.cloudinary.com/${cloudName}/${resourceType}/upload/${publicId}`);
        
        // Preserve query parameters
        if (url.search) {
          newUrl.search = url.search;
        }
        
        // Add flags to prevent auto-download
        if (!newUrl.search) newUrl.search = '?';
        if (!newUrl.search.includes('dl=')) {
          newUrl.search += (newUrl.search === '?' ? '' : '&') + 'dl=0';
        }
        
        return newUrl.toString();
      }
      
      // For images, just ensure we have the right parameters
      const urlObj = new URL(u);
      if (!urlObj.search) urlObj.search = '?';
      if (!urlObj.search.includes('dl=')) {
        urlObj.search += (urlObj.search === '?' ? '' : '&') + 'dl=0';
      }
      return urlObj.toString();
    }

    // Handle local file paths (shouldn't normally happen, but just in case)
    if (!/^https?:\/\//i.test(u)) {
      // Treat as Cloudinary raw upload
      return `https://res.cloudinary.com/dvg3aiqmb/raw/upload/${u.replace(/^uploads\//, '')}`;
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
    // Return the original URL if there's an error
    return u;
  }
}

// Check if a URL points to a potentially downloadable file
export function isFileUrl(url: string): boolean {
  if (!url) return false;
  return /\.(pdf|docx?|xlsx?|pptx?|mp4|mp3|wav|ogg|mov|avi|webm|zip|rar|7z)(\?|#|$)/i.test(url);
}
