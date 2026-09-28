# AeroLearn v5.4 — Multi-department course offerings

- The same course code can now be offered to multiple departments.
- Removed the old global unique constraint on `Course.code`.
- Added an offering-level uniqueness rule: code + department + academic year + study year + semester.
- Creating the exact same offering twice is still prevented.
- Updating a course checks the complete target offering, not only whether its code changed.
- Server startup automatically migrates the legacy MongoDB `code_1` unique index to the new compound index.
- Course records remain separate by `_id`, so Assessment, Attendance, Learning Materials and Results continue to target the selected department-specific offering.
