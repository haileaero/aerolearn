# AeroLearn 4.0 - Attendance Register & PDF Report Fix

## What was fixed
- Attendance now opens the actual enrolled course roster instead of loading every student from the same department.
- Existing attendance sessions are merged with the current course roster so legacy records no longer leave the register with blank Student ID / Student Name cells when the current student still exists.
- Attendance records now keep identity snapshots (Student ID, name, section and year) for reliable historical reports.
- Course roster responses now include student section, year and status.
- Suspended or missing course roster entries are not inserted into a new register.
- Register table now shows Student ID, Student Name, Year, Section and status clearly.
- Present / Absent / Late controls now have explicit green / red / amber selected states and neutral unselected states.
- Added course/session information strip, clearer session history and attendance legend.
- Added safe validation before save/update.

## PDF changes
- PDF button no longer forces a download. `Preview PDF` opens the report in a browser tab.
- A separate `Download` button performs the actual file download.
- Rebuilt attendance PDF with AeroLearn branded header, session metadata, professional table, colored statuses, summary cards, page footer and signature line.
- PDF now includes Student ID, Student Name, Year and Section.
- Historical attendance identity snapshots prevent future reports from losing student labels when a profile changes.

## Important
Both `client` and `server` contain changes in this release. Replace/push both folders and redeploy both Render services.
