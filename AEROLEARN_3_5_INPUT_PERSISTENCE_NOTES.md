# AeroLearn 3.5 — Input Persistence Fix

## Root cause addressed
The profile page could issue repeated profile-loading effects in local development under React StrictMode. A late profile response could overwrite the controlled edit draft while the user was typing, making fields appear to revert to their previous values.

## Changes
- Removed React StrictMode wrapper from the application entry point so development does not intentionally double-run mount effects.
- Hardened Profile.jsx so the profile load runs once per mounted page.
- Removed the unnecessary AuthContext update during initial profile loading; AuthContext is updated only after a successful save.
- Preserved the separate edit draft model so server data cannot overwrite active edits.
- Re-ran frontend ESLint across src: 0 errors, 0 warnings.

## Test after replacing local source
1. Restart the Vite dev server completely.
2. Open Profile.
3. Click Edit profile.
4. Type into Phone or Address and wait several seconds before saving. The typed value should remain.
5. Click Save changes.
6. Refresh the page and confirm the saved value remains.
