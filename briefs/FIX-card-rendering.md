# Fix: HTML tags in card text are being executed, not shown

## The bug

Card content is rendered as markdown, and the renderer is passing raw HTML straight
through to the page. Every card that mentions an HTML tag by name is broken.

On card **T3**, the "New things" field contains `<h2> <h3>`. Those became two real,
empty heading elements — so the field renders as **blank**. Worse, "Now you fix this"
contains the text *"every single line is an `<h1>`"* — that `<h1>` opened a genuine
heading element, and the rest of the sentence is now displayed as a giant headline
inside the card.

**11 of the 43 cards are affected:** T2, T3, T4, T5, T6, T7, T8, T9, V1, I1, I3. It will
get worse as more cards are written, because this course is *about* HTML — nearly every
card will mention a tag.

## Two fixes, both needed

**1. Escape raw HTML when rendering card bodies.** Card content should be treated as
text, never as markup. Tags must show as characters, and code fences and backticks
should still work normally. This is also a safety fix: cards are authored in-app, so
right now anything typed into the card editor is injected into the page.

Whatever markdown library is in use, this is usually one option — disable raw HTML
passthrough, or escape before rendering. Apply it in **all three** places card content
is displayed: the student card drawer, the drawer inside the IDE, and the live preview
pane of the in-app card editor. The preview must match what students see, or I will
write cards against the wrong rendering.

**2. Re-seed with the corrected JSON.** The attached `checkpoints_seed.json` now wraps
every tag name in backticks so they render as inline code. Since the seeder is
`DO NOTHING` on conflict, re-running it will not update existing rows — so for these
fields specifically, run a one-off update from the JSON. Do not wipe and re-seed the
whole table; that would discard any card bodies already edited in-app.

## While you are in there

Add a **"Try it"** button to the card drawer wherever a checkpoint has starter files.
It should create or reopen that student's scratch project for the card, load the starter
files, and show the preview. This was in the original brief and it is the thing that
turns a card from a description into a lesson — every card's "Now you fix this" section
assumes the student can open the broken page in one click.

`T3-headings.md` is attached as a fully written example, including its `starter:` block,
so you can check the button against a real card.
