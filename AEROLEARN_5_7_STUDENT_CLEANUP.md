# AeroLearn v5.7 — Student cleanup

- Hard-deleting a student now removes the student from Course.students, Assessment.scores, and Attendance.students.
- Deleting a Student account through User Management performs the same linked cleanup.
- Assessment GET endpoints hide orphaned score rows whose student document no longer exists.
- Attendance GET/statistics hide and ignore orphaned attendance rows.
- Score saving rejects stale rows for deleted students and asks the user to refresh.
- This prevents deleted students from continuing to affect assessment progress, score averages/results, or attendance statistics.
