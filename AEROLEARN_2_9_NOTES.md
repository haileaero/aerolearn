# AeroLearn 2.9 — Assessment Simplification + Score Route Fix

## Assessment creation
- Removed the visible Total Marks field from Create Assessment.
- New assessments use a standardized internal score scale of 0–100.
- Teachers only choose Course Contribution (%) to define grading importance.
- Added a short explanation so the scoring model is clear.
- Simplified the form to Department, Course, Type, Name, Week, Due Date, Contribution and optional Instructions.

## Assessment table
- Removed the repeated Course column.
- Course is now a useful filter in the toolbar instead of repeated in every row.
- Removed the Marks column.
- Added Score Status showing entered vs total student scores.
- Table is now Assessment / Schedule / Contribution / Score Status / Actions.

## Score sheet 404 fix
- Registered the missing `/assessment/:id/scores` frontend route.
- Connected the Open Score Sheet action to that route.
- Rebuilt the direct score sheet page in the current AeroLearn visual style.
- Added student search, entered/remaining counters, class average, bounded score inputs and save controls.
- Existing assessments still respect their stored maximum score; new assessments use 100.

## Verification
- Changed assessment/routing files: ESLint 0 errors.
- Full frontend: 0 errors, 4 existing hook-dependency warnings elsewhere.
- Backend: 34 JavaScript files pass syntax validation.
- No database schema migration required.
