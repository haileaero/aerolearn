# AeroLearn 3.8 — Atomic Profile Persistence Fix

This release addresses the confirmed case where `PUT /api/auth/profile` returned 200 but the following `GET /api/auth/profile` returned the previous profile values.

Changes:
- Profile updates now use a single MongoDB `findByIdAndUpdate(..., {$set: ...})` atomic write.
- All profile reads and update verification explicitly use MongoDB primary read preference.
- The backend verifies the stored values against the submitted editable fields before returning success.
- A mismatch now returns HTTP 500 with the exact failing field and logs `PROFILE_PERSISTENCE_MISMATCH` instead of returning a false HTTP 200.
- Strong no-cache headers remain on profile endpoints.
- Existing email uniqueness and field validation remain enforced.

This is intended to remove both hydrated-document save edge cases and stale-secondary reads from the profile save path.
