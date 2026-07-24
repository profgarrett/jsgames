# JS Games: Google Login Migration Plan

## 1. Current account & login process

**Identity model.** A user is one row in `users` (`iduser`, `username`, `hashed_password`). The `username` is the user's email (validated with `\S+@\S+\.\S+` on creation, unique index). There is no separate name/profile record. Course membership and roles live in `users_sections` (`role` = `student` | `faculty`).

**Session.** `cookie-session` (`src/server/network.ts` → `session_initialize`), cookie name `session`, signed with `JWT_AUTH_SECRET`, `maxAge` ~356 days, **`httpOnly: false`**. The React client reads the cookie directly and base64-decodes it (`Authentication.tsx` → `getUserFromBrowser`) to get `username` and `isAdmin`. Login state is just `req.session.username`.

**Login (`POST /api/users/login`, `app_users.ts`).**
1. `is_matching_mysql_user(username, password)` → bcrypt-compares against `users.hashed_password`.
2. **OR** `password === ADMIN_OVER_PASSWORD` → a master password that logs into *any* account.
3. On success, `user_login()` sets `req.session.username` and `req.session.isAdmin`.

**Account creation (`POST /api/users/create_user`).** Generates a random password, inserts the user, optionally joins a section via a course code, emails a link so the user can set a real password through the reset flow (`passwordresetrequest` → `passwordreset`).

**Authorization.**
- Server admin gate: `user_require_admin` checks `req.session.username == ADMIN_USERNAME` (`garrettn`).
- Faculty gate: `is_faculty()` checks `users_sections.role = 'faculty'`.
- Client `isAdmin` only toggles UI.

**Issues worth fixing while you're in here (not caused by Google login, but adjacent):**
- `network.ts:245` — `req.session.isAdmin = username == ADMIN_USERNAME || "garrettn"` always evaluates truthy (the `|| "garrettn"` short-circuits to a truthy string). Server routes don't trust this field, so it's low-impact, but it should read `username === ADMIN_USERNAME`.
- `ADMIN_OVER_PASSWORD` is a single plaintext master password that grants login to any account — powerful and worth scoping (see §5).
- `httpOnly: false` exposes the session cookie to any XSS. Google login doesn't require this to stay false; consider flipping it (see §4).

---

## 2. Target design

Because usernames already *are* verified-style emails, Google maps cleanly onto the existing schema: Google returns a **verified email**, which you match to `users.username`.

Two login paths, side by side on the login page:

| Path | Who | Endpoint |
|------|-----|----------|
| **Google Sign-In** (new, default) | All students, faculty | `POST /api/users/google_login` |
| **Manual username/password** (existing) | Admin + any account you choose to keep on passwords | `POST /api/users/login` (unchanged) |

Both paths end the same way: they call `user_login()` to set the session. Everything downstream (sessions, roles, `user_require_*`, reports) is unchanged.

Recommended library: **Google Identity Services (GIS)** on the client + **`google-auth-library`** on the server to verify the ID token. This is the current, supported approach (the older `gapi.auth2` / "Google Sign-In JavaScript" platform library is deprecated). Verify the exact current package/flow against Google's docs before implementing, since Google revises this area frequently.

---

## 3. Schema changes

Minimal. Add a new `sqlNN.js` migration:

```sql
ALTER TABLE users
  ADD COLUMN google_sub    VARCHAR(64)  NULL,   -- Google's stable user id ("sub")
  ADD COLUMN auth_provider VARCHAR(20)  NOT NULL DEFAULT 'password';  -- 'password' | 'google'
ALTER TABLE users ADD UNIQUE INDEX google_sub_UNIQUE (google_sub);
-- hashed_password stays but becomes optional for google-only users
```

