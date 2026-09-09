# Newborn Swing — brief 3: fixes and UX changes after trunk+branches

This brief describes changes made after the trunk+branches restructure (brief 2). Read
it to understand the current state of the codebase before making further changes.
Everything in the earlier briefs still applies; this only adds to it.

---

## 1. Ladder editor rewrite (`views/admin-ladder.ejs`, `routes/admin.js`)

The admin ladder editor was completely rewritten to match the new four-branch structure.

**What the editor looks like now:**

Four stacked sections — Trunk, Visual, Interactive, Data — each with its own list of
checkpoint rows and an "Add" row at the bottom. Each checkpoint row contains:

- ▲ / ▼ arrows to reorder within a branch (calls `POST /admin/ladder/reorder` with
  `{ branch, ids }`)
- Code badge (T1, V2, etc.)
- Title input (auto-saves on change via `PATCH /admin/ladder/:id`)
- Depth select — **Trunk rows have no depth select**; branch rows show Start / Deeper /
  Deepest (values 1, 2, 3)
- Branch select — moving a checkpoint to another branch patches the server and physically
  moves the DOM row; the depth select appears or disappears accordingly
- Prereqs button — shows the count of current prerequisites; opens a native `<dialog>`
  modal with deletable tags and an add-new select; cycle detection is on the server
- Delete button — blocked server-side if any student has progress on the checkpoint

**Server routes (`routes/admin.js`):**

- `GET /admin/ladder` — returns all checkpoints with their prereqs attached
- `PATCH /admin/ladder/:id` — accepts `{ title, branch, depth }` (any subset)
- `POST /admin/ladder/reorder` — accepts `{ branch, ids }`; ordinals are written as
  `BRANCH_OFFSET + position` so ORDER BY ordinal always gives Trunk → Visual →
  Interactive → Data
- `POST /admin/ladder/new` — generates the next code (`T{n}`, `V{n}`, `I{n}`, `D{n}`)
  by scanning existing codes for the branch; adds to the end of that branch
- `DELETE /admin/ladder/:id` — blocked if student progress exists
- `POST /admin/ladder/:id/prereqs` — BFS cycle check, then inserts
- `DELETE /admin/ladder/:id/prereqs/:prereqId` — removes a prereq link

Branch ordinal offsets: `{ trunk: 0, visual: 1000, interactive: 2000, data: 3000 }`.

---

## 2. Case-insensitive card code lookup

Some checkpoint codes are mixed-case — `T0a` is stored in the database with a lowercase
`a`. Earlier code used `.toUpperCase()` on URL parameters before querying, which turned
`T0a` into `T0A` and found nothing.

**The fix:** every SQL query that looks up a checkpoint by code now uses
`UPPER(cp.code) = UPPER($1)` with the parameter passed as-is. This applies in:

- `routes/cards.js` — `GET /cards/data/:code`
- `routes/admin.js` — `GET /admin/cards/:code` and `POST /admin/cards/:code`
- `routes/projects.js` — `POST /projects/try/:cardCode`

Do not use `.toUpperCase()` on checkpoint codes before passing them to SQL queries.

---

## 3. HTML rendering fix in marked

Card content is markdown authored in-app. The marked library (v9) was passing raw HTML
straight through, so any card that mentioned an HTML tag by name — which is almost every
card in an HTML course — would execute that tag rather than display it.

**The fix:** a renderer override added in every view that calls `marked.parse()`:

```javascript
marked.use({
  renderer: {
    html(t) {
      return (t.raw || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    }
  }
});
```

This is set in three places, immediately after the marked `<script>` tag loads:

- `views/cards.ejs` — student card drawer
- `views/web-ide.ejs` — card drawer inside the HTML editor
- `views/admin-card-edit.ejs` — live preview pane of the card editor

**Keep this in all three places.** Without it, any future card that mentions an HTML tag
will silently inject markup into the page.

---

## 4. Card stub re-seed pipeline

Card bodies are generated from `db/checkpoints_seed.json` using a `stubBody()` function
that builds a four-section markdown document (Goal / New things / Now you fix this /
Self-check). The seed script uses `ON CONFLICT (checkpoint_id) DO NOTHING`, so it never
overwrites in-app edits.

A separate script, `db/update_card_stubs.js`, runs on every Heroku deploy (after
`seed_trunk.js` in the Procfile). It does the following:

1. Reads `db/checkpoints_seed.json`
2. Reads all full card files from `content/cards/`
3. For each checkpoint, if the current `body_md` in the database **starts with `## Goal`**
   (indicating it is still a stub that has not been hand-edited), it updates the card:
   - With the full card file content + keywords + starter_json if a full card file exists
   - With the corrected stub body from the JSON otherwise

This means:
- Correcting tag names in the JSON (wrapping in backticks) takes effect on next deploy
- Adding a new full card file takes effect on next deploy, but only if the DB row is
  still a stub
- A card whose body has been edited in the in-app editor (and no longer starts with
  `## Goal`) is never touched

