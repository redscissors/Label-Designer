# Project Status & Handoff — FloorTrack

A quick orientation for picking this project back up (in a new Claude Code
session, a local editor, or by a teammate). For architecture details see
[`CLAUDE.md`](CLAUDE.md); for setup/deploy see [`README.md`](README.md).

## Where everything lives

| Thing | Location |
|---|---|
| Source code | GitHub: `redscissors/Flooring-Tracker` (renamed from `Label-Designer`) |
| Main branch (deployed) | `main` |
| Dev branch | `claude/floortrack-app-dev-u3bucp` |
| Live site | https://flooringkeeper.netlify.app |
| Hosting | Netlify — auto-deploys `main` on every push |
| Database + Auth + file storage | Supabase project `mzftplcyfotlzolqeapl` |

> The source of truth is GitHub. Supabase and Netlify state live in those
> accounts, **not** in the repo — keep those account logins.

## Heads-up: repo was renamed

The repo was renamed `Label-Designer` → `Flooring-Tracker`. GitHub keeps a
redirect so old links/clones still resolve, but **a Claude Code session that was
started against the old name can no longer `git push`** (only the GitHub API
redirect keeps working). For new work, start a fresh session pointed at
`redscissors/Flooring-Tracker` and it will push normally.

## How deploy works

Push to `main` → Netlify rebuilds and publishes automatically. Supabase
connection values are baked into [`netlify.toml`](netlify.toml) (the publishable
key is public by design; Row-Level Security protects the data), so builds need
no extra configuration.

## What's done

- v2 app: customers, areas, products, tile grout/mortar calculations, pricing,
  versions, CSV/print/PDF export, JSON backup/restore.
- Cloud sync via Supabase (one `app_data` row per user).
- Attachments in Supabase Storage (private, per-user).
- Email/password login, **sign-in only** (accounts created by admin).
- Invite / password-reset flow: a "Set your password" screen appears when a user
  arrives via an invite or reset link; the sign-in screen has a
  "Forgot password / first time" option.
- Live on Netlify with auto-deploy from `main`.

## Pending / to verify

- [ ] Run [`supabase/storage.sql`](supabase/storage.sql) once (enables attachments).
- [ ] Create team user accounts: Supabase → Authentication → Users → Add user
      (tick *Auto Confirm User*); turn OFF "Allow new users to sign up".
- [ ] Set Supabase Auth **Site URL** to `https://flooringkeeper.netlify.app`
      and add `https://flooringkeeper.netlify.app/**` to Redirect URLs
      (so invite/reset links open the live site, not localhost).

## Not implemented (future)

- **AI "Scan handwritten notes."** Needs the Anthropic API key in a serverless
  function (Netlify Function / Supabase Edge Function) — the browser must never
  hold the key. See the note at the end of `CLAUDE.md`.

## Run it locally

```bash
git clone https://github.com/redscissors/Flooring-Tracker.git
cd Flooring-Tracker
npm install
# create .env (values are also in netlify.toml):
#   VITE_SUPABASE_URL=https://mzftplcyfotlzolqeapl.supabase.co
#   VITE_SUPABASE_ANON_KEY=sb_publishable_oa96t2IYhNv_UE3nCx0LCw_s_amtTtO
npm run dev
```
