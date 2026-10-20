# Instructor Learning Materials Access Fix

Updated `server/controllers/learningMaterialController.js`.

- Instructors only receive materials whose course offering is assigned to their user account.
- Instructors can create materials only for assigned courses.
- Instructors can fetch or update a material only when its course is assigned to them; moving a material to another course is allowed only when that target course is also assigned to them.
- Admin access remains unchanged.
- Student list behavior remains unchanged.
- The existing courses API already filters course listings for instructors by `Course.instructor`, so the existing Learning Materials page receives only their assigned courses for the course selector.

Replace the project files with this archive's contents, then deploy the backend changes for the restriction to take effect.