**Full card file naming convention:** files in `content/cards/` can be named
`CODE.md` (e.g. `T0.md`) or `CODE-description.md` (e.g. `T3-headings.md`). Both
`seed_trunk.js` and `update_card_stubs.js` use the `code:` field from the YAML
frontmatter, not the filename, to identify which checkpoint the file belongs to. Always
include `code: T3` (or whatever the code is) in the frontmatter.

**Existing full card files:** `T0.md`, `T0a.md`, `T1a-what-a-tag-is.md`, `T3-headings.md`, `T7.md`

---

## 5. Student dashboard redesign (`views/student-dashboard.ejs`)

The student dashboard was replaced with a minimal project-menu page. It shows one or
more large clickable tiles, one per project:

- **Restaurant Website** — always shown; links to `/cards` (the checkpoint ladder)
- **One tile per assigned sequence** — links to the first problem in the sequence

The queries in `routes/index.js` still fetch both `problems` and `sequences`, but only
sequences are rendered. Standalone problems are not shown on this page.

The tile design is intentionally simple: full-width, large padding, bold project name,
arrow on the right, blue border on hover. No descriptions, no progress bars.

CS students (who have no sequences assigned) see exactly one tile. Middle-school students
with rocket-geometry sequences see those sequences as additional tiles below.

---

## 6. Open Editor button on the cards page

Students need a persistent path to the HTML editor that does not depend on clicking a
specific card. A blue "Open Editor" button was added to the top-right of the
`/cards` page nav. It is shown only to students (not teachers) and links to
`/projects/restaurant`, which finds or creates the student's restaurant project and
redirects to the IDE.

The student flow is now:
1. Dashboard → "Restaurant Website →" → `/cards`
2. From `/cards`: either "Open Editor" (goes straight to the IDE) or click a card to
   read it, then "Try it" if the card has a starter

Teachers see the cards page without the "Open Editor" button (it is wrapped in
`<% if (user.role === 'student') { %>`).

---

## 7. Image upload in the card editor

The admin card editor (`/admin/cards/:code`) now has an "🖼 Upload image" button in the
top-right of the markdown editor area. Clicking it opens a file picker, uploads the
selected image to Cloudinary via `POST /api/upload`, and inserts the resulting
`![](url)` tag at the cursor position in the textarea. The preview updates immediately.

This is the correct way to add images to card content. Do not use relative paths like
`three-ways.png` — they resolve to nothing when the card is rendered in the browser.
Always upload through this button to get a full Cloudinary URL.

---

## 8. "Try it" scratch project behaviour

`POST /projects/try/:cardCode` creates or reopens a scratch project for the current user
seeded with the card's `starter_json`. The behaviour differs by role:

- **Teachers** — always get a fresh copy of the starter files. This allows a teacher to
  update a card's starter JSON, click "Try it", and immediately verify the new files
  without stale content from a previous click.
- **Students** — always reopen their existing scratch project unchanged, preserving any
  work they have done in the exercise.

Scratch projects are keyed by `(user_id, kind='scratch', title='{CODE} scratch')`. The
title uses the canonical DB code (e.g. `T3a scratch`, not `T3A scratch`) because the
lookup is case-insensitive via `UPPER(cp.code) = UPPER($1)`.

---

## 9. Preview watchdog scoped to pages with scripts (`views/web-ide.ejs`)

The preview pane has a 5-second watchdog that replaces the iframe with a "Preview
stopped" error when the heartbeat postMessage is not received. The heartbeat is injected
at the end of `<body>` and fires after all scripts have run.

**Problem:** when a student deliberately breaks an HTML tag (e.g. deletes the `>` from
a closing tag as part of a lesson exercise), the browser's HTML5 parser can stumble and
fail to execute the injected heartbeat script, triggering the watchdog even though there
is no infinite loop — just malformed markup.

**The fix:** `refreshPreview()` checks whether any of the student's files contain a
`<script` tag before arming the watchdog:

```javascript
const hasUserScripts = Object.values(fileMap).some(c => /<script\b/i.test(c));
// ...
if (hasUserScripts) {
  watchdogTimer = setTimeout(() => { ... }, 5000);
}
```

For pure HTML/CSS lessons (the majority of trunk cards), malformed tags now show exactly
what a real browser would show rather than a confusing error message. The watchdog still
activates for any project that includes JavaScript.

---

## 10. Page title shown in preview header (`views/web-ide.ejs`)

The preview pane header previously just said "PREVIEW". Students working on the T2 card
(page skeleton) and later cards have no way to see the effect of their `<title>` tag
because the browser tab shows the IDE's own title.

**The fix:** `refreshPreview()` extracts the `<title>` content from the rendered HTML
with a regex and writes it into a `<span id="preview-title">` in the preview header:

```javascript
const titleMatch = html.match(/<title[^>]*>([^<]*)<\/title>/i);
const titleEl = document.getElementById('preview-title');
if (titleEl) titleEl.textContent = (titleMatch && titleMatch[1].trim()) || '';
```

The preview header now shows e.g. `Blue Door Diner` alongside the "Preview" label,
updating live as the student edits the `<title>` tag.
