# AeroLearn 2.0 — Professional UI Pass

This version builds on the stabilized source and introduces a cohesive professional design system without changing the core academic workflows.

## Major visual upgrades
- New aviation-inspired AeroLearn identity with a dark academic navigation rail.
- Rebuilt responsive application shell, top workspace bar, mobile navigation and footer.
- Completely redesigned split-screen login experience.
- Rebuilt Admin/Instructor dashboard with live campus time, academic snapshot cards and fast task shortcuts.
- Rebuilt Student "My Courses" page as a personalized learning hub.
- Redesigned student course cards and universal form/table/input styling.
- Improved spacing, typography, card elevation, focus states and mobile behavior across legacy pages via a shared visual layer.
- Search in the top bar now navigates to matching allowed pages when Enter is pressed.
- Notification control opens Announcements instead of being decorative.

## Functional correction included
The Instructor dashboard no longer requests the Admin-only `/users` API after the stabilization security changes. Admin still receives the system-user statistic; Instructor receives only permitted data.

## Verification
- Frontend ESLint: 0 errors. 9 existing React hook dependency warnings remain in legacy components/pages.
- Backend JavaScript syntax check: passed for all server `.js` files.
- Vite production build could not be executed in the ChatGPT Linux environment because the original Windows dependency tree does not include `@rolldown/binding-linux-x64-gnu`. This is an environment/native optional-dependency issue, not a source lint error.

## Local setup
Do not copy old `node_modules` into a new machine/deployment.

Client:
1. `cd client`
2. remove any old `node_modules`
3. `npm install`
4. create `.env` from `.env.example`
5. `npm run dev` or `npm run build`

Server:
1. `cd server`
2. `npm install`
3. create `.env` from `.env.example`
4. `npm start`

Never commit production `.env` secrets.
