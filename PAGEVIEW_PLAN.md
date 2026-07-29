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
| `end_datetime` | DATETIME NOT NULL | Set = start on create; bumped by every heartbeat. |
| `active_datetime` | DATETIME NULL | Added in `sql22.js`. Set = start on create; bumped only by heartbeats flagged active. |
| `active_seconds` | INT NOT NULL DEFAULT 0 | Added in `sql23.js`. Summed engaged time, reported by the client and clamped server-side. |

Indexes on `username` and `start_datetime` for reporting. Three measures, the first two derived at query time:

| Measure | Question it answers | Trust |
|---|---|---|
| `end_datetime - start_datetime` | How long was the page open? | Server-measured. |
| `active_datetime - start_datetime` | When did engagement last happen? Includes idle gaps mid-visit. | Server-measured; a floor. |
| `active_seconds` | How long was it actually used, gaps excluded? | Client-summed, clamped. |

The pair is deliberate. `active_datetime` is the trustworthy but coarse measure; `active_seconds` is precise but originates on the client. A row where `active_seconds` greatly exceeds `active_datetime - start_datetime` is a signal of a tampered client and worth spot-checking.

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
- `INSERT INTO pageviews (username, page, ip, start_datetime, end_datetime, active_datetime) VALUES (?,?,?,?,?,?)` with `start = end = active = now`.
- Respond `{ idpageview, resumed, active_seconds }`. The `active_seconds` figure is the resumed row's stored total (0 for a new row) and seeds the client's accumulator, so a reload continues the tally instead of restarting it and reporting a total lower than what is already stored.

