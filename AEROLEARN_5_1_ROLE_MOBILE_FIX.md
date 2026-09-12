# AeroLearn 5.1 — Role Safety & Mobile Access Fix

- Student Announcement view is read-only: Publish/Edit/Delete/composer are staff-only.
- Shared role checks now normalize role casing to avoid accidental UI leakage.
- Role-safe checks applied to Sidebar, MobileDock, Announcements, and Learning Materials.
- Layout now exposes a data-role guard for CSS defense-in-depth.
- Mobile dock automatically hides while the sidebar drawer is open.
- Sidebar is raised above the dock/overlay and its navigation scrolls independently.
- Mobile account/sign-out panel is sticky at the bottom of the drawer and safe-area aware.
- Page/footer bottom spacing prevents the mobile dock from covering content.
- Student announcements use a simplified learner-focused header and filters.
- Footer version updated to v5.1.
- Route guards now compare roles case-insensitively and send students back to My Courses when blocked.
- Dashboard and Course Details use normalized role helpers on shared screens.
- Backend announcement reads use normalized roles and stronger student course eligibility checks.
