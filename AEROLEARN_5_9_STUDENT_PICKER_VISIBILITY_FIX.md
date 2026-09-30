# AeroLearn v5.9 — Student Picker Visibility Fix

- Fixes an empty **Select Existing Student User** dropdown introduced in v5.8.
- Root cause: `/users/students` filtered correctly on the server but omitted the `role` field from its response, while the client required `role === "Student"`, so every returned user was discarded.
- The API now includes `role` and `isActive` in the available-student-user payload.
- The client also tolerates older/cached API responses where `role` is absent while still rejecting explicitly non-Student roles.
- v5.8 behavior remains: only active Student users without a current Student Directory record are returned, and duplicate registration is blocked server-side.
