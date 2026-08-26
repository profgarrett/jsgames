# Smoothing out jsgames deploys

Two problems, addressed separately: the ~5 minute deploy itself, and what happens to a student mid-game when a deploy lands under them.

I read `deploy.sh`, `build.sh`, `Api.ts`, and `LevelPlayContainer.tsx` to ground this. One assumption worth flagging: I'm reading "students dealing with posts" as the HTTP POST a student fires when submitting a game-page answer (`LevelPlayContainer.tsx`, line ~159) — not discussion-forum posts. If you meant something else, tell me and I'll redo this section.

## What actually happens today

`deploy.sh` does, in order: `ssh ... rm -rf jsgames; mkdir jsgames`, `scp` of `sql/` and `build/`, a conditional nginx config push, `scp` of `package.json`/`package-lock.json`, symlink reset, `npm ci --omit=dev` on the server, then `pm2 reload`. `npm ci` is almost certainly the single biggest cost — it wipes `node_modules` and re-resolves/reinstalls everything from the lockfile on every deploy, even when no dependency changed. The `scp -C` copies of `build/` and `sql/` are the other likely cost, since they're full copies rather than incremental.

There's also a correctness gap, not just a speed one: between `rm -rf jsgames` and the new `build/` finishing its copy, the `public` and `app.js` symlinks point at a directory that's empty or half-populated. The old pm2 process is still serving requests during that window (good), but any request that touches a static asset under `public/`, or anything the running process reads off disk fresh, can 404 during that gap. `npm ci` itself doesn't affect the *running* process (Node already has the old `node_modules` loaded), but it means the server briefly has no `node_modules` directory on disk at all.

## Part 1 — cut deploy time and close the gap

In rough priority order:

1. **Skip `npm ci` when dependencies didn't change.** Deploy.sh already hashes `dreamhost_config/nginx/.../settings.conf` before/after to skip an unneeded nginx step — do the same for `package-lock.json`: hash the server's current lockfile before the `rm -rf`, compare to the local one, and only run `npm ci` if they differ. Most deploys (page tweaks, small feature fixes) don't touch dependencies, so this alone could cut the 5 minutes substantially.

2. **Switch `scp -r` to `rsync -a --delete` for `build/` and `sql/`.** `rsync` only transfers changed files and still removes anything that was deleted locally (matching the "replace, don't merge" comment already in the script for `--pages-only`). On a repeat deploy where most of the client bundle is unchanged, this turns a full copy into a diff.

3. **Deploy to a fresh release directory and swap atomically** (the standard Capistrano/blue-green pattern), instead of `rm -rf jsgames` in place:
   - `scp`/`rsync` into `jsgames-releases/<timestamp>/`
   - run `npm ci` there if needed
   - `ln -sfn jsgames-releases/<timestamp> jsgames-current` (symlink swap is atomic — no window where the target is missing)
   - point `public` and `app.js` at `jsgames-current/...`
   - `pm2 reload`
   - keep the last 2–3 releases and delete older ones, so a bad deploy is `ln -sfn` back to the previous release plus `pm2 reload` — a rollback in seconds instead of a re-deploy.
   
   This is the change most worth making: it removes the "empty directory" window entirely and gives you free rollback, which a solo-maintained production site benefits from a lot.

4. **Instrument the script with timestamps** (`echo "$(date +%T) starting npm ci"` before/after each major step) for one or two real deploys, so you know where the 5 minutes actually goes before optimizing further. Steps 1–3 are well-justified guesses based on reading the script, but a `time` breakdown will tell you if something else (DNS, ssh handshake, DreamHost I/O) is actually dominant.

5. **Smaller wins:** `npm ci` supports `--prefer-offline` if the server's npm cache is warm between deploys; the pm2 script/nginx config copies could get the same before/after hash-skip treatment already used for nginx.

## Part 2 — make in-flight student submissions survive a deploy

Right now, `LevelPlayContainer.onSubmit` (line ~159) fires a raw `fetch(..., { method: 'post' })`, and on *any* failure — network blip, 502 during `pm2 reload`, a transient DB hiccup — the `.catch` at line ~242 does `setLevel(null)` and shows a red error banner. That wipes the in-progress level state client-side, so the student's answer on that page has to be re-entered even though nothing about their actual work was wrong. `Api.ts` already has nicely factored error classification (`NETWORK`, `DB_UNAVAILABLE`, `SERVER_ERROR`, `BAD_RESPONSE`) with friendly messages, but `LevelPlayContainer` doesn't use `postJson` — it has its own inline `fetch` and doesn't retry.

Concrete changes, cheapest first:

1. **Route the submit call through `postJson` and retry transient failures automatically**, 2–3 attempts with a short backoff (e.g. 1s, 3s, 6s) before giving up and showing the error. A `pm2 reload` restart or a brief 502 during the file-copy window is typically seconds, not minutes — a short auto-retry silently rides that out for most students and they never see an error at all.

2. **Don't clear `level` state on a transient error.** Change the `.catch` so `NETWORK`/`SERVER_ERROR`/`BAD_RESPONSE`/`DB_UNAVAILABLE` leave `level` and the student's answer alone and show "Having trouble saving — retrying…" instead of a dead-end red box that discards their work. Reserve `setLevel(null)` for cases where the level genuinely can't be recovered (e.g. 404/`NOT_FOUND`).

3. **Stash the pending submission in `sessionStorage` before firing the POST**, keyed by level id, and clear it only on confirmed success. If the tab reloads mid-failure (student gets impatient and refreshes), the in-progress answer can be restored instead of lost. This is a bigger change than 1–2, so I'd treat it as optional/later.

4. **Schedule deploys for low-traffic windows** where you can (between class sessions, late evening) — this is a process change, not code, but it's the cheapest risk-reduction available and costs nothing to adopt immediately.

5. **Consider pm2 cluster mode (2 instances) instead of fork mode**, if the server has the memory for it. `pm2 reload` in cluster mode restarts instances one at a time, so there's always a process answering requests — today's fork-mode reload has a brief instant where nothing is listening on 9000. This is a bigger infra change than 1–4 and only worth it if 502-during-reload turns out to be a real (not just theoretical) source of student-visible errors.

## Suggested order of attack

Start with Part 1, item 3 (release-directory swap) — it's the single change that both shortens the deploy (less to re-copy/reinstall on unchanged deploys) and removes the correctness gap Part 2 is compensating for. Pair it with Part 2, items 1–2, which are a small, contained change to one file (`LevelPlayContainer.tsx`) and immediately make any *remaining* blip invisible to students, whatever residual gap Part 1 leaves. Items further down each list are worth doing but have lower payoff per effort.

I haven't measured actual deploy-phase timings — item 4 in Part 1 is there so the next deploy tells you whether `npm ci` really is the bottleneck before you spend time on it.
