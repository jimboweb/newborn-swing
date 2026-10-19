# Brief: console tab for Newborn Swing

## Goal

Let students see what their JavaScript prints and where it breaks, without browser developer
tools, which are turned off on the school's Chromebooks. A read-only console tab sits above
the live preview. It is quiet for students who are only writing HTML and CSS, and it comes
forward on its own once they start writing JavaScript.

This supports the Interactive branch (I1 to I6), the Data branch (D0 to D6), and the final
menu website in the Restaurant Row unit. The card file is
`REMAINING-CARDS-lessons-and-scripts.md`.

## What a student experiences

1. Working on HTML and CSS only: a thin **Console** strip above the preview, closed. Nothing
   else changes. A student who clicks it sees an empty panel with a one-line hint.
2. Adds a `.js` file to the project (card I1): the console panel is now **shown**, open at a
   fixed height, without any click.
3. Writes `console.log(...)`, saves, and the preview reloads. The line appears in the
   console.
4. Makes a typo. The error appears in red with the file name and line number, for example
   `menu.js, line 12: Uncaught ReferenceError: dihses is not defined`.
5. Clicks **Clear**, or reloads the preview, and the console empties.

## Behavior: two states

| State | What the student sees | When |
|---|---|---|
| **Collapsed** | A thin strip labeled "Console" above the preview, with a small chevron. Closed. One click opens it. | Default. No `.js` file in the project and no console output yet. |
| **Shown** | The strip plus an open panel at a fixed height, with a Clear button and the messages. The student can still collapse it with the chevron. | The project has at least one `.js` file, **or** any message (log, warning, error, or uncaught error) has arrived from the preview. |

Rules:

- The check for a `.js` file runs whenever the project's file list changes, so adding a file
  in I1 switches the console to Shown immediately.
- Once any message arrives, the console stays Shown until the student reloads the whole IDE
  page. Nothing is saved on the server.
- If the student collapses the panel by hand, keep it collapsed until the next **error**
  arrives, then reopen it. A new log message alone does not reopen it.
- A collapsed console with unread output shows a small dot on the strip, and a red dot if
  any of it is an error.
- Opening the console before any `.js` file exists is allowed. Show: "Nothing here yet.
  Messages from your JavaScript will appear here."

## Scope: four pieces

1. **Injected script.** Added to the preview page each time it is built.
2. **Message listener.** In the IDE, receives and validates what the preview sends.
3. **Console panel.** The list of lines, the Clear button, the collapsed and shown states.
4. **Display formatting.** Readable output for strings, numbers, arrays, objects and errors.

No database changes. No server endpoints. Nothing is saved. Console output lives in the
browser while the IDE is open.

## Injected script

Added to the preview HTML before any of the student's own scripts run, so the student's code
cannot run first. It does four things:

- Wraps `console.log`, `console.info`, `console.warn` and `console.error`. Each wrapper sends
  a message to the IDE and then calls the original method, so the browser's own console still
  works.
- Listens for `window.onerror` and sends the message, file name, line and column.
- Listens for the `unhandledrejection` event and sends the reason. This is how a failed
  `fetch` in D1 shows up when the student has not handled it.
- Sends a "page loaded" message each time the preview reloads, so the IDE can clear old lines.

Use `window.parent.postMessage` with a small object: type (`log`, `info`, `warn`, `error`,
`uncaught`), a list of already-formatted values, and for errors the file and line.

**What it cannot capture.** The red lines real browser developer tools print for a blocked
or missing resource, such as a CORS error, a failed script load or a 404 on an image, are
produced by the browser and are not available to the page. The D1 card should tell students
that a mistyped data address shows as a plain "Failed to fetch" error here, not the longer
message real developer tools would give.

## Message listener (IDE)

- Accept a message only if `event.source` is the preview frame's `contentWindow`. If the
  preview is a sandboxed frame with no origin, checking the origin will not work, and the
  source check is the one to rely on.
- Ignore anything that is not an object with a known `type`.
- Treat everything in the message as untrusted text. Student code controls it.
- Never render message content as HTML. Use `textContent`.

## Console panel

- Placed **above** the live preview, in the same column.
- One line per message. Log and info in the normal color, warnings in amber with a warning
  mark, errors in red with an error mark. Do not use color alone, because the marks keep it
  readable for students who can't tell the colors apart.
