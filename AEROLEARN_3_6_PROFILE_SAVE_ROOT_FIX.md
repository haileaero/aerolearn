# AeroLearn 3.6 — Profile Save Root Fix

This release fixes the root cause of profile edits appearing to save and then reverting.

## Root cause
The frontend API client had a production Render URL as its fallback even while running Vite locally. When no client `.env` file was present, a local frontend silently sent profile edits to the deployed/older backend instead of `localhost:5000`. This made local testing misleading and could return old profile values.

## Changes
- Local Vite development now defaults to `http://localhost:5000/api`.
- Production still uses `VITE_API_URL` when configured, otherwise the existing Render API fallback.
- Profile updates are now read back from the database immediately after save.
- The client verifies that editable fields actually persisted instead of silently accepting a stale response.
- Profile GET/PUT responses now use `Cache-Control: no-store`.
- Update endpoint reloads the saved MongoDB document before returning it.

## Local test requirement
Run both services:
- server on port 5000
- client on Vite port 5173

If you intentionally want local client to use another API, set `VITE_API_URL` in `client/.env`.
