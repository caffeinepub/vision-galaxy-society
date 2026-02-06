# Specification

## Summary
**Goal:** Prevent Draft/Preview from ever showing a fully blank screen by adding an HTML-level startup fallback, improved pre-React diagnostics, and refreshed service worker caching behavior.

**Planned changes:**
- Add an HTML startup fallback UI in `frontend/index.html` that shows immediately before React mounts, then hides when the app successfully bootstraps.
- Implement a short bootstrap timeout (e.g., 5–10 seconds) that switches the fallback into an error state if React/JS does not mount in time, with Reload and Hard Reload (Clear Cache) actions.
- Add pre-React startup diagnostics: console logging from `index.html` and a short English on-screen hint when a script error or unhandled rejection occurs before React mounts.
- Bump the service worker cache version in `frontend/public/sw.js` and adjust fetch handling to ensure cached `index.html` is only used for true navigation/document requests (not scripts/styles/assets/modules).

**User-visible outcome:** Opening the Draft/Preview URL will always show either the app or a visible HTML fallback (never a blank page). If startup fails, the user sees an English error hint plus Reload and Hard Reload (Clear Cache) options to recover.
