# Add: "What the browser built" panel in the web IDE

Students need to see the tree the browser made from their HTML. Dev tools is not a good
answer for us — it may be locked down on school Chromebooks, and even when it is
available, finding the student's own page inside the preview iframe is not obvious.

A working prototype is attached as `browser-tree-demo.html`. Open it to see the intended
behaviour, then build the same thing into the IDE.

## What it does

A third panel (or a toggle on the preview pane) showing the student's HTML **as the
browser actually parsed it**, indented, with any tag the browser had to add marked in red.

It is read-only. It does not touch their file.

## Why not a "tidy my code" button

Do not build one, and do not turn this into one.

The point of checkpoint T8 is that a student indents their own file and discovers a
mistake because the shape will not line up. A button that indents for them removes the
mistake before they can find it, and the lesson goes with it. This panel is a
**comparison**, not a fix.

## How it works

No dev tools, no server, no dependencies:

1. `new DOMParser().parseFromString(sourceHtml, 'text/html')` — this uses the browser's
   real HTML parsing algorithm, including all its error recovery, and does **not** execute
   scripts.
2. Walk the resulting tree and print it with two-space indentation per level.
3. Separately, scan the raw source with a tag tokenizer to find opening tags that never
   got an explicit closing tag. Mark those closing tags in the output as added by the
   browser.
4. Show a one-line verdict: either "the browser did not have to add anything" or "the
   browser added N closing tags that you did not write."

The prototype has both steps implemented — `unclosedInSource()` and `build()`. Lift them.

## Where it goes

- A tab or toggle next to the live preview: **Preview | What the browser built**
- Refreshes on the same debounce as the preview, or on an explicit button — your call,
  but it must not lag behind the file
- Works on the student's current project files, using `index.html` as the entry point

## Details that matter

- **Void elements** (`img`, `br`, `link`, `meta`, `hr`, `input`, and the rest) never get a
  closing tag and must not be flagged. The list is in the prototype.
- **Escape the output.** It is HTML being displayed as text. The prototype uses an `esc()`
  helper; without it the panel renders the student's page instead of showing it.
- **Collapse whitespace in text nodes** so long descriptions do not wreck the indentation.
- `html`, `head` and `body` are inserted by the parser when missing. Flagging those is
  correct and instructive — leave it in.

## Nice to have, not required

A line count or short summary at the top: "your file has 24 tags, the browser's version
has 27." Only if it is cheap.
