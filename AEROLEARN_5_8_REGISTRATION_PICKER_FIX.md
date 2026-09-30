# AeroLearn v5.8 — Student Registration Picker Fix

- The Existing Student User dropdown now loads from the limited `/users/students` directory endpoint.
- That endpoint excludes user accounts already linked to an academic Student record.
- After a student is registered, reopening the registration form no longer shows that user.
- If the academic Student record is later deleted while the underlying User account remains, the user becomes eligible for registration again.
- The create-student API independently rejects attempts to register the same User twice, preventing duplicate records even from stale browser sessions.
- Footer version updated to v5.8.
