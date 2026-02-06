/**
 * Performs a hard reload by clearing caches and service workers
 * All operations are best-effort and won't throw exceptions
 */
export async function hardReload(): Promise<void> {
  try {
    // Clear Cache Storage entries
    if ('caches' in window) {
      try {
        const cacheNames = await caches.keys();
        await Promise.all(
          cacheNames.map(cacheName => caches.delete(cacheName))
        );
      } catch (error) {
        console.warn('Failed to clear caches:', error);
      }
    }

    // Unregister service workers
    if ('serviceWorker' in navigator) {
      try {
        const registrations = await navigator.serviceWorker.getRegistrations();
        await Promise.all(
          registrations.map(registration => registration.unregister())
        );
      } catch (error) {
        console.warn('Failed to unregister service workers:', error);
      }
    }
  } catch (error) {
    console.warn('Hard reload preparation failed:', error);
  }

  // Reload the page
  window.location.reload();
}
