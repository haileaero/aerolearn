# AeroLearn v6.3 — Student Course Consistency

- Added canonical authenticated student endpoint `GET /api/students/me`.
- Student lookup now prefers the linked User record and safely falls back to student ID for older records.
- Older Student Directory records are automatically linked to the logged-in Student user when safely resolved.
- My Courses no longer places slash-containing student IDs such as `0271/16` in the URL.
- My Courses, My Results, Resources, course authorization and student announcements now resolve the same Student identity.
- Current active courses remain derived from Department + Study Year + Semester and enrollment references are repaired.
- Preserves all v6.2 attendance changes.
