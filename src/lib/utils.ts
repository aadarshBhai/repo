import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Normalize media URLs and handle missing files gracefully
 * @param u The input URL or path
 * @returns A properly formatted Cloudinary URL or the original URL if it's already a valid URL
 */
export function mediaSrc(u?: string): string {
  if (!u) return "";
  
  try {
    // Debug log to see what URLs we're processing
    console.log(`Processing media URL: ${u}`);
    
    // If it's already a Cloudinary URL, ensure it's using the correct format
    if (u.includes('res.cloudinary.com')) {
      const url = new URL(u);
      // Ensure we're using the correct Cloudinary account
      if (url.hostname === 'res.cloudinary.com') {
        const pathParts = url.pathname.split('/').filter(Boolean);
        if (pathParts[0] !== 'dvg3aiqmb') {
          // If the Cloudinary account is different, update it
          pathParts[0] = 'dvg3aiqmb';
          url.pathname = pathParts.join('/');
          return url.toString();
        }
      }
      return u;
    }
    
    // Extract filename from different path formats
    let filename = '';
    
    // Handle paths with uploads/ prefix (with or without leading slash)
    if (u.includes('uploads/')) {
      filename = u.split('uploads/').pop() || '';
    } 
    // Handle bare filenames
    else if (!u.startsWith('http') && !u.startsWith('/') && u.includes('.')) {
      filename = u;
    }
    
    // If we have a valid filename, construct the Cloudinary URL
    if (filename) {
      // Determine resource type from file extension
      const ext = filename.split('.').pop()?.toLowerCase() || '';
      const isVideo = ['mp4', 'mov', 'avi', 'webm', 'm3u8'].includes(ext);
      const isPdf = ext === 'pdf';
      
      const resourceType = isVideo ? 'video' : (isPdf ? 'raw' : 'image');
      const cloudinaryUrl = `https://res.cloudinary.com/dvg3aiqmb/${resourceType}/upload/${filename}`;
      
      console.log(`Converted ${u} to Cloudinary URL: ${cloudinaryUrl}`);
      return cloudinaryUrl;
    }
    
    // If we can't determine the file type, try a generic approach
    if (u.startsWith('/') || !u.includes('://')) {
      const cleanUrl = u.replace(/^[\/]+/, '');
      return `https://res.cloudinary.com/dvg3aiqmb/raw/upload/${cleanUrl}`;
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
  
  // Check for common file extensions
  const isFile = /\.(pdf|docx?|xlsx?|pptx?|mp4|mp3|wav|ogg|mov|avi|webm|zip|rar|7z|jpe?g|png|gif|webp|bmp|svg)(\?|#|$)/i.test(url);
  
  // Also check for Cloudinary URLs with file extensions
  const isCloudinaryFile = url.includes('res.cloudinary.com') && 
    /\/(image|video|raw)\/upload\/.+?\.(pdf|docx?|xlsx?|pptx?|mp4|mp3|wav|ogg|mov|avi|webm|jpe?g|png|gif|webp|bmp|svg)(\?|#|$)/i.test(url);
  
  return isFile || isCloudinaryFile;
}
