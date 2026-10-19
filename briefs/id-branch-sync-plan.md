# Plan: sync the app's Interactive and Data cards with REMAINING-CARDS

**Source of truth:** `briefs/REMAINING-CARDS-lessons-and-scripts.md`, the I2–I6 and D0–D7
cards as revised on 2026-10-19.

**Never touched:** the trunk (T cards), the Visual branch (V cards) and I1, in the seed
file or in the database, even where the REMAINING-CARDS file differs.

## What the app has now

The app keeps each checkpoint in `db/checkpoints_seed.json` (title, depth, prerequisites, and
four short fields: goal, new things, fix this, self-check) and in the database. Every I and
D card in the app is a short auto-generated **stub** built from those four fields. None has
full card text yet. Locally there is no student progress on any of them. **Production has
not been checked yet.**

## What changes

| Code | Now in the app | After the sync | Depth | Needs |
|---|---|---|---|---|
| I2 | Finding something on the page | same title | 1 | I1 (same) |
| I3 | Responding to a click | same title | 2 | I2 (same) |
| I4 | Show and hide | **Hiding many things** | 2 | I3 (same) |
| I5 | Adding up an order | **Collapsing a section** | 3 → **2** | I3 (same) |
| I6 | Remembering what they chose | **Tabs** | 3 → **2** | I5 → **I4 + I5** |
| D0 | — | **new:** A thing with named parts | 1 | I1 |
| D1 | The menu as a list of data | **Getting the menu from the data service** | 1 | I1 → **D0** |
| D1a | — | **new:** Waiting for the data | 2 | D1 + I3 |
| D2 | Building the page from the data | same title | 2 | D1 → **D1a** |
| D3 | When the data is wrong | same title | 2 | D2 (same) |
| D4 | Filtering | same title | 3 | D2 + I3 (same) |
| D5 | Sorting | same title | 3 | D2 (same) |
| D6 | One file, many pages | **One data service, many pages** | 3 | D2 (same) |
| D7 | — | **new:** Adding up an order | 3 | D2 + I4 |

- **Order on the ladder:** I2–I6 keep their places. The Data branch is renumbered D0, D1,
  D1a, D2 … D7, all still after the Interactive branch.
- **Video flag:** on only for the cards the file marks "Video: YES": I3 (newly on) and D2
  (already on). "Short, optional" cards stay off.
- **Card text:** each card's goal, new things, fix this and self-check are rewritten to match
  the file (drafts in the appendix, for your review). The cards stay stubs, so a full card
  file written later replaces them automatically, the way T3 and T7 did.
- **About I1:** I1's own row, card and prerequisites are not touched. Two links that point
  *at* I1 change, because they belong to D cards: D1 stops requiring I1, and the new D0
  requires it.

## How it is done, and how the protected cards are kept safe

1. **Seed file.** In `db/checkpoints_seed.json`, replace the I2–I6 and D1–D6 entries and add
   D0, D1a and D7. Before and after, fingerprint (SHA-256) every T, V and I1 entry and
   confirm they are byte-identical.
2. **A new one-time script, `db/sync_id_branches.js`,** instead of the existing seeder:
   - It acts only on a fixed list of codes: I2–I6, D0, D1, D1a, D2–D7. It refuses to touch
     anything else.
   - It sets each listed card's prerequisites exactly. This removes old links like "D1 needs
     I1", which the existing seeder can never remove.
   - Before changing a card, it saves the card's current text as a revision (the app's
     existing card-history feature). It rewrites only cards that are still stubs. A card
     someone has edited in the admin card editor is reported and left alone.
   - It runs as one database transaction. It fingerprints every T, V and I1 checkpoint,
     card and prerequisite before and after, and rolls everything back if anything differs.
   - **Why not the existing seeder:** `seed_trunk.js` re-writes every T and V checkpoint
     too, and it only ever adds prerequisites, so the old links would stay.
3. **Local first.** Run it against the local database, then you check the ladder and the
   cards on localhost.
4. **Production, only after you approve:**
   - A read-only check of production first: student progress on the changed cards, and any
     I or D card edited in the admin editor.
   - A full database backup with `heroku pg:backups:capture`.
   - Deploy, then run the script once with `heroku run node db/sync_id_branches.js`. It is
     not added to the release step, so later ladder-editor changes are not undone on every
     deploy.

## Questions

1. **Card text.** Rewrite the stubs' four fields from the file (recommended; drafts below),
   or leave card text alone and sync only titles, depth, prerequisites and the video flag?
2. **Existing student progress on cards whose meaning changes.** I4, I5, I6, D1 and D6 keep
   their codes but now teach something different. For example, a student who finished the
   old I5 "Adding up an order" would show as having finished "Collapsing a section." If the
   production check finds progress on any of these, which do you want?
   - (a) keep it as is (simplest)
   - (b) clear it for those cards only
   - (c) stop and decide card by card
