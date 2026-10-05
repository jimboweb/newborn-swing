# Brief: menu data service for Newborn Swing

## Goal

Let students build their restaurant menu page from data that lives outside their code, the way
a real site reads from a database. Students fill in a grid. Their page asks a web address for
the data and builds the menu from what comes back. They never type their data as code, and no
database server needs to be set up beyond the Postgres Newborn Swing already uses.

This supports the data branch (cards D0 to D6) of the Restaurant Row HTML/CSS unit. The card
file is `REMAINING-CARDS-lessons-and-scripts.md`, section "DATA BRANCH".

## What a student experiences

1. Opens the **Menu data** tab in the project IDE and fills in a grid, one row per dish.
2. Copies the **data address** shown on that tab and opens it in a browser tab. The same rows
   come back as JSON text.
3. Pastes a short block into `menu.js` that fetches the address and passes the dishes to a
   function they write. They loop over the dishes and build the HTML.
4. Adds a row in the grid, clicks Save, reloads the live preview, and the new dish appears
   without any code changing. This is the main teaching moment of the branch.

## Scope: five pieces

1. **Storage.** One table of menu rows per project, plus a public id on the project.
2. **Menu data tab.** A spreadsheet-style editor inside the existing project IDE.
3. **Save endpoint.** Authenticated, owner-only, replaces the whole grid in one transaction.
4. **Data address.** A public, read-only GET endpoint that returns the rows as a bare JSON
   array.
5. **Teacher view.** The teacher can see a student's Menu data grid read-only, alongside the
   existing read-only project view.

## Data contract

The columns match the shared model students write in session 1 (T1: name, price, description,
category, dietary notes), in the same order.

| Field | Sent as | Rules |
|---|---|---|
| `name` | text | Required. Always present. |
| `price` | JSON number | A number, never text, so sorting behaves as card D5 teaches. **Omit the field when the cell is blank.** |
| `category` | text | For example "Sandwiches". Omit when blank. |
| `description` | text | **Omit the field when the cell is blank.** Do not send `null` or empty text. Card D3 demonstrates the page showing `undefined` and depends on this. |
| `dietary` | array of text | The dietary notes, entered comma-separated in the grid, for example `["vegetarian", "gluten-free"]`. **Always an array, `[]` when there are none**, so `dish.dietary.includes(...)` never throws. **Store and return the words exactly as typed.** Do not lowercase or trim case. Card D4 breaks the filter by changing `vegetarian` to `Vegetarian` in the grid, and it only works if that is possible. |

Keys appear in the order above. Rows come back in grid order.

Example response:

```json
[
  {
    "name": "Blueberry pancakes",
    "price": 9,
    "category": "Breakfast",
    "description": "Three big pancakes with warm blueberries and maple syrup.",
    "dietary": ["vegetarian"]
  },
  {
    "name": "Turkey and apple",
    "price": 10,
    "category": "Sandwiches",
    "dietary": []
  }
]
```

**Open question to confirm:** T1 has the class argue about which fields are required, including
a soup priced "market price". This brief makes only `name` required and lets `price` be blank.
If the class model makes price required, validate it in the grid instead.

## Storage

- Table `menu_items`: `id`, `project_id` (foreign key to the student project), `position`
  (integer, for grid order), `name` (not null), `price` (nullable), `category`,
  `description`, `dietary` (text array), timestamps.
- A column on the project, `menu_public_id`: a short random lowercase alphanumeric string
  (8 to 10 characters), unique, generated once when the project is created and never
  regenerated.
- Add a migration the way existing ones are run (Procfile release phase).
- **Postgres returns `NUMERIC` as a string in `node-pg`.** Convert `price` to a real number
  before it goes into the JSON, or card D5 breaks.
- New projects start with one editable example row, so the data address returns something
  before the student has typed anything.

## Menu data tab (the grid)

- Columns: name, price, category, description, dietary notes. One row per dish.
- Add a row, delete a row (with a confirmation), and reorder rows (drag handle or up/down
  buttons).
- Dietary notes are typed comma-separated into one cell and split on commas on save. Trim
  surrounding spaces only.
- An explicit **Save** button with a visible "Saved" confirmation. The card scripts say "Save",
  so match them. Warn before leaving the tab with unsaved changes.
