/**
 * Canonical URL utilities for production deployment
 * Handles canonical URL configuration and redirect logic
 */

/**
 * Get the configured canonical app URL from environment
 * Returns empty string if not configured
 */
export function getCanonicalUrl(): string {
  return import.meta.env.VITE_CANONICAL_APP_URL || '';
}

/**
 * Get the redirect target URL for ic0.app/?canisterId=... access
 * Returns canonical URL if configured, otherwise canister subdomain
 */
export function getRedirectTarget(canisterId: string): string {
  const canonical = getCanonicalUrl();
  if (canonical) {
    return canonical;
  }
  return `https://${canisterId}.ic0.app`;
}

/**
 * Extract base path from canonical URL
 * Examples:
 *   https://example.com -> /
 *   https://example.com/app -> /app
 *   https://example.com/app/ -> /app
 */
export function getCanonicalBasePath(): string {
  const canonical = getCanonicalUrl();
  if (!canonical) {
    return '/';
  }
  
  try {
    const url = new URL(canonical);
    let path = url.pathname;
    // Remove trailing slash unless it's the root
    if (path !== '/' && path.endsWith('/')) {
      path = path.slice(0, -1);
    }
    return path || '/';
  } catch {
    return '/';
  }
}

/**
 * Get the canonical origin (protocol + hostname + port)
 * Examples:
 *   https://example.com -> https://example.com
 *   https://example.com/app -> https://example.com
 *   https://example.com:8080/app -> https://example.com:8080
 */
export function getCanonicalOrigin(): string {
  const canonical = getCanonicalUrl();
  if (!canonical) {
    return '';
  }
  
  try {
    const url = new URL(canonical);
    return url.origin;
  } catch {
    return '';
  }
}

/**
 * Build a full URL by joining canonical URL with a relative path
 * Handles base paths correctly
 */
export function joinCanonicalUrl(relativePath: string): string {
  const canonical = getCanonicalUrl();
  if (!canonical) {
    return relativePath;
  }
  
  try {
    const url = new URL(canonical);
    // Ensure relative path starts with /
    const cleanPath = relativePath.startsWith('/') ? relativePath : `/${relativePath}`;
    // Join base path with relative path
    const fullPath = url.pathname === '/' 
      ? cleanPath 
      : url.pathname + cleanPath;
    
    return `${url.origin}${fullPath}`;
  } catch {
    return relativePath;
  }
}
