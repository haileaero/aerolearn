# AeroLearn v6.7 — Assessment Reassignment & Duplicate Prevention

- Assessment type assignment now lists only courses that do not already have an assessment plan.
- Assigned courses disappear from the assignment selector immediately after data refresh.
- Deleting a course assessment plan removes all of its assessment components and scores, verifies that no components remain, and makes the course selectable again.
- Template deletion remains independent: deleting a reusable type does not silently delete already assigned course plans.
- Backend duplicate-plan protection remains authoritative and now returns a clear conflict response with the existing component count.
- Existing v6.6 roster synchronization and all earlier attendance/student fixes are preserved.
