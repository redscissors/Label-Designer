---
issue_type: Task
summary: Move saved versions out of the customer blob into their own table, auto-snapshot a job when someone stops working on it with changes made (keep the newest 5 autos, unlimited named), and reshape the sidebar into a recency-first list with server-side search.
status: open
labels: [ready-for-agent]
---

# Versions as first-class records, auto-versions on deselect, recency-first list

## Problem / Why

Three related pressures, all downstream of growth:

1. **Version history bloats every save.** Saved versions live *inside* each
   customer's `data` jsonb. `updateCust` rewrites the whole blob — on every
   keystroke of the name/notes fields — so every snapshot ever saved rides along
   on every save, forever. Issue 001 flagged this ("saved versions accumulate
   invisibly"); this ticket fixes it rather than working around it.
2. **Versions only exist when someone remembers.** Snapshots are manual-only. The
   moment that actually needs protecting — someone reopens a finished estimate
   and edits it — leaves no trace unless a person thought to save a version
   first. An automatic safety net should capture the state of a job whenever a
   work session on it ends with changes made.
3. **The flat list won't scale to hundreds.** The sidebar renders every visible
   customer in one scroll, split only into "mine" / "shared". Since the team
   marks most jobs Public, at hundreds of customers that split doesn't help;
   finding work means scrolling or searching a list that's all noise.

These were designed together in conversation with the product owner; the
sequencing matters — moving versions to their own table (item 1) is what makes
auto-versioning (item 2) cheap and safe.

## Goals

1. **Customer saves stay small forever.** Editing a customer never re-uploads
   its version history; per-keystroke saves carry only live data.
2. **No silent loss of a finished estimate.** Any edit session that changes a
   job's selections leaves a restorable snapshot behind, automatically.
3. **Named milestones are sacred.** Hand-named versions are unlimited and never
   evicted by automatic snapshots.
4. **The everyday list surfaces current work first.** Recently-touched jobs are
   at hand; the long tail is browseable but out of the way; search reaches
   everything.

## Non-goals

- Not changing the Private/Public sharing model or the archive feature.
- Not changing what a version *contains*: a snapshot is still the areas/products
  (`categories`) only — not name, notes, phone, or attachments. Restore still
  replaces only `categories`.
- Not building full pagination / infinite scroll of the customer list. The light
  list (issue 001) still loads all rows up front; only search moves server-side
  and the presentation changes. True pagination remains deferred until the list
  itself is slow.
- Not versioning settings or the catalog.

> **Conflict surfaced deliberately:** issue 001 listed "no server-side search"
> and "no storage re-architecture" as non-goals *at that ticket's scale*. The
> product owner has since chosen to plan past that: this ticket moves versions
> into their own table and puts search server-side. This supersedes those two
> deferrals; 001's light-list design itself is unchanged.

## Who uses this & how

The same small team of contractors on a shared pool of Public jobs. Typical
rhythm: open a job, adjust selections, click over to another job or sign out.
Versions matter most when a *finished* estimate gets reopened and reworked —
the previous numbers must be recoverable without anyone having planned for it.

## Requirements

### A. Versions become their own table

- New `versions` table: one row per snapshot, belonging to a customer. Each row
  carries a label, saved-at time, an `auto` flag, and the snapshot (the
  customer's `categories` at that moment).
- Access follows the customer: anyone who can **see** a customer can see its
  versions; anyone who can **edit** it can save, restore, and delete versions.
  Deleting a customer deletes its versions.
- Existing snapshots are **migrated** out of every customer's `data.versions`
  array into the table, then stripped from the blob. Migration is idempotent
  and loses nothing (labels, timestamps, order preserved; all migrated rows are
  non-auto since they were saved by hand).
- After migration, customer saves (`updateCust`) never carry version history.
  The versions modal loads its rows only when opened.
- **Backup export/import must keep working:** export includes each customer's
  versions (pulled from the table); import restores them as rows for the newly
  created customer. A backup taken before this change (versions inside the
  customer objects) must still import correctly.

### B. Auto-version when a work session ends with changes

- **Trigger — deselect:** when the person switches away from a customer they
  had open (picks another job, deletes it, or closes the detail view), and the
  job's selections (`categories`) differ from when they opened it, an automatic
  version is saved. (Decided: deselect, not archive/close — it fires on every
  edit session, so the safety net covers editing, not just closing.)
- **Trigger — sign-out:** signing out snapshots the currently open customer by
  the same rule, so ending the day on a job doesn't skip the net. (Decided —
  added to narrow the tab-close gap.) A browser/tab close without sign-out
  cannot be caught reliably and is accepted: the *data* is already saved
  per-keystroke; only the version marker is missed.
- **Change guard:** no change since open → no snapshot. Flipping between
  customers without editing must never create versions. "Change" means the
  `categories` content differs from the baseline captured when the job was
  opened; edits to name/notes/phone/attachments alone do **not** trigger a
  snapshot (consistent with what a snapshot contains).
- **Retention — decided:** keep the **newest 5 automatic** versions per
  customer; older autos are pruned as new ones arrive. **Named versions are
  unlimited and never pruned** — no burst of auto-saves may ever evict a
  hand-named milestone. Autos are only ever evicted by newer autos.
- Auto versions get a recognizable generated label (e.g. "Auto — May 12, 3:41
  PM") and are visually distinguished from named versions in the modal.
- Restoring or deleting an auto version works exactly like a named one.

### C. Recency-first sidebar with server-side search

- A **"Recent"** section tops the list: the last ~10 customers touched by
  anyone (by the job's last-updated time, which the backend already tracks).
- The remaining customers sit below in collapsed/grouped browse form — grouping
  presentation (time buckets like "This month / Earlier / Older" vs. A–Z
  letters) is an implementation choice; the requirement is that the long tail
  is scannable without dominating the sidebar.
- **Search moves server-side:** typing in the search box queries the backend
  across name, address, phone, email (debounced), so search behavior no longer
  depends on every row being in client memory. Search still spans active +
  archived with archived results badged (001's rule, unchanged).
- Sort toggle (Newest / A–Z), Active/Archived toggle, and the mine/shared
  distinction may be reshaped to fit the new layout, but archive browsing and
  the Public badge must remain reachable.

## Scope edges & rules

- **Two people on one job:** a deselect snapshot captures the blob as it stands,
  which may include another person's concurrent edits. Accepted (same
  last-write-wins stance as all Public editing).
- **Identical content, saved twice:** the change guard compares against the
  baseline from open, so re-opening and re-closing without edits saves nothing.
  It does *not* dedupe against older history — reverting a job by hand to match
  an old snapshot and deselecting may save an auto identical to that old
  snapshot. Accepted; not worth the complexity.
- **Restore counts as a change:** restoring a version alters `categories`, so
  deselecting afterwards saves an auto of the restored state. Accepted — it's an
  accurate record of the session.
- **Imported backups** may carry more than 5 autos for a customer; import them
  as-is. The prune rule applies on the next auto insert, not retroactively at
  import.
- **New/empty jobs:** creating a customer, doing nothing, and clicking away must
  not snapshot (empty → empty is no change).

## Open business questions

_None — trigger, retention, sign-out behavior, and eviction rules were decided
in conversation with the product owner (2026-07-02)._

## Out of scope / future

- **Version author attribution** (`author_id` on version rows, shown in the
  modal) was discussed and deliberately left out for now; the schema should not
  preclude adding it later.
- Per-version summary stats (sq ft / estimate total cached on the row) and a
  "what changed" diff view — natural follow-ups once versions are rows, not in
  this ticket.
- Job lifecycle statuses (Quote → In Progress → Done) — a separate idea from the
  same planning conversation; archive stays binary here.
- True list pagination / infinite scroll — still deferred per issue 001.

## Notes for engineering

- **Table sketch:** `versions (id text pk, customer_id text not null references
  customers(id) on delete cascade, label text not null, auto boolean not null
  default false, saved_at timestamptz not null default now(), snapshot jsonb not
  null)`, index on `(customer_id, auto, saved_at desc)`. RLS mirrors the
  customer row's rules by joining to `customers` (select: owner or public;
  insert/update/delete: owner or public — i.e. "can edit"). No guard trigger
  needed: version rows have no owner-only fields.
- **Migration** can follow the proven `migrateLegacyCustomers` pattern: on
  first load, for each full customer whose `data.versions` is non-empty, insert
  rows (`ignoreDuplicates` on the existing version ids keeps it idempotent),
  then strip `versions` from the blob with a narrow update. Alternatively a
  one-time SQL block in `schema.sql` like the shared-settings seed; either
  works, pick one and keep it idempotent.
- **Write paths:** add narrow helpers (`saveVersion`, `deleteVersion`,
  `loadVersions(customerId)`) beside `setArchived`/`setVisibility`; `custData()`
  additionally strips `versions`; `confirmVersion`/`delVersion`/`loadVersion`
  stop going through `updateCust` for the history itself (restore still writes
  `categories` via `updateCust`).
- **Deselect hook:** selection is the single `selId` state. Capture a baseline
  (`JSON.stringify(categories)`) when a customer's full detail arrives
  (`loadDetail`) and on each snapshot; on `selId` changing away — and in the
  sign-out handler — compare current `categories` to the baseline and insert an
  auto row if different, then prune that customer's autos beyond the newest 5
  (client-side delete is fine in this last-write-wins world).
- **Prune ordering:** insert the new auto first, then delete `auto = true` rows
  for that customer beyond the newest 5 — never touch `auto = false`.
- **Recent list:** the light-list query (`loadCustomers`) additionally selects
  `updated_at` (already trigger-maintained on `customers`); "Recent" is a sort
  over that. Server-side search via PostgREST `or(ilike...)` across
  `data->>name/address/phone/email`, debounced ~250ms; at today's scale results
  can merge into the already-loaded list keyed by id.
- **Backup:** `exportBackup` gains a per-customer pull from `versions`
  (re-embedding them as `versions: [...]` inside each exported customer keeps
  the file format backward-compatible); `importBackup` inserts version rows
  (fresh ids, remapped `customer_id`) instead of leaving them in the blob —
  which also transparently handles pre-change backup files.
