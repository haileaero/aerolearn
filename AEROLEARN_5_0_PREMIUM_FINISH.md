# AeroLearn 5.0 — Premium Finish

This release is based on AeroLearn 4.5 and keeps the student course/resource/results recovery fixes.

## Surprise upgrade
- Added a native-app style mobile bottom dock for Admin, Instructor, and Student roles.
- Added a new premium announcement studio with compact KPIs, course filtering, priority filtering, pinned updates, responsive composer and polished feed cards.
- Added downloadable PDF academic reports to My Results.
- Added a global premium finishing layer for hover states, tables, cards, page backgrounds, transitions and responsive behavior.

## Functional fixes
- Fixed announcement update field mismatch (the old controller wrote `content` / `targetAudience` while the schema/client use `message` / `audience`).
- Announcement creation now validates and stores the selected course and derives department from that course.
- Student announcements are now filtered server-side to the student's active/current eligible courses and student audience.
- Expired announcements are no longer returned in the active feed.
- Announcement course references are populated for better UI and filtering.
- Composer now includes the required Course field, preventing required-schema failures.
- Save/delete announcement actions use the existing AeroLearn toast/confirmation UX.

## Validation
- Frontend ESLint: 0 errors/warnings on `client/src`.
- Backend JavaScript syntax check: passed for all server JS files.

## Deployment
Both client and server changed. Redeploy both Render services:
- Frontend Static Site
- `aerolearn-api` backend

Keep `VITE_API_URL=https://aerolearn-api.onrender.com/api` in production.
