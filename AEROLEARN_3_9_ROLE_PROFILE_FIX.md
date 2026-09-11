# AeroLearn 3.9 — Role Profile Architecture Fix

## Root cause confirmed from the original uploaded project
The original `/api/auth/profile` route was NOT Admin-only; it was available to every authenticated role. However, the original profile screen displayed `gender` and `address`, while:
- `server/models/user.js` had no `gender` field.
- `server/models/user.js` had no `address` field.
- `updateProfile` only saved `fullName`, `department`, `phone`, and `profileImage`.
- `email`, `gender`, and `address` were ignored on save.

That mismatch is why fields could appear editable but revert to the old value.

## 3.9 changes
- User profile schema includes gender and address.
- The shared profile endpoint persists fullName, email, department, phone, gender, address and profileImage for Admin, Instructor and Student.
- User collection is the canonical authentication/profile record for all roles.
- Student accounts are synchronized to the duplicate Student collection for shared identity fields.
- Older Student records are lazily backfilled into User profile fields when missing.
- Email conflicts are checked across User and Student data for student accounts.
- Profile writes use an atomic update, read from MongoDB primary, and verify persisted values before returning success.
- No misleading 200 is returned if the saved value differs from the submitted value.
