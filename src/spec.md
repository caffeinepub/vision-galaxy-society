# Specification

## Summary
**Goal:** Prevent the app from hanging on startup when loading the caller user profile fails by showing a clear error state with recovery actions.

**Planned changes:**
- Update the startup/auth gate UI to render an error screen when `useGetCallerUserProfile()` returns an error instead of staying on the “Setting up your profile...” loading spinner.
- Add a “Retry” action that re-attempts loading the profile using React Query refetch/invalidation so the app can proceed once the backend is reachable again.
- Add a “Logout” action in the startup error UI to let the user re-authenticate if the session/identity is in a bad state.
- Add a “Hard reload” action that best-effort clears app Cache Storage entries, attempts service worker unregister (if present), and reloads without uncaught exceptions.

**User-visible outcome:** If the app can’t load required startup data, users see an error screen (instead of infinite loading) with buttons to Retry, Logout, or Hard reload to recover and get the app opening again.
