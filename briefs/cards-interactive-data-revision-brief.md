# Brief: revise the Interactive and Data cards (and nothing else)

## The job

Update the **ladders and outlines** of the Interactive cards **I2 to I6** and the Data cards
**D0 to D7** in `REMAINING-CARDS-lessons-and-scripts.md`, so they match the decisions below.
Several of these cards have already been rewritten in the file you are given. The rest need
the specific edits listed under "Edits still to make."

## What you must not touch

This is the most important part of the brief. Treat these as read-only.

- **The trunk, T1 to T21.** No changes of any kind.
- **The Visual branch, V1 to V8.** No changes of any kind.
- **I1, "Your first script."** No changes of any kind.
- The file's opening section (the video rule, the recording order, and the card list at the
  top), with one exception: if you add or rename a card, the card list on line 4 may change
  to match. Nothing else there.
- **The Summary section at the bottom.** Change only the entries for I and D cards, and only
  if a video decision or a card name changed. Leave every T and V entry exactly as it is.
- Any copy of these cards that lives somewhere other than this file, for example inside the
  Newborn Swing application. Do not open or edit it.

**Before you edit anything**, copy the file to a backup. Then compute and record a checksum
for each protected section: everything from the top of the file down to the line
`# INTERACTIVE BRANCH`, and the I1 card (from `## I1 ·` to the line before `## I2 ·`).
**After you finish**, recompute them and confirm they are identical. If either one differs,
restore from the backup and redo the edit. The Visual branch sits inside the first protected
range, so this one check covers the trunk and the Visual branch.

Also confirm that no heading outside I2 to I6 and D0 to D7 was added, removed, renamed or
reordered.

## The principle behind every change

**Teach the direct way first.** Almost no student will do professional web work, and those
who do can learn professional practice then. Where professional practice is more
complicated, say nothing, or give one line marked "Later, not here." If a card has two
reasonable ways to do something, use the one with fewer new ideas. A card may name one new
thing per step. Do not name a tag, property, method or concept that no earlier card has
introduced.

Specific rules that follow from this:

- **No** `classList`, arrow functions, `map`, `filter`, `forEach`, `reduce`, `async`, `await`,
  *promise*, *callback*, `getElementById`, `getElementsByClassName`, template literals, or
  `data-` attributes anywhere on a core path. A "Later, not here" line may name one.
- Use `for (const x of list)` for looping. It is the Python `for x in list:` loop, and the
  card should say so for Python students.
- Hide and show with `style.display`. A stylesheet class is the neater way for big pages and
  belongs in a "Later" line.
- Say **"list,"** not "array," to students.
- Never read data back out of text on the page. Prices come from the program's data.
- American spelling throughout (color, artifact, apologize).
- Keep each card's existing structure and voice: depth line, **Teaches**, **The line that
  lands**, **For you, not for students**, the ladder or script, **Where students stick**,
  **Avoid**, and the video decision. Change content, not the format.

**The console.** The app will have a **read-only console tab**. It shows `console.log`
output and error messages, and students cannot type into it. So no card may tell a student to
type something into the console. Replace "type X in the console" with "write
`console.log(X)` in the JavaScript file, save, and read the console tab." Anything a card
used to show by typing must become something that can be logged.

## Cards already rewritten (keep as they are)

These already carry the approved text. Do not change them except to fix an inconsistency with
a rule above, and say in your report if you did.

| Card | State |
|---|---|
| I3 Responding to a click | Hides one element, the allergen key, with `style.display = "none"`. Keeps the dead-button video script. |
| I4 Hiding many things | `querySelector` finds one, `querySelectorAll` finds all, `for...of` hides each `.meat` dish, then a `meatHidden` variable flips it back. |
| I5 Collapsing a section | First use of `id`, the `#` selector, ids are unique. Hide and show a section by checking `style.display === "none"`. |
| I6 Tabs | Hide every `.panel` with the I4 loop, then show one by its id. Panels start hidden with inline `style`. Stretch: a `hideAll()` function. |
| D1a Waiting for the data | The `async` and `await` stretch is removed. `.catch` stays as a stretch. |
| D4 Filtering | A loop with `if` and `push`, shown beside the Python loop. `filter` appears only as a "Later" note. |
| D5 Sorting | The sort function is given as a recipe to paste, not explained. |
| D7 Adding up an order | New card. Keeps the order list, an index loop to connect each button to its dish, and the total rebuilt from the list every time. |

## Edits still to make

### I2 · Finding something on the page (needs I1)

Teaches `querySelector` and `textContent`, and where the script tag has to sit. Rewrite the
beats as this ladder:

1. **Starter.** The page already has `<script src="menu.js"></script>` just before
   `</body>`, and `menu.js` has one line in it. There is one `<h1>`, one
   `<p class="special">` (used once), and several `.price` paragraphs.