**POST `/api/pageviews/:id/heartbeat?active=1|0&active_seconds=N`** — the 30-second update.
- `UPDATE pageviews SET end_datetime = ? WHERE idpageview = ? AND username = ?` (ownership check via session username prevents a user editing another's row).
- `active_datetime` is set to `now` in the same statement when `?active` is not `0`/`false`/`no`. Both figures ride in the query string because `navigator.sendBeacon` sends no body; a missing flag counts as active so older cached clients behave as before.
- `active_seconds` is a **running total**, not a delta, so a duplicated or retried beacon can't double-count. Applied as:

  ```sql
  active_seconds = GREATEST(active_seconds, LEAST(?, TIMESTAMPDIFF(SECOND, start_datetime, ?) + 60))
  ```

  `GREATEST` keeps it monotonic against out-of-order arrivals; `LEAST` caps it at the server's own measure of how long the page was open, so a forged total can never exceed a plausible one. A missing value omits the clause entirely rather than writing 0 — an old client reporting nothing is not evidence the student did nothing.
- The `WHERE` also carries `AND end_datetime >= <cutoff>`, refusing to extend a row that has gone quiet for longer than the reuse window. Without it, a laptop closed at 11:45pm and reopened at 2am keeps extending the same row — no reload fires, so no load event is sent — and the visit is recorded as two and a quarter hours of reading.
- The statement is assembled by `build_heartbeat_update()`, kept pure so the clause/value alignment is unit tested.
- `now` computed server-side. Responses: `200` recorded, `404` no such row or not the caller's, `409` stale (the client answers by posting a fresh load event).
- When nothing is updated, a second query disambiguates the three reasons. This matters because mysql2 reports `affectedRows` as rows *changed*: two heartbeats inside the same second update a row to the value it already holds and report 0, and that live row must not be told its session is over or the client would start a duplicate. The freshness comparison is done in SQL against the same cutoff string, avoiding a round-trip through the driver's local-timezone `Date`.

Keep timestamps server-generated so the client can't backdate or forge them.

## Step 3 — Client hook (`src/app/pages/usePageview.ts` or inline in `index.jsx`)

Add a `PageviewTracker` component rendered once **inside** `<BrowserRouter>` in `src/app/index.jsx` (so `useLocation()` works), above `<Routes>`.

Behavior on each `location.pathname` change:
1. POST `/api/pageviews` with `{ page: pathname }` (`credentials: 'include'`), store returned `idpageview` in a ref.
2. Start `setInterval(heartbeat, 30000)` → POST `/api/pageviews/${id}/heartbeat`.
3. Cleanup on unmount / route change: `clearInterval`, and fire one final heartbeat. Use `navigator.sendBeacon('/api/pageviews/${id}/heartbeat')` in a `beforeunload`/`visibilitychange` handler so the last timestamp survives tab close.

Guard against firing when logged out (`getUserFromBrowser()` empty) — the API would 401 anyway, but skipping avoids noise. Fail silently on network errors; tracking must never break the page.

### Engagement state (`src/app/components/pageviewActivity.ts`)

The tracker classifies the page into one of three states on every heartbeat, using three browser readings:

| State | Reading | Meaning |
|---|---|---|
| `active` | `visibilityState === 'visible'`, `document.hasFocus()`, interaction within `IDLE_MS` (120s) | Being used; advances `active_datetime`. |
| `idle` | Visible and focused, but no interaction past the threshold | Possibly still being read; does not advance `active_datetime`. |
| `hidden` | Backgrounded tab, minimised window, **or** visible-but-unfocused | Certainly not being read. |

Interaction is any of `mousemove`, `mousedown`, `keydown`, `scroll`, `wheel`, `touchstart`, `click`.

Beyond the 30s interval, a heartbeat also fires the moment the page enters or leaves `active`, throttled to one per 5s. Because `active_datetime` is a high-water mark, reporting `active=1` at the instant the student switches away pins it to the true moment they stopped, instead of rounding to the heartbeat interval. Transitions between two inactive states send nothing. An idle timer is armed on each interaction so the `active → idle` boundary is noticed without polling.

### Summing active time

The accumulator holds `{ accumulated_ms, active_since_ms }`: banked time plus one possibly-open interval. Splitting the two lets the total be read mid-interval (which is what a heartbeat does) without mutating anything.

Two details that are easy to get wrong:

- **Monotonic clock.** Intervals are measured with `performance.now()`, never `Date.now()`. A laptop waking from sleep or an NTP correction jumps the wall clock, and the arithmetic would absorb it silently.
- **Idleness is detected late.** The student stops at T; we notice at T + 120s. Crediting to "now" would award two free minutes for having walked away, so `credit_timestamp()` closes the interval at the *last interaction* when going idle. Going hidden is observed as it happens, so that closes at now.

`pagehide` banks the open interval and immediately reopens it at the same instant — that adds nothing to the sum, but keeps the clock running if the page is restored from the back/forward cache instead of actually unloading.

## Step 4 — Tests

Follow existing `test/**/*.test.cjs` convention:
- Migration produces the table and is idempotent.
- POST creates a row with equal start/end and the session's username/IP.
- Heartbeat advances `end_datetime` and only for the owning user (cross-user update affects 0 rows).
- Invalid/oversized `page` is rejected; unauthenticated requests get 401.

## Notes / open questions

- **One row per visit, with a 5-minute reuse window**: a load event first looks for an existing row with the same `username` + `page` whose `end_datetime` is within the last 5 minutes (`REUSE_WINDOW_MINUTES` in `app_pageviews.ts`). If found, that row's `end_datetime` is advanced and its id returned; otherwise a new row is inserted. This keeps a page reload from splintering one visit into many rows. Side effect: leaving a page and returning within 5 minutes resumes the original row, so the gap counts toward that page's duration.
- **The same window bounds a sitting**: heartbeats stop while a machine sleeps, so a gap longer than 5 minutes ends the session (`409`) and the client opens a new row. An uninterrupted tab on one page still records as a single row of any length — 11:30pm to 2am is one row if the student really was there — but a laptop closed in between now produces two rows with the gap excluded, rather than one long false one.
- **Index**: the reuse lookup filters on `username`, `page`, and `end_datetime`. The existing `username` index covers it adequately at current volume; a composite `(username, page, end_datetime)` index would help if the table grows large.
- **IP behind proxy**: `req.ip` is correct because `trust proxy` is already set in `app.ts`.
- **Heartbeat interval**: 30s means max ~30s undercount if a tab closes without the final beacon; `sendBeacon` mitigates this.
- **Volume**: heartbeats are cheap single-row updates, but a busy class could generate steady write load. Consider a retention/cleanup job later if the table grows large. Transition heartbeats add a few requests per visit on top of the fixed 30s cadence; the 5s throttle caps the worst case.
- **Background throttling**: browsers clamp `setInterval` in hidden tabs (Chrome to ~1/sec, then ~1/min after ~5 minutes hidden). So heartbeats from a backgrounded tab arrive late and irregularly. This makes `end_datetime` slightly under-count long background stretches, and means missing heartbeats alone can't distinguish "hidden" from "asleep" from "offline" — which is exactly why the state is reported explicitly rather than inferred from timing.
- **Unfocused counts as hidden**: a student with the page visible in a side-by-side window is recorded as inactive. Deliberate — there is no way to tell reading-alongside from ignoring — but it means `active_datetime` is a conservative floor on engagement, not an exact measure.
- **`active_datetime` is a high-water mark, not a sum**: it records when engagement last happened, so `active - start` includes any idle gaps in the middle of a visit. `active_seconds` (added later) is the true sum; both are kept because they fail in different directions.
- **`active_seconds` is client-supplied**: a determined student can post any total they like. The `LEAST` clamp bounds the lie to the wall-clock time the page was genuinely open — which is server-measured — so the worst case is "claimed full attention for a page they left open," not an arbitrary number. Treat it as good-faith measurement, not as an audit trail, and don't grade on it directly.
- **Existing rows read `active_seconds = 0`**, because they predate the column. Filter reporting to `start_datetime >= ` the deploy date rather than reading 0 as "never engaged."
- **Timestamps are UTC.** 11:30pm EDT is stored as `03:30` the following day, so `GROUP BY DATE(start_datetime)` files late-night studying under tomorrow. Reporting queries need `CONVERT_TZ` or an explicit offset.
