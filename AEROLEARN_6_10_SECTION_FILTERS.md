# AeroLearn 6.10 — Section filters

- Attendance registration now has a Section selector. Attendance sessions are distinguished by course, date, period, and section, allowing different sections to be recorded independently in the same period.
- The backend migrates the legacy attendance unique index to the section-aware index at startup.
- Assessment score entry now filters students by their registered section while keeping the full score sheet in state, so saving one filtered view does not erase scores for other sections.
- Assessment API score-student population includes the section field.
- Retained user-management pagination and the newer mobile-shell CSS fix.
