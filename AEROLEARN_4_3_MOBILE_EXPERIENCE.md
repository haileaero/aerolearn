# AeroLearn 4.3 — Mobile Experience

This release adds a final responsive shell layer for Admin, Instructor and Student accounts.

Key changes:
- mobile/tablet shell now activates up to 1100px to handle Android/in-app browsers that expose desktop-like CSS widths;
- sidebar is a true off-canvas drawer with backdrop and close button;
- sidebar navigation scrolls independently while the account/sign-out panel remains visible at the bottom;
- mobile header keeps the current page title, notification button and avatar while removing the desktop search field;
- all main content uses the full phone width instead of retaining the desktop sidebar offset;
- dashboards, course cards, stats, resource grids and common forms collapse to two columns on tablets and one column on phones;
- toolbars wrap instead of overflowing;
- data tables retain deliberate horizontal scrolling when needed;
- footer and page spacing are reduced for mobile;
- images, videos, iframes and long text are constrained to prevent horizontal page overflow.

Client-side only. No server changes are required from AeroLearn 4.2.
