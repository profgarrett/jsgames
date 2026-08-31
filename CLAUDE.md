# Agent Notes

## Logging in to browse/evaluate the site

The site requires login — there is no anonymous browsing. Use these steps whenever you
(an AI agent) need to load pages or check the result of an action in a browser.

**Dev server** (both must be running before you can reach the site):
- `npm run startnode` — backend, http://localhost:9000
- `npm run startreact` — frontend (webpack-dev-server), http://localhost:8080

Browse the app at **http://localhost:8080** (not 9000).

**Credentials**: read `AI_AGENT_USERNAME` and `AI_AGENT_PASSWORD` from `src/server/secret.js`.
Do not hardcode these values in code, tests, or any doc committed to the repo.

**Login steps** (see `src/app/components/LoginContainer.tsx` / `LoginCurrentUser.tsx`):
1. Navigate to `http://localhost:8080/login`.
2. The page shows two panels side by side. Use the **"Administrator Login"** panel
   (narrow column) — NOT the "Sign in with Google" panel (wide column). The Google
   panel has no username/password fields and can't be used by an agent.
3. Fill in the two fields inside the Administrator Login panel:
   - `input[name="username"]` → `AI_AGENT_USERNAME`
   - `input[name="password"]` → `AI_AGENT_PASSWORD`
4. Click the **Login** button.
5. This POSTs to `POST /api/users/login/` with `{ username, password, token: '' }`.
   On success the page shows "Success logging in!" and redirects to `/` after a short
   delay (~1s on localhost). The session is a `cookie-session` cookie, so once logged
   in via the browser, subsequent page navigations stay authenticated.

**If login fails**:
- "Invalid username or password" — the credentials in `src/server/secret.js` are wrong,
  or that user doesn't exist in the local dev DB. See `scripts/createadmin.cjs` /
  `scripts/createuser.cjs` to create one.
- A "database is temporarily unavailable" banner — MySQL isn't reachable; start it
  before the app.

**Do not start the dev server yourself.** Assume it is already running at
localhost:8080/9000 when you need to browse the site; if it isn't reachable, say so
and ask rather than launching it.
