# AeroLearn 3.7 — Local API Target Fix

## Root cause
A previously existing `client/.env` can contain a production `VITE_API_URL`. In AeroLearn 3.6 that value still had priority even while Vite was running at localhost:5173, so the local UI could save to the deployed backend instead of the local backend.

## Fix
- In Vite development (`import.meta.env.DEV`), the client now always targets `http://localhost:5000/api` by default.
- An explicit `VITE_LOCAL_API_URL` may be used only when intentionally running the local API elsewhere.
- `VITE_API_URL` is now treated as the production/deployment API URL.
- This prevents stale local `.env` files from silently redirecting local tests to Render.
