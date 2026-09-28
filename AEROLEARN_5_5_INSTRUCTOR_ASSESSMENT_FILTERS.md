# AeroLearn v5.5 — Instructor Assessment Filters

- Instructor course API now returns only courses assigned to the signed-in instructor.
- Instructor assessment API now returns only assessments belonging to those assigned courses.
- Assessment Plan adds hierarchical filters: Study Year (Year I–V) → Department → Assigned Course → Assessment Type.
- Department choices respond to the selected study year.
- Course choices respond to the selected study year and department.
- Assessment rows remain tied to the exact course offering, preventing same-code courses in different departments from mixing.
- Existing Manage workflow remains available for entering, saving and editing marks.
- Admin retains full course and assessment visibility.
- Instructor assessment creation is protected server-side so instructors can only create assessments for courses assigned to them.
