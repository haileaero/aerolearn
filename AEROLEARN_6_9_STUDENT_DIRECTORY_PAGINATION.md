# AeroLearn 6.9 — Student Directory Pagination

- Student Directory uses the existing API pagination with 20 students per page.
- Added Previous, numbered pages, ellipsis handling, and Next controls.
- Search and department filters query the full student registry instead of only the currently loaded page.
- Summary cards use global student statistics, so totals are not capped at 20.
- Added showing-range metadata such as “Showing 21–40 of 40 students”.
- Add, edit, and delete refresh the correct page and global statistics.
- Department is included in server-side text search.
