# AeroLearn 2.1 — Compact Professional Data UI

This version builds on AeroLearn 2.0 and focuses on making the application visibly cleaner, denser, more colorful, and easier to scan.

## Main changes
- Compact page spacing and smaller page titles/back controls.
- Compact form controls and multi-column forms where appropriate.
- New dense data-table system with coordinated blue header bands.
- Alternating row tinting and hover highlighting for faster reading.
- Color-coded ID, role, and status pills.
- Small icon-based Open/Edit/Delete actions.
- Student page now uses four compact summary metrics instead of large cards.
- Student search and department filter are combined into one toolbar.
- User and Course tables use the same professional table system.
- Existing legacy tables inherit the denser table styling for visual consistency.
- Dashboard hero, stat cards, quick actions, panels, and course cards are reduced in height/padding.
- Responsive behavior retained for tablet and mobile layouts.

## Verification
- ESLint: 0 errors, 9 existing React hook dependency warnings.
- The clean package intentionally excludes node_modules and secrets.

## Local start
1. Configure client/server environment files from the included .env.example files.
2. Run `npm install` in client and server folders.
3. Start server and client using their package scripts.
