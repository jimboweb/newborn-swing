/* ============================================================
   preview-nav.js  —  makes links work inside the preview pane.

   THE PROBLEM
   A srcdoc iframe inherits the PARENT page's base URL. So a
   student's href="farms.html" resolves against the IDE's own
   address (e.g. /projects/farms.html), hits Express, and returns
   500 Internal Server Error. External links navigate the preview
   frame away with no way back.

   THE FIX
   Inject a click handler into every preview document. It cancels
   the navigation and postMessages the intent to the parent, which
   either swaps the preview to another project file or opens an
   external link in a new tab.
   ============================================================ */

const CLOSE_SCRIPT = '<' + '/script>';

const INJECT = `
<script>
(function () {
  document.addEventListener('click', function (e) {
    var a = e.target.closest && e.target.closest('a');
    if (!a) return;
    var raw = a.getAttribute('href');
    if (raw === null) return;

    // in-page anchor: let the browser handle it normally
    if (raw.charAt(0) === '#') return;

    e.preventDefault();

    var scheme = /^([a-zA-Z][a-zA-Z0-9+.-]*):/.exec(raw);
    var kind;
    if (!scheme)                          kind = 'internal';
    else if (/^https?$/i.test(scheme[1])) kind = 'external';
    else                                  kind = 'special';   // mailto:, tel:

    parent.postMessage({ __preview: true, kind: kind, href: raw }, '*');
  }, true);
})();
${CLOSE_SCRIPT}`;

/* Build the document string for one project file. */
function buildPreview(files, path) {
  let html = files[path];
  if (html === undefined) return null;

  // inline <link rel=stylesheet href="x.css">
  html = html.replace(
    /<link\b[^>]*rel=["']?stylesheet["']?[^>]*>/gi,
    (tag) => {
      const m = /href=["']([^"']+)["']/i.exec(tag);
      if (!m) return '';
      const css = files[m[1]];
      return css === undefined ? '' : '<style>' + css + '</style>';
    }
  );

  // inline <script src="x.js">
  const scriptTag = new RegExp('<script\\b[^>]*src=["\']([^"\']+)["\'][^>]*>\\s*<\\/script>', 'gi');
  html = html.replace(scriptTag, (tag, src) => {
    const js = files[src];
    return js === undefined ? '' : '<script>' + js + CLOSE_SCRIPT;
  });

  // inject the navigation handler last, so it wins
  if (/<\/body>/i.test(html)) html = html.replace(/<\/body>/i, INJECT + '</body>');
  else html += INJECT;

  return html;
}

module.exports = { buildPreview, INJECT };