3. **Video flag.** On only for "Video: YES" cards (I3, D2), as above? Or also for "short,
   optional" ones?
4. **May I run the read-only production check now,** so the plan can use real numbers?

## Appendix: drafted card fields (student-facing)

**I2 · Finding something on the page**
- Goal: You can find something on your page from JavaScript and change its words.
- New things: `querySelector`, `textContent`, where the script tag goes
- Fix this: A script tag in the `<head>`, so the script runs before the heading exists and
  finds nothing.
- Self-check: Did the words on the page change? Does your HTML file still say the old words?

**I3 · Responding to a click**
- Goal: Something on your page reacts when a visitor clicks it.
- New things: `addEventListener`, `<button>`, `style.display`
- Fix this: `style.display = none` with no quotes, so the console tab says
  `none is not defined`.
- Self-check: Write down what should happen before you click. Did exactly that happen?

**I4 · Hiding many things**
- Goal: One button hides every meat dish, and a second click brings them back.
- New things: `querySelectorAll`, `for...of`, a variable that remembers yes or no
- Fix this: A button that hides the meat dishes but never brings them back, because
  `let meatHidden = false;` sits inside the click function.
- Self-check: Click twice. Are you back where you started?

**I5 · Collapsing a section**
- Goal: A visitor can close and reopen each section of your menu.
- New things: `id`, the `#` selector
- Fix this: An `if` with one equals sign, so the section hides on every click and never
  comes back.
- Self-check: Click each section's button twice. Is every section back where it started?

**I6 · Tabs**
- Goal: Your menu shows one section at a time, picked with tabs.
- New things: hiding them all, then showing one
- Fix this: A tab that shows its panel first, then hides every panel, including its own.
- Self-check: Click every tab in turn. Is exactly one panel showing each time?

**D0 · A thing with named parts**
- Goal: You can write one dish as an object, and the menu as a list of them.
- New things: objects, dot notation, a list of objects
- Fix this: A dish written with equals signs instead of colons: `{ name = "Soup" }`.
- Self-check: Log `menu.length`. Does it match the number of dishes you wrote?

**D1 · Getting the menu from the data service**
- Goal: Your page asks your data address for the menu, and you can see the dishes in the
  console tab.
- New things: the data address, JSON, the block that asks for it
- Fix this: `console.log(dishes)` outside `showMenu`, where `dishes` does not exist yet.
- Self-check: Does the console tab show every dish from your Menu data grid?

**D1a · Waiting for the data**
- Goal: Your page shows a loading message until the menu arrives.
- New things: "when the data arrives, then…"
- Fix this: Code that uses the dishes before they have arrived, so the console tab says
  `dishes is not defined`.
- Self-check: Add `?delay=3` to your data address. Do you see the loading message first,
  then the menu? Take the delay off afterward.

**D2 · Building the page from the data**
- Goal: The HTML for your dishes is written by your code, not by you.
- New things: `for...of`, building up a piece of text, `innerHTML`
- Fix this: A loop that only ever shows the last dish.
- Self-check: Add a dish in the Menu data tab only. Does it appear without you touching the
  HTML?

**D3 · When the data is wrong**
- Goal: Your page copes with a dish that is missing something.
- New things: `if`, defaults, empty states
- Fix this: A dish with no description, printing `undefined` on the page for everyone to
  see.
- Self-check: Clear one dish's description in the Menu data tab. Does the page still look
  deliberate?

**D4 · Filtering**
- Goal: A visitor can choose to see only some of the dishes.
- New things: a loop with `if` and `push`, `includes`, given/when/then
- Fix this: A filter that misses a dish because its dietary note says "Vegetarian" with a
  capital V.
- Self-check: Choose each filter. Does the number of dishes shown match what you counted by
  hand?

**D5 · Sorting**
- Goal: A visitor can put the menu in price order.
- New things: `sort`, a recipe for sorting by price
- Fix this: A price sort that puts 10 before 9.
- Self-check: Sort by price. Read the prices top to bottom. Are they really in order?

**D6 · One data service, many pages**
- Goal: More than one page of your site reads the same data address.
- New things: reusing the data address
- Fix this: Two pages with two copies of the menu that have drifted apart.
- Self-check: Change one price in the Menu data tab. Did it change on every page?

**D7 · Adding up an order**
- Goal: A visitor can pick dishes and see the total.
- New things: a list for the order, a loop with a position number, a total worked out every
  time
- Fix this: A total showing `16.990000000000002` instead of `16.99`.
- Self-check: Add three dishes. Does the total match what you work out on paper?