Storing `google_sub` (Google's immutable subject id) means the binding survives even if a user later changes the email on their Google account. Email is the *lookup* key for migration; `sub` becomes the *authoritative* binding once first captured.

---

## 4. Server changes

New endpoint in `app_users.ts`:

```ts
import { OAuth2Client } from 'google-auth-library';
import { GOOGLE_CLIENT_ID } from './secret';
const google_client = new OAuth2Client(GOOGLE_CLIENT_ID);

router.post('/google_login', nocache, async (req, res, next) => {
  try {
    const { credential, section_code } = type_params(req.body, ['credential', 'section_code']);

    // 1. Verify the ID token with Google (checks signature, audience, expiry).
    const ticket = await google_client.verifyIdToken({
      idToken: credential, audience: GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();
    if (!payload || !payload.email_verified) return res.sendStatus(401);

    const email = payload.email.toLowerCase().trim();
    const sub   = payload.sub;

    // 2. Find existing user by google_sub, then fall back to email (migration case).
    let rows = await run_mysql_query(
      'SELECT iduser, username, google_sub FROM users WHERE google_sub = ? OR username = ? LIMIT 1',
      [sub, email]);

    if (rows.length === 0) {
      // 3a. New user: create it (reuse your create_user validation + section-join logic).
      //     Insert with auth_provider='google', google_sub=sub, no usable password.
    } else if (!rows[0].google_sub) {
      // 3b. Existing password user logging in with Google for the first time:
      //     bind the account -> UPDATE users SET google_sub=?, auth_provider='google' WHERE iduser=?
    }

    // 4. Log in exactly like the password path.
    await user_login(email, /* no password */ '', req, res);
    return res.json({ username: email, logged_in: true });
  } catch (e) { log_error(e); next(e); }
});
```

Notes:
- **Reuse, don't duplicate.** Factor the section-code lookup / user-insert block out of `create_user` into a shared helper so Google-created and password-created accounts go through identical validation and section-join logic.
- `user_login()` currently takes a password but only uses it to set session fields — Google path can pass `''`. Consider refactoring `user_login(username, req, res)` so it no longer implies a password.
- Add `GOOGLE_CLIENT_ID` (and update `secret.distribution.js`) — the OAuth client id from Google Cloud Console. Authorize your origins (`https://excel.fun`, `http://localhost:8080`).
- Good moment to set the session cookie `httpOnly: true` and have the client learn identity from `GET /api/users/login/status` instead of decoding the cookie. Optional but recommended; it's a small change to `getUserFromBrowser`'s callers.

---

## 5. Admin / manual login path

The existing `POST /api/users/login` stays as-is, so admins keep working immediately. Two hardening options (pick per your appetite):

**Option A — keep both open (least work).** Any account with a password can still use manual login. Admins use it; students use Google. Nothing to change.

**Option B — restrict manual password login to staff (recommended).** After migration, gate `/login` so only admin/faculty can authenticate by password, forcing students onto Google:

```ts
// inside POST /login, after matching succeeds:
const staff = (username === ADMIN_USERNAME) || await is_faculty(username);
if (!staff && matching_was_by_password) return res.sendStatus(403);
```

For the `ADMIN_OVER_PASSWORD` master override: keep it for admin break-glass, but scope it so it can only assume accounts *when the requester is already admin*, or replace it with an explicit "impersonate" endpoint behind `user_require_admin`. As written today it's usable by anyone who learns the password.

This satisfies your requirement: **admins retain the manual username/password (and master-password) path; everyone else moves to Google.**

---

## 6. Client changes

In `LoginContainer.tsx` / `LoginCurrentUser.tsx`, add the Google button above the existing form:

```tsx
// Render GIS button; on credential callback, POST to /api/users/google_login.
window.google.accounts.id.initialize({ client_id: GOOGLE_CLIENT_ID, callback: onGoogle });
window.google.accounts.id.renderButton(divRef.current, { theme: 'outline', size: 'large' });

function onGoogle(resp) {  // resp.credential is the ID token
  fetch('/api/users/google_login', {
    method: 'POST', credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ credential: resp.credential, section_code }),
  }).then(/* same success/redirect handling as login() */);
}
```

Keep the existing username/password card visible (labelled e.g. "Staff / admin login") so admins have it. Course join codes still work — pass `section_code` through the Google call so first-time Google users land in the right section.

---

## 7. Migration sequence (low risk, reversible)

1. **Schema:** add `google_sub` / `auth_provider` columns (nullable — no data loss, existing logins unaffected).
2. **Server:** add `/google_login`, factor out the shared create-user helper, add `GOOGLE_CLIENT_ID`. Deploy — manual login untouched.
3. **Client:** add the Google button beside the existing form. Existing users can now log in *either* way; first Google login auto-binds `google_sub` to their existing row via email match.
4. **Soak:** run both paths in parallel for a term. Because email == username, no bulk data migration is needed — accounts bind themselves on first Google login.
5. **Restrict (optional, Option B):** once most students have logged in via Google, gate password login to staff.

Rollback at any step is just not shipping the next one; the schema columns are additive.

---

## 8. Effort & risks

**Effort:** roughly 1–2 focused days — one new server endpoint + a refactor of the create-user block, one migration file, one client button, plus a Google Cloud OAuth client setup. No data migration.

**Main risks / things to verify:**
- **Verify current Google API surface** (GIS button + `google-auth-library.verifyIdToken`) against Google's live docs — this API changes and I'm working from a May-2025 mental model.
- **Email collisions:** a Google email that matches an existing `username` correctly binds; confirm you *want* auto-binding rather than an explicit "link account" confirmation. For an education tool, auto-bind on verified email is usually fine.
- **Non-Google emails:** any students whose course email isn't a Google/Workspace account can't use Google Sign-In — keep a fallback (password path, or Google's "Sign in with Google" for Workspace-federated domains). Check whether WVU / your student domains are Google Workspace.
- **`email_verified` must be true** — reject tokens without it.
- Fix the `isAdmin` truthiness bug and consider `httpOnly: true` while you're in this code.

---

*This is a design proposal, not a security review. Before deploying, confirm the exact current Google Identity Services flow and token-verification package against Google's documentation, and review the `ADMIN_OVER_PASSWORD` handling.*