2. **Find it.** `const heading = document.querySelector("h1");` and
   `console.log(heading.textContent);`. The console prints the heading's words. Say: "The
   selector is the same kind you write in CSS."
3. **Change it.** `heading.textContent = "Blue Door Diner — Closed Mondays";`. The heading
   changes on screen. Point out that the HTML file still says the old words: the script
   changed the page the browser had already built.
4. **Predict.** Ask which price changes if the script finds `.price` and sets its text.
   Only the first. `querySelector` returns the first match.
5. **Change the special.** Target `.special`, the one-of-a-kind line, and change it to a
   new special. This is the realistic use.
6. **Break it.** Cut the `<script>` line and paste it into `<head>`. Reload. The heading no
   longer changes, and the console tab shows an error such as `Cannot set properties of
   null (setting 'textContent')` with the file name and line. Say: "The browser reads the
   page from the top. The script ran before the heading existed, so there was nothing to
   find."
7. **Fix it.** Move the script tag back to the bottom of the body.

Add one line near the first `const`: "`const` is a name you will not change. `let` is one you
will." This is the first card that declares names, and I4 uses `let`.

Keep the video as "short, optional." **Avoid:** `getElementById`, `innerHTML`,
`querySelectorAll`, `defer`, `DOMContentLoaded`. If a student asks about `defer`, the answer
is one line: "There are other ways to tell the page to wait. The bottom of the body is the
simplest."

### D0 · A thing with named parts (needs I1)

Keep everything except the demo, which currently types into the console. Rewrite the demo
as `menu.js` lines with `console.log`:

- `const dish = { name: "Grilled cheese", price: 7 };` then `console.log(dish.name);` and
  `console.log(dish.price);`
- Change it: `dish.price = 8;` then log it. Add a part: `dish.vegetarian = true;` then log it.
- Two dishes in a list, `const menu = [dish1, dish2];`, then `console.log(menu[0].name);` and
  `console.log(menu.length);`
- Logging a whole dish, `console.log(dish);`, prints it as readable text.

Keep the "Say this out loud" line, the Python comparison table, the prototype note in "For
you," the sticking points and the Avoid list. Change "Video: no" only if the new demo needs
motion, which it does not.

### D1 · Getting the menu from the data service (needs D0)

Keep the three-moment demo, the paste block, and the guidance not to explain it. Change
moment 3 so nothing is typed into the console: put `console.log(dishes);` inside
`showMenu`, read the console tab, then change that line to `console.log(dishes[0].name);`.
Add one sentence to "Where students stick": a mistyped data address shows a plain "Failed to
fetch" error in the console tab, not the longer message real developer tools give.

### D2 · Building the page from the data (needs D1a)

Keep the video script and the `for...of` reference loop. Make two changes:

- Replace the hard-coded `"$"` in the reference loop with a comment telling students to use
  their own currency, for example `// use your own currency symbol here`. Students imagine
  restaurants in different countries and worlds, and the grid stores only the number.
- Add one line under "Where students stick": the loop trusts the data, so a dish named
  with HTML tags in it would change the layout. Mark it "Later, not here" and do not teach
  the fix. Do **not** add a `forEach` step.

### Data branch introduction ("Before the cards: the data service")

In the data contract table, add to the `price` row: "Currency is not stored. Students choose
their own symbol when they show a price." Do not change any other row. Add the same short
"How this branch teaches" paragraph that the Interactive branch has, placed under
`# DATA BRANCH`, so both branches state the principle.

### D3 and D6

Read both. If neither breaks a rule above, **leave them exactly as they are** and say so in
your report.

## Report back

When you finish, give a short report:

1. The two checksum results (protected range and I1), before and after.
2. A list of every card you changed, with one line per card.
3. Any rule you could not follow, and why.
4. Anything in a protected section that looks inconsistent with these changes. **Report it.
   Do not fix it.**

## Acceptance checks

- [ ] The checksum for everything above `# INTERACTIVE BRANCH` is unchanged.
- [ ] The checksum for the I1 card is unchanged.
- [ ] No heading outside I2 to I6 and D0 to D7 was added, removed, renamed or reordered.
- [ ] No card tells a student to type into the console.
- [ ] None of `classList`, arrow functions, `map`, `filter`, `forEach`, `reduce`, `async`,
      `await`, `getElementById` or `getElementsByClassName` appears outside a "Later, not
      here" line.
- [ ] I2 has the script-position break-it step and the first-match prediction.
- [ ] D0 and D1 show output with `console.log`, not by typing into the console.
- [ ] D2's reference loop no longer hard-codes a currency symbol.
- [ ] The Summary section's T and V entries are unchanged.
- [ ] American spelling throughout.
