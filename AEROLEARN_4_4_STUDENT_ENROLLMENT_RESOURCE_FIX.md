# AeroLearn 4.4 — Student Enrollment & Resource Repair

- Repairs older student records whose `courses` array is empty or stale.
- Student profile now re-evaluates active courses from Department + Study Year + Semester.
- Creating/updating a course automatically enrolls matching active students.
- Updating a student re-synchronizes matching courses and course rosters.
- Deleting students/courses cleans reverse references.
- Student course detail access accepts eligible students and repairs stale enrollment.
- Student Learning Materials now returns only resources for their active eligible courses.
- Resource loading also repairs stale enrollment references.
- My Courses includes a deployment-safe fallback query and meaningful error state.