- Monospace font, matching the editor.
- Newest message at the bottom. Scroll to the bottom as new lines arrive, unless the student
  has scrolled up.
- A **Clear** button. The panel also clears on each preview reload, so students always see
  output from the current run.
- Uncaught errors show `file, line N:` before the message when the browser provides them.
- A fixed height with its own scrollbar, so a long list cannot push the preview off the
  screen.

## Display formatting

| Value | Shows as |
|---|---|
| string | the text, without quotes |
| number, boolean, `null`, `undefined` | the word, for example `undefined` |
| array | `[ 1, 2, 3 ]`, readable JSON-style text |
| object | `{ name: "Grilled cheese", price: 7 }`, readable JSON-style text |
| array of objects | one object per line, indented, so D1's list of dishes is readable |
| `Error` | `Name: message` on the first line |
| function | `[function]` |
| circular or very deep | `[...]` after about three levels, never a crash |

Several arguments in one `console.log` are joined with a space. Do not build an
expandable tree view in the first version.

## Limits

- Keep at most **500 lines**. Drop the oldest first.
- Cut any single line at **2,000 characters**, ending in `…`.
- Accept at most about **100 messages per second**. After that, drop messages and show one
  line, "N more messages hidden", so a runaway loop cannot freeze the tab.

## Behavior the course depends on

| Card | Needs |
|---|---|
| I1 | The console becomes Shown when the first `.js` file is added. `console.log` output and an uncaught error with file and line both appear. |
| D1 | A mistyped data address shows a "Failed to fetch" error. `console.log(dishes)` prints a readable array of objects. |
| D2 | `console.log` inside the loop shows one line per dish. |
| D3 | `undefined` prints as the word `undefined`. |
| D5 | Numbers print as numbers, for example `10, 11.5, 5.5, 6, 9`. |
| Final project | The tab is available. No special state. |

**Card wording changes.** D0 and I1 currently have students type into the console and read
the answer. This console is read-only, so those cards must change to: write
`console.log(...)` in the JavaScript file, save, and read the result in the console tab.
This is a follow-up for the card file, not part of the build.

## Out of scope

- A typing prompt for running code (a "full" console). It needs messages sent into the
  preview and results sent back, and it is a separate piece of work. It can be added later
  without changing anything above.
- Saving console output, a teacher view of a student's console, or any server storage.
- Expandable object trees, filtering by type, timestamps, or `console.table`.
- Capturing browser-generated errors for blocked or missing resources.

## Discover first

This brief was written without seeing the repository. Before building, confirm:

- **How the live preview is built and served:** iframe `src` or `srcdoc`, sandbox attributes,
  and whether the page has an origin. This decides where the script is injected and how the
  message source is checked.
- How the preview HTML is assembled from the project's files, so the script can be added
  ahead of the student's own scripts.
- How the IDE tabs and layout are built, so the Console strip fits above the preview.
- Whether the IDE already shows a list of project files that the "has a `.js` file" check can
  read.
- Whether the preview reloads on every save, and how the IDE knows when it has.

## Acceptance checks

- [ ] A project with only HTML and CSS shows a closed Console strip and no other change.
- [ ] Clicking the strip opens an empty panel with the hint line.
- [ ] Adding a `.js` file to the project opens the console without a click.
- [ ] `console.log("hello")` in the student's JavaScript shows `hello`.
- [ ] `console.warn` and `console.error` appear with their own marks and colors.
- [ ] A misspelled variable shows an error with the file name and line number.
- [ ] A failed `fetch` with no error handling shows a "Failed to fetch" error.
- [ ] `console.log` of an array of objects prints readably, one object per line.
- [ ] Reloading the preview clears the old lines.
- [ ] A collapsed console shows a dot when output arrives, red if it is an error.
- [ ] A new error reopens a console the student collapsed. A new log line does not.
- [ ] An infinite loop that logs does not freeze the IDE, and the "N more messages hidden"
      line appears.
- [ ] A line of HTML such as `<img src=x onerror=alert(1)>` logged to the console shows as
      plain text and does nothing.
- [ ] A message posted from a different window is ignored.
- [ ] The browser's own console still receives the original messages.