- Validation on save: `name` required and non-empty. `price` must parse as a number or be
  blank. Accept an entry like `9`, `9.00` or `$9.00` and store the number. Show the error on the
  offending cell and do not save partial data.
- Limits: 100 rows per project, `name` 100 characters, `description` 500, 10 dietary notes of
  30 characters each.
- Show the full data address at the top of the tab with a Copy button.
- Treat all cell contents as plain text. Render them with `textContent`, never as HTML.

## Save endpoint

- `PUT` to the project's menu with the full array of rows in the body. The server replaces all
  of that project's rows in one transaction.
- Authenticated through the existing Google OAuth session, allowed only for the project owner
  (and the teacher). Follow whatever CSRF protection the app already uses.
- Responds with the saved rows, or per-row validation errors.

## Data address

- `GET /api/menu/:menuPublicId`
- **Public and read-only.** No login, no cookies. A preview pane can be a sandboxed frame with
  no origin, and a student's page must be able to read it.
- Response: `200`, `Content-Type: application/json; charset=utf-8`, a **bare array** at the top
  level (not wrapped in an object). The card block hands that array straight to `showMenu`.
- Headers: `Access-Control-Allow-Origin: *` on this route only, and `Cache-Control: no-store`
  so a reload always shows the latest save.
- Unknown id: `404` with `{ "error": "No menu found at this address." }`.
- **Delay option:** an optional query string, `?delay=3`, makes the server wait that many
  seconds before it responds. Cap it at 5 and ignore any value that is not a whole number
  from 1 to 5. Card D1a uses it so students can see the page wait. Do the waiting before
  touching the database, so no connection is held open while the response is delayed.
- Methods: `GET` and `OPTIONS` only.
- Rate limiting, if any, must not be per IP address. The whole class shares one school
  address. Key it on the id, and keep the limit generous.
- The data is a fake restaurant menu, so public read access is acceptable.

## Behavior the course depends on

| Card | Needs |
|---|---|
| D1 | Grid columns match the session-1 content model, in order. The data address shows the same rows as text. |
| D1a | `?delay=3` on the data address holds the response for three seconds. |
| D2 | Add a row, Save, reload the preview, and the new dish appears. No stale cache. |
| D3 | A blank description cell produces a dish with no `description` key at all. |
| D4 | `dietary` is always an array and case is preserved exactly as typed. |
| D5 | `price` is a JSON number. |
| D6 | Two different pages can fetch the same address, and both update after a Save. |

## Out of scope

Custom columns, image columns, version history, a public directory of menus, and any
write access from a student's page.

## Discover first

This brief was written without seeing the repository. Before building, confirm:

- How student projects and project files are stored and identified, and what the project table
  is called.
- **How the live preview is served** (iframe `src` or `srcdoc`, sandbox attributes, origin) and
  whether a page inside it can call the data address. This decides whether the CORS and
  no-cookie choices above are enough.
- How the IDE tabs and client code are structured, so the Menu data tab fits the existing
  pattern (EJS views, any client framework).
- How auth, sessions and CSRF currently work for write endpoints.
- How the teacher's read-only student project view is built, so the grid can appear there.
- Whether the checkpoint cards can link to or open the Menu data tab directly.

## Acceptance checks

- [ ] Fill in a grid, Save, open the data address, and see a bare JSON array in grid order.
- [ ] `?delay=3` makes the response take about three seconds. `?delay=60` and `?delay=abc` do not.
- [ ] Add a thirteenth row, Save, reload the preview, and the dish appears with no code change.
- [ ] Clear a description, Save, and the dish has no `description` key.
- [ ] Type `Vegetarian` as a dietary note, Save, and it comes back as `Vegetarian`.
- [ ] `typeof price` is `number` in the returned JSON. A blank price has no `price` key.
- [ ] A dish with no dietary notes returns `"dietary": []`.
- [ ] Two preview pages using the same address both show a change after one Save.
- [ ] The address works from inside the preview pane.
- [ ] An unknown id returns a `404` with the error body.
- [ ] A student cannot save to another student's grid. The teacher can view any grid.
- [ ] Invalid input (blank name, text in the price) is rejected without losing the other rows.
