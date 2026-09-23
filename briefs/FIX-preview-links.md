# Fix: links do not work in the preview pane

Clicking a link to another project file in the preview returns **Internal Server Error**.
This blocks checkpoint T7 (Links) completely, and V8 (More than one page) later.

## What is actually happening

The preview is an `<iframe sandbox="allow-scripts" srcdoc="...">`. A `srcdoc` document has
**no URL of its own**, so it inherits the *parent page's* base URL for resolving relative
links. I verified this:

```
href="farms.html"  in the preview
  → resolves to  https://<app>/projects/farms.html
  → hits Express, matches no route
  → 500 Internal Server Error
```

The student's HTML is correct. The preview is resolving their link against the IDE's own
address instead of against their project.

Two related symptoms from the same cause:

- **External links** (`https://...`) navigate the *preview frame itself* away to that site,
  replacing the student's page with no way back.
- `mailto:` and `tel:` links do nothing at all.

## The fix

Intercept clicks inside the preview and handle them in the parent. Do **not** try to fix
this with `<base href>` — there is no real URL for the project's files to point it at.

`preview-nav.js` is attached and working. It exports `INJECT`, a small script appended to
every preview document, which cancels link clicks and posts the intent to the parent:

```js
parent.postMessage({ __preview: true, kind: kind, href: raw }, '*');
```

`kind` is decided by the href's scheme:

| href | kind | what the parent should do |
|---|---|---|
| `farms.html`, `./farms.html` | `internal` | rebuild the preview from that project file |
| `https://…`, `http://…` | `external` | `window.open(href, '_blank', 'noopener')` |
| `mailto:`, `tel:` | `special` | show a small note; do not navigate |
| `#specials` | *not intercepted* | the browser scrolls within the page, which is correct |

### Parent side

```js
window.addEventListener('message', (e) => {
  if (e.source !== previewFrame.contentWindow) return;   // required: origin is "null"
  const d = e.data;
  if (!d || d.__preview !== true) return;

  if (d.kind === 'internal') {
    const target = d.href.split('#')[0].split('?')[0].replace(/^\.\//, '');
    if (files[target] === undefined) {
      showNote('Broken link: there is no file called ' + target);
    } else {
      renderPreview(target);      // same builder you already use for index.html
    }
  } else if (d.kind === 'external') {
    window.open(d.href, '_blank', 'noopener');
  } else {
    showNote('This link opens ' + d.href + ' outside the browser.');
  }
});
```

The frame's origin is opaque (`"null"`), so **check `e.source`, not `e.origin`.**

### Also needed

- **A breadcrumb** above the preview showing which file is displayed, e.g. `index.html`,
  and a way back. Without it a student who clicks through to `farms.html` has no idea why
  their menu vanished.
- **Reset to `index.html`** whenever the student edits a file or presses Run.
- The preview builder must inline `style.css` for **whichever file is showing**, not just
  `index.html`. Verified working — `farms.html` keeps its styling after navigation.

## Watch out for this when you implement it

The injected string contains a literal `</script>`. If you embed it in a page inside
another `<script>` block, it closes that block early and the page breaks with
*"Invalid or unexpected token"*. This bit me while testing, and it is the same class of
bug already fixed once in this codebase.

Escape it on the way out:

```js
JSON.stringify(INJECT).replace(/<\//g, '<\\/')
```

## Verified behaviour after the fix

| Action | Result |
|---|---|
| Click `farms.html` | preview shows Our farms, stylesheet still applied |
| Click `index.html` from there | back to the menu |
| Click the FDA link | opens in a new tab, preview untouched |
| Click `farm.html` (typo) | "Broken link: there is no file called farm.html" |
| Click `www.fda.gov/food` (no `https://`) | treated as a filename, reports broken link |

That last row matters: it is the exact mistake T7 asks students to find, and the message
now says what the card says will happen — the browser looked for a *file* by that name.
Before this fix it produced a 500, which teaches nothing.
