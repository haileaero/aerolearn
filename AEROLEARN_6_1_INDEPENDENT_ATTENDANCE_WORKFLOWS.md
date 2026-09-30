# AeroLearn v6.1 — Independent Attendance Workflows

- Register Attendance and Saved Attendance now use independent filters.
- Register flow: Study Year → Department → Course → Week → Period → Date → Open Register.
- Course lists remain restricted to the signed-in instructor through the existing courses API.
- The register checks Course + Date + Period before loading students. Existing sessions are blocked with a clear message.
- Saved Attendance flow: Study Year → Department → Course → optional Date → optional Period → Search.
- Saved rows show Period explicitly and retain View, Edit and Print.
- Backend search honors course/department/study-year/date/period filters and restricts instructors to assigned courses.
- Backend create returns HTTP 409 for duplicate Course + Date + Period instead of silently updating.
- Database uniqueness migrated from course/week/period to course/date/period, with legacy duplicate cleanup before the new index is installed.
