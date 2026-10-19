# Questions before revising the I and D cards

Context: these are about cards-interactive-data-revision-brief.md, which revises the
Interactive (I2–I6) and Data (D0–D7) cards in REMAINING-CARDS-lessons-and-scripts.md.

1. **File only, or the app too?** The brief says to edit the REMAINING-CARDS file and
   explicitly not to open or edit any copy inside the Newborn Swing app. The app's copy is
   quite different: its seed has I4 "Show and hide", I5 "Adding up an order", I6
   "Remembering what they chose", and no D0, D1a or D7 at all. Recommendation: edit the file
   only, as the brief says, and make syncing the app to the file a separate job later.

2. **`const` in D0.** The brief says I2 is "the first card that declares names." But D0
   only requires I1, and its demo starts with `const dish = ...`. So a student who takes the
   Data branch before I2 meets `const` with no explanation. Recommendation: add the same
   one-line `const`/`let` explanation to D0. The alternative is to leave it and just report
   it.

3. **"Array" in the D cards.** The rule is to say "list," not "array," to students. But
   D0's "line that lands" is *"An array is the whole menu,"* and D1 and D2 also say "array."
   The brief also says to keep everything in D0 except the demo. Recommendation: change
   "array" to "list" in those student-facing lines and note it in the report.

4. **The Data branch's "How this branch teaches" paragraph.** The brief says to add "the
   same" paragraph the Interactive branch has. That paragraph's examples are
   Interactive-specific: "adding and removing classes instead of setting styles,
   `classList`…". Recommendation: copy it word for word except for the examples in the
   parentheses, which would become the Data branch's own: `map`, `filter`, `reduce`,
   `async`/`await`. Or should it be copied exactly?

5. **I2's missing sections.** I2 currently has no "Where students stick" or "For you, not
   for students" sections, and the brief only specifies the ladder and the "Avoid" list.
   Should a short "Where students stick" be added, built from the ladder's own break-it step
   and the first-match prediction, or only what the brief lists?

## Things to report, not fix (they're in protected sections)

- Line 4's card list still includes T5, which was removed from the app.
- "Colour" (T11, V3) and "apologise" (Summary) use British spelling.
- The Summary's "Short, if time" row includes V2 and I6, but the top "If you have time" row
  doesn't.
- I1's script says to open the browser console and "show exactly where to click." Students
  now use the app's read-only console tab instead.
