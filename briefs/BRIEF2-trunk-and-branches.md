# Newborn Swing — brief 2: replace the tier ladder with trunk + branches

Read all of this before writing code. This supersedes the checkpoint structure in the
first brief. Everything you have already built stays.

---

## 0. What changed in the teaching plan, and why

The first brief described **12 checkpoints in 4 tiers**, with a main track and a "Going
Further" extension section. That structure has a problem I only saw once it was real:
**tiers have a top.** However they are labelled, students read the highest tier as the
real destination and everything below it as where you stop if you cannot manage more.

Thirteen of my thirty students attend one CS section a week; two attend three. Under a
tier ladder the one-a-week students are permanently near the bottom — not because they
are less able (three of them are among my strongest) but because they have a third of
the contact time. That is the wrong thing to build into the UI.

**The replacement: one shared trunk, then three branches that are peers.**

```
                                      ┌── Visual        (V1–V8)   advanced CSS, images, layout
  Trunk  T0 → T21  ───────────────────┼── Interactive   (I1–I6)   scripts that react to a visitor
  (everyone, no exceptions)           └── Data          (D1–D6)   the page builds itself from a list
```

- **Trunk (23 cards)** — HTML and CSS fundamentals plus the specification and critique
  cards. Nobody skips it; all three branches are built out of it.
- **Three branches (20 cards)** — a *direction*, not a level. Each has a shallow end
  (depth 1) reachable straight from the trunk, and a deep end (depth 3).
- **Students mix branches freely.** This is essential, not a nicety. One card (D4)
  deliberately requires a card from another branch.

**Availability is decided by prerequisites, never by branch membership.** A student is
never "in" a branch and never locked out of one. If they have the prerequisite cards,
the card is open to them. Do not build a "choose your branch" step that filters the
ladder — that would recreate the caste problem in a new shape.

---

## 1. Keep all of this. Do not rebuild it.

Everything in your build brief stands:

- The card drawer, markdown rendering, video embeds, keyword search
- The multi-file web IDE, live preview, watchdog, image upload
- The progress state machine (`not started → in progress → self-checked → confirmed`,
  plus the `needs_work` loop)
- The teacher grid, review modal, read-only IDE view
- The in-app card editor and `/admin/ladder`
- `DO NOTHING` on seed conflict, so in-app card edits survive deploys — **keep this,
  it matters more than ever now that there are 43 cards to write**

This brief changes the *shape of the ladder* and adds cards. It does not change how a
card works or how progress works.

---

## 2. Data model changes

### 2.1 New columns on `checkpoints`

| Column | Type | Notes |
|---|---|---|
| `branch` | text | `trunk` \| `visual` \| `interactive` \| `data` |
| `depth` | int, nullable | 0 for the two concept cards, null for the rest of the trunk, 1–3 for branch cards |
| `session` | text, nullable | Track-A session number, trunk only. Display only — never a gate. |

### 2.2 New table `checkpoint_prereqs`

```
checkpoint_prereqs (checkpoint_id, requires_checkpoint_id)
```

Many-to-many. D4 has two rows. Do **not** store prerequisites as a text column — the UI
needs to resolve them and the ladder editor needs to edit them.

### 2.3 Retire `tier` and `is_extension`

`is_extension` currently drives the main/extension split everywhere. Replace that logic
with `branch = 'trunk'` vs anything else. Keep the columns for one deploy if that is
easier, but nothing should read them once the migration lands.

`tier` is gone entirely. `depth` is not a rename of it — depth is *per branch*, so a
depth-3 Visual card and a depth-3 Data card are peers, not rungs on one ladder.

### 2.4 Migration and existing progress

School starts **Thursday 10 September**, so there should be no student progress yet.
**Check before assuming.** If any `progress` rows exist against C01–C12:

