# AeroLearn 3.1 — Assessment Stability + Product Furnish

## Assessment crash fix
- Hardened the one-page Assessment Hub against legacy/broken records.
- Missing/deleted course references (`course: null`) no longer crash rendering.
- Missing student references no longer crash score/result tables.
- Non-array or malformed score collections are normalized safely.
- Older records with missing course links remain visible as **Unassigned · Course unavailable**.
- Added an integrity warning when such older records are detected.
- Kept all create / score entry / results functionality on the same Assessment page.

## Product resilience
- Added a global AeroLearn Error Boundary. A rendering exception now shows a branded recovery screen instead of a blank/crashed app.
- Added Reload Workspace and Dashboard recovery actions.
- Fixed navbar profile photos so a broken/expired image URL falls back to a generated avatar.
- Replaced the old plain 404 page with a branded AeroLearn route-recovery page.
- Removed the Back button from primary workspace pages; it now appears only on deep/detail routes.
- Refined footer spacing/separators and updated product display version to v3.1.

## Validation
- Changed frontend files: ESLint 0 errors.
- Whole frontend remains at 0 errors with 4 pre-existing exhaustive-deps warnings elsewhere.
- All 34 backend JavaScript files pass `node --check`.
- No database schema change.
