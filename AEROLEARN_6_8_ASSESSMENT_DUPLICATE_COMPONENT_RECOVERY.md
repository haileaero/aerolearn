# AeroLearn v6.8 — Assessment Duplicate Component Recovery

- Fixes MongoDB E11000 errors when a legacy assessment type contains the same component title/week more than once.
- Legacy duplicate components are safely given deterministic unique titles during course assignment.
- New assessment types reject duplicate title/week combinations in both client and server validation.
- Failed template assignment rolls back inserted components so a course is never left falsely blocked.
- Automatically cleans partial same-template plans left by the older failed-insert behavior before retrying assignment.
- Keeps v6.7 unassigned-course selector and course-plan reassignment behavior.
