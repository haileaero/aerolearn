# AeroLearn v5.6 — Weighted Score Fix

- Assessment contribution/weight is now also the maximum score for that assessment.
- A 10% assessment accepts 0–10, a 20% assessment accepts 0–20, etc.
- Frontend and backend both enforce the maximum.
- New assessments store totalMark equal to weight; older records are still handled using weight as the authoritative maximum.
- Assessment score summaries now show Score / Maximum instead of a misleading Class average percentage.
- Pass/below-half logic uses half of the assessment weight.
- Student My Results calculates the course result by summing weighted assessment points; when course weights total 100, the sum is the final percentage out of 100.
- Legacy score-entry/result views also use assessment weight as the maximum.
