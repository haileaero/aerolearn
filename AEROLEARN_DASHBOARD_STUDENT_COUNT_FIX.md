# AeroLearn Dashboard Student Count Fix

## Root cause
The dashboard was calculating the student total from `/api/students`, whose directory endpoint is paginated to 20 records per page. The dashboard therefore displayed the current page length instead of the total number of registered student records.

## Fix
`client/src/pages/Dashboard.jsx` now fetches `/api/students/statistics` in parallel with the existing dashboard data and reads `summary.totalStudents` for the Students metric. The student directory remains paginated as designed.

## Deployment
Deploy the client and server from this archive using the existing Render configuration. No database migration or student data deletion is required. Ensure the deployed server version includes the existing `/api/students/statistics` route and the client build is redeployed after the change.
