# Specification

## Summary
**Goal:** Fix the secretary Settings page dirty-check so edits to Maintenance Amount, Society UPI ID, or Guard Mobile Number are detected correctly and the configuration can be saved reliably.

**Planned changes:**
- Update `frontend/src/pages/secretary/SettingsPage.tsx` dirty-check logic to compare normalized values (trim text inputs; compare maintenance amount numerically) and only show “No changes to save” when values are effectively identical to the last loaded/saved baseline.
- Ensure the form’s dirty-check baseline refreshes when `useGetSecretarySettings()` returns new settings (refetch after save, or switching logged-in user), as long as there are no unsaved local edits.
- After a successful save, sync the displayed fields and the baseline to the saved (normalized) values so the Save button state remains correct.

**User-visible outcome:** On the secretary Settings page, changing any of the three configuration fields enables Save (when valid), “No changes to save” only appears when nothing effectively changed, and settings state stays correct after saves/refetches or logging in as a different user.
