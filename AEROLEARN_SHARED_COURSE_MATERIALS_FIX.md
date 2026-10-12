# Shared Learning Materials by Course Name

## Change
Student learning-material visibility now matches the student's active eligible course names and includes materials uploaded to any active course offering with the same normalized course name, even when the offering belongs to another department.

## Behavior
- Upload a material once to one course offering.
- Students eligible for an active course with the same name can see that material without a second upload.
- Course names are compared case-insensitively and whitespace-normalized.
- Existing course IDs, upload records, categories, and instructor/admin material management remain unchanged.

## Validation
The modified controller passed `node --check`. A full application build and live database integration test were not run in this environment.
