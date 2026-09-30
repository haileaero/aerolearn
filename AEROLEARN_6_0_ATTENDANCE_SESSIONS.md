# AeroLearn v6.0 — Attendance Sessions

- Saving attendance now closes the student register and returns to a compact saved-session list.
- Saved sessions show date, department, study year, course, student count, Present/Absent/Late totals.
- Added View, Edit and Print actions for each saved attendance session.
- View is read-only; Edit updates the existing session instead of creating a duplicate.
- Backend treats the same course/date/period as one session and updates it when submitted again.
- Attendance rows are deduplicated by student and deleted student references are excluded.
- Existing week/period compatibility is preserved for older records and workflows.