- do not delete those checkpoints,
- map them onto the nearest new code (the old C01–C12 were roughly today's T1–T18),
- and tell me what you mapped rather than guessing silently.

If the table is empty, the clean path is to drop C01–C12 and seed the 43 new ones.

---

## 3. Codes and seed data

`checkpoints_seed.json` accompanies this brief. 43 entries, each with:

```json
{
  "code": "V5", "title": "Side by side", "branch": "visual",
  "depth": 2, "ordinal": 5, "needs": ["V1"], "session": null,
  "goal": "You can put two things next to each other instead of stacked.",
  "self_check": "Do name and price align at the same edge on every single dish?",
  "new_things": "display: flex, justify-content, gap",
  "fix_this": "A dish where the name and price will not share a line.",
  "video_suggested": true
}
```

**Codes are meaningful now and should be used as-is:** `T0`, `T0a`, `T1`–`T21`,
`V1`–`V8`, `I1`–`I6`, `D1`–`D6`. Not `C01`-style. Update the ladder editor's
"next available code" generator accordingly — it should offer the next free code
*within the branch being added to* (`V9`, `I7`, `D7`, `T22`).

All 43 prerequisite references resolve; I checked. `needs` is empty for every trunk
card — the trunk is a sequence, and its order is `ordinal`.

### What to put in the card body at seed time

I have written full markdown for exactly three cards so far: **T0**, **T0a** and **T7
(links)**. Those files come with this brief. Seed them in full.

For the other 40, **seed a stub** built from the JSON — goal, new things, a "now you fix
this" line, and the self-check — under the standard headings. I will fill in the worked
examples through the in-app card editor over the term. Do not block on card content and
do not invent worked examples; a stub with a real self-check is more useful to me than
plausible-looking filler I have to find and rewrite.

---

## 4. UI changes

### 4.1 The ladder forks

The left panel currently lists Main Track then Going Further. It should become:

```
TRUNK                    ← one ordered list, T0 … T21
─────── then choose a direction, or mix ───────
VISUAL          INTERACTIVE          DATA
V1 … V8         I1 … I6              D1 … D6
```

Three branch columns or three collapsible groups — your call on layout. What matters:

- **The three branches are visually equal.** Same weight, same styling, same size. None
  is listed as "advanced" or placed last as though it were the summit.
- **Every branch is always visible to every student.** Not hidden behind a choice.
- **Group branch cards by depth** within the branch, labelled *Depth 1 / 2 / 3* or
  "Start here / Going deeper / Deepest". Not "Level".

### 4.2 Prerequisites in the UI

A card whose prerequisites are unmet stays **visible and clickable** — a student may
legitimately want to read ahead. Show a quiet line at the top of the drawer:

> *Needs T14 first.* (linked)

Do not grey it out, do not lock it, do not block self-check. This is information, not a
gate. My students self-select and I would rather they reach too far than not far enough.

### 4.3 The finish line moves

C08 currently carries a "Finish line" badge. That moves: **finishing the trunk is the
finish line.** A student who completes T0–T21 has a specified, hand-built, working,
publicly-used website. For a one-section-a-week student that is the whole semester and a
complete result.

Put the badge at the end of the trunk. Branch cards are what you do *with* remaining
time, not what you need to be finished.

### 4.4 Rules the UI must not break

These are the same rules as the first brief and they matter more with 43 cards:

- **No percentage complete. No progress bar over the whole ladder. No "X of 43".**
  Students have 1×, 2× or 3× each other's contact time. Any completion metric tells
  two-thirds of my class they are failing at something that is a timetable artefact.
- **No "behind", "incomplete", "remaining", or "locked".**
- Per-branch or per-card progress indicators are fine. A global one is not.
- Never rank the branches, in copy or in ordering.

### 4.5 Suggest mixes

Add a small "Goes well with" area on branch cards, seeded from these combinations:

| Build | Cards |
|---|---|
| Filter buttons that look good | D1 + D2 + I3 + D4 + V6 |
| A photo gallery you can open | V2 + I3 + I4 |
| An order pad | D1 + I3 + I5 |
| A menu that fits a phone | V5 + V7 |
| Sorted by price, styled by category | D2 + D5 + V4 |
| Two pages, one data file | D1 + D2 + D6 + V8 |

A student who assumes the branches are exclusive will not discover these alone. If this
is more than a small addition, skip it — it is the least important thing in this brief.

---

## 5. Ladder editor updates

`/admin/ladder` needs to keep working against the new shape:

- Move a checkpoint **between branches**, not just main/extension
- Set and change `depth`
- **Edit prerequisites** — add and remove, with a check that rejects cycles
- Reorder within a branch
- Next-code generation per branch (§3)
- Keep the existing guard: deleting a checkpoint with student progress stays blocked

---

## 6. One content note that affects starter files

When you build "now you fix this" starters, know this: **HTML almost never fails
visibly.** I tested eight malformed pages in Chrome — text above `<body>`, a `<p>` inside
`<head>`, an unclosed `<h1>`, a closing tag missing its `>`, tags closed in the wrong
order — and every one rendered correctly. The parser silently repairs them.

So for HTML cards, a starter bug must be **content in the wrong place** or **a filename
that does not resolve**. Those fail. Malformed tags do not, and a "broken" example that
renders fine teaches nothing. The `fix_this` lines in the seed JSON already respect this;
do not substitute your own malformed-tag examples for them.

---

## 7. Priority

First class is **Thursday 10 September**. What actually has to exist by then is small.

| | By when | Why |
|---|---|---|
| Migration + seed all 43 + trunk ladder renders | **Sept 10** | Day 1 needs T0 and T0a readable. Nothing else. |
| Branch columns, depth grouping, prereq lines | ~Sept 21 | Nobody reaches a branch card before then. |
| Ladder editor updates | ~Sept 28 | Only I use it. |
| "Goes well with" | whenever, or never | Nice to have. |

If you are short on time, **the migration and the seed are the job.** The branches can
render as a plain list for two weeks without hurting anything.

---

## 8. First response I want

Do not start coding. Reply with:

1. Whether any `progress` rows exist against C01–C12, and what you propose to do with them.
2. Where `is_extension` and `tier` are read in the current code, so we can see the blast radius.
3. Your migration plan, and whether you would keep or drop the old columns.
4. Anything in §4 that fights the current UI structure badly enough to be worth
   discussing before you build it.
