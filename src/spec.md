# Specification

## Summary
**Goal:** Build “Vision Galaxy Society” as an easy-to-use, role-based society management app for flats 1–23, covering maintenance payments (UPI deep link + status tracking), overdue reminders, expenditures, complaints, notices, and guard visitor requests via WhatsApp deep links.

**Planned changes:**
- Add role-based authentication with seeded accounts: Flat Owners (userId “1”–“23”, default password “Admin1”), plus Secretary and Guard accounts shown in the UI.
- Add in-app change password flow requiring current password.
- Implement maintenance tracking per month/per flat with statuses (Unpaid/Submitted/Approved/Rejected), UPI deep-link payment initiation, user submission of UTR + payment date/time, and secretary approve/reject workflow.
- Show automatic in-app overdue reminders on/after the 6th of the month for flats without an Approved payment; provide a secretary overdue view.
- Add monthly expenditure entry (secretary) with line items, totals, and optional notes; add read-only expenditure viewing by month for Flat Owners.
- Add secretary settings to configure the receiving UPI ID and the WhatsApp sender number used in visitor-request links.
- Add Flat Owner profile management for up to 4 mobile numbers (add/edit/remove; enforce max 4) and expose these numbers where needed for guard/secretary workflows.
- Implement complaints: Flat Owner lodging + status visibility; secretary list/filter + status updates + resolution notes visible to the user.
- Implement notices/announcements: secretary create (optional expiry), all users view feed + detail, hide expired notices.
- Implement guard visitor request workflow: create request for a flat with visitor name/purpose, generate WhatsApp deep link to selected flat number, and allow Flat Owner to accept/decline in-app with guard-side status/timestamp updates.
- Create role-based dashboards and straightforward navigation per role, and apply a coherent “Vision Galaxy Society” visual theme (not blue/purple) across screens.

**User-visible outcome:** Users can log in as Flat Owner/Secretary/Guard, see a role-appropriate dashboard, change their password, manage maintenance payments and overdue statuses, view or publish expenditures and notices, lodge and track complaints, and handle visitor approvals (guard via WhatsApp link, flat owner accepts/declines in-app) with all content presented in a consistent themed UI.
