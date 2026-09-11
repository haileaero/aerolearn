# AeroLearn 2.5 — Command Center

This pass makes the Admin/Instructor side visibly more operational and compact.

## Major changes
- Rebuilt Admin/Instructor Dashboard as an academic command center.
- Added compact live metric rail, academic pulse visualization, priority desk, workspace-health panel and today's-focus panel.
- Rebuilt Course Management from oversized image cards into a dense professional catalog table.
- Course create/edit form is now collapsible so it does not permanently consume the screen.
- Added compact status metrics, search, department/status filters, status pills and icon actions.
- Preserved existing APIs and database schema; no fake data or new backend dependency was introduced.
- Added responsive layouts for command center and course catalog.

## Verification
Run `npm install` in client and server on the target machine, then `npm run lint` and `npm run build` in client.
