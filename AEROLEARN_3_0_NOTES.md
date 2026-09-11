# AeroLearn 3.0 — One-Page Assessment Hub

## Unified assessment workflow
- Create Assessment, Submit Scores, and View Results are now one `/assessment` workspace.
- Sidebar now has a single Assessment item instead of a three-item submenu.
- Legacy `/assessment-submit`, `/assessment-results`, and `/assessment/:id/scores` URLs remain compatible and open the unified hub.
- Dashboard assessment quick action now opens the unified hub.

## Simplified creation
- Department was removed from the create form because the chosen course already defines department.
- Visible Total Marks was removed; new assessments use a standard 0–100 percentage scale internally.
- The teacher chooses only course, assessment type/name, week, due date, contribution %, and optional note.
- New contribution guard prevents a course's assessment weights from exceeding 100%.

## Professional assessment plan
- Compact plan table with Assessment, When, Contribution, Progress, Class Average, and Manage.
- Course is used as a filter/context instead of wasting a table column.
- Manage opens the assessment desk on the same page.

## Score entry + results on the same page
- Score Entry and Results are two views of the selected assessment desk, without page navigation.
- Student search, score completion, class average, remaining scores, pass count, weighted contribution, and pass/below-50 states are shown live.
- Save Scores updates the Results view immediately.

## Data correctness surprise
- Added an `entered` flag to assessment score records so a legitimate score of 0 is no longer confused with an unentered/pending score.
- Existing positive legacy scores remain recognized as entered.
- Average-score calculation now uses entered scores instead of treating every placeholder zero as a real result.

## Validation
- Full frontend ESLint: 0 errors, 4 pre-existing hook dependency warnings.
- All backend JavaScript files pass `node --check`.
