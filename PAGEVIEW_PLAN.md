# Plan: Pageview Tracking

Add a `pageviews` table and event flow that records who viewed which page, from what IP, and for how long. A row is created on page load (start = end = now) and its `end_datetime` is bumped every 30 seconds while the page stays open.

## Data model

New table `pageviews`:

| Column | Type | Notes |
|---|---|---|
| `idpageview` | INT AUTO_INCREMENT PK | Row id, returned to client on create. |
| `username` | VARCHAR(100) NOT NULL | From `req.session.username`, not client input. |
| `page` | VARCHAR(255) NOT NULL | Route path (e.g. `/pages/intro`), sent by client. |
| `ip` | VARCHAR(45) NULL | From `req.ip`; length fits IPv6. |
| `start_datetime` | DATETIME NOT NULL | Set server-side on create. |
| `end_datetime` | DATETIME NOT NULL | Set = start on create; bumped by heartbeat. |

Indexes on `username` and `start_datetime` for reporting. Duration is derived at query time (`end - start`), not stored.

## Step 1 — Schema migration (`sql/sql20.js`)

Mirror the existing pattern (see `sql19.js`). Do **not** prefix the table with the database name.

```js
module.exports.sql20 = [
  "CREATE TABLE pageviews ( idpageview INT NOT NULL AUTO_INCREMENT, username VARCHAR(100) NOT NULL, page VARCHAR(255) NOT NULL, ip VARCHAR(45) NULL, start_datetime DATETIME NOT NULL, end_datetime DATETIME NOT NULL, PRIMARY KEY (idpageview), INDEX pageviews_username_idx (username ASC), INDEX pageviews_start_idx (start_datetime ASC));",
  "INSERT INTO schema_version (idversion) VALUES (20);"
];
```

Wire it into `src/server/mysql.ts`:
- Add `import { sql20 } from './../../sql/sql20.js';`
- Add `if (old_version < 20) await _update_update_version(sql20);` at the end of the version chain in `update_mysql_database_schema()`.

Migration applies by hitting `GET /api/sql/` (existing route), which is safe to re-run.

## Step 2 — Server API (`src/server/app_pageviews.ts`)

New Express router, mounted in `app.ts` alongside the others:
```ts
import { app_pageviews } from './app_pageviews';
app.use('/api/pageviews', app_pageviews);
```

Both routes use `nocache` + `user_require_logged_in`. Reuse `run_mysql_query`, `to_utc`, `from_utc_to_myql` from `mysql.ts`.

**POST `/api/pageviews`** — initial load event.
- Body: `{ page: string }`. Validate/trim `page`, cap at 255 chars.
- `username = req.session.username`, `ip = req.ip`, `now = from_utc_to_myql(to_utc(new Date()))`.
- `INSERT INTO pageviews (username, page, ip, start_datetime, end_datetime) VALUES (?,?,?,?,?)` with `start = end = now`.
- Respond `{ idpageview: <insertId> }`.

**POST `/api/pageviews/:id/heartbeat`** — the 30-second update.
- `UPDATE pageviews SET end_datetime = ? WHERE idpageview = ? AND username = ?` (ownership check via session username prevents a user editing another's row).
- `now` computed server-side. Respond `200` (or `404` if no row updated).

Keep timestamps server-generated so the client can't backdate or forge them.

## Step 3 — Client hook (`src/app/pages/usePageview.ts` or inline in `index.jsx`)

Add a `PageviewTracker` component rendered once **inside** `<BrowserRouter>` in `src/app/index.jsx` (so `useLocation()` works), above `<Routes>`.

Behavior on each `location.pathname` change:
1. POST `/api/pageviews` with `{ page: pathname }` (`credentials: 'include'`), store returned `idpageview` in a ref.
2. Start `setInterval(heartbeat, 30000)` → POST `/api/pageviews/${id}/heartbeat`.
3. Cleanup on unmount / route change: `clearInterval`, and fire one final heartbeat. Use `navigator.sendBeacon('/api/pageviews/${id}/heartbeat')` in a `beforeunload`/`visibilitychange` handler so the last timestamp survives tab close.

Guard against firing when logged out (`getUserFromBrowser()` empty) — the API would 401 anyway, but skipping avoids noise. Fail silently on network errors; tracking must never break the page.

## Step 4 — Tests

Follow existing `test/**/*.test.cjs` convention:
- Migration produces the table and is idempotent.
- POST creates a row with equal start/end and the session's username/IP.
- Heartbeat advances `end_datetime` and only for the owning user (cross-user update affects 0 rows).
- Invalid/oversized `page` is rejected; unauthenticated requests get 401.

## Notes / open questions

- **One row per visit**: each load = one row, heartbeats extend it. Revisiting a page creates a new row. This matches the request. (Alternative — one persistent row per user+page — would need an upsert instead; flag if that's preferred.)
- **IP behind proxy**: `req.ip` is correct because `trust proxy` is already set in `app.ts`.
- **Heartbeat interval**: 30s means max ~30s undercount if a tab closes without the final beacon; `sendBeacon` mitigates this.
- **Volume**: heartbeats are cheap single-row updates, but a busy class could generate steady write load. Consider a retention/cleanup job later if the table grows large.
