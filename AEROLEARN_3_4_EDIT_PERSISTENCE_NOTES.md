# AeroLearn 3.4 — Edit & Persistence Reliability Pass

This pass targets the production issue where profile fields snapped back while typing or appeared to save but did not persist.

## Root causes fixed
- AuthContext callbacks changed identity on every render. The Profile page depended on `updateUser`, so its load effect re-ran after each keystroke/render and replaced the user's draft with server data.
- The profile update API returns `{ message, user }`, while the client treated the whole response wrapper as the user object.
- The backend user schema/API did not persist `gender` or `address`, and the profile API did not update `email`.
- Password change used `bcrypt.compare` without importing bcrypt in the controller.
- Profile photo preview used a temporary `blob:` URL that cannot survive a save/reload.
- Student edit/create UI included a user-account relationship that was not stored by the Student model/controller.
- Course `academicYear` was displayed/submitted but omitted by create/update controller persistence.
- Remaining React hook dependency warnings could lead to stale/reset-prone form behavior.

## Fixes
- Stable AuthContext `login`, `updateUser`, and `logout` via `useCallback`; provider value memoized.
- `updateUser` now safely merges updated profile data and preserves the current auth token.
- Profile uses a separate edit draft; server refreshes can no longer overwrite active typing.
- Cancel restores the last saved profile; Save only commits after a successful API response.
- Profile service normalizes response shapes and sends only editable fields.
- Full name, email, department, phone, gender, address, and profile image now persist.
- Email uniqueness validation added for self-service profile updates.
- Small profile images are saved as persistent data URLs instead of temporary browser blob URLs.
- Password change now uses the model's `matchPassword()` and enforces an 8-character minimum consistently.
- Student records now store an optional linked User reference; existing legacy student records remain compatible.
- Editing a legacy student no longer wrongly requires selecting an Existing User.
- Course academic year now persists on create/update.
- Course details data loading hardened against wrapped/non-array API results.
- All previous 5 React exhaustive-dependency warnings were removed.

## Validation
- Frontend ESLint: 0 errors, 0 warnings.
- Backend JavaScript syntax: all server JS files pass `node --check`.
