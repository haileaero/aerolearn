# AeroLearn 4.5 — Student Results Recovery

- Added a student-only `/api/assessment/my-results` endpoint.
- My Results no longer depends on a potentially stale `Student.courses` array.
- Current eligible course enrollment is repaired when results are requested.
- Existing assessments receive a missing pending score row for newly repaired students.
- Historical assessment results stay visible after year/semester changes.
- Pending assessments are no longer counted as completed or as 0% failures.
- My Results UI now separates Published vs Pending scores and keeps previous course history.
- No deleted Render service is required for data recovery; the active database/API remain on `aerolearn-api`.
