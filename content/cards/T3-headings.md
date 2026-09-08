---
code: T3
title: Headings big and small
branch: trunk
ordinal: 5
session: "2"
needs: [T2]
keywords: [heading, h1, h2, h3, outline, structure, hierarchy]
video_url: null
video_seconds: null
starter:
  index.html: |
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="utf-8">
      <title>Blue Door Diner</title>
    </head>
    <body>

      <h1>Blue Door Diner</h1>
      <h1>Breakfast all day</h1>
      <h1>Blueberry pancakes</h1>
      <p>Three big pancakes with warm blueberries and maple syrup.</p>
      <h1>Oatmeal with honey</h1>
      <p>Slow-cooked oats with honey and raisins.</p>
      <h1>Sandwiches</h1>
      <h1>Grilled cheese</h1>
      <p>Melted cheddar on thick white bread.</p>

    </body>
    </html>
---

## Goal

You can break your page into parts with headings.

## Headings come in sizes, and the number is the point

You already know `<h1>`. There are five more: `<h2>`, `<h3>`, `<h4>`, `<h5>`, `<h6>`.

The number is **not** about how big the text looks. The number says **how important
this heading is, and what it is a part of.**

- `<h1>` — the name of the whole page. **One per page.** Yours is your restaurant.
- `<h2>` — a main part of the page. Each section of your menu.
- `<h3>` — something inside one of those parts. Each dish.

Think of it like the contents page of a book. The book has one title. The book has
chapters. Each chapter has sections inside it. You would never put a section before the
chapter it belongs to.

## Worked example

Here is the top of a menu with all three, in `index.html`:

```html
<h1>Blue Door Diner</h1>

<h2>Breakfast all day</h2>

<h3>Blueberry pancakes</h3>
<p>Three big pancakes with warm blueberries and maple syrup.</p>

<h3>Oatmeal with honey</h3>
<p>Slow-cooked oats with honey and raisins.</p>

<h2>Sandwiches</h2>

<h3>Grilled cheese</h3>
<p>Melted cheddar on thick white bread.</p>
```

Read just the headings and nothing else:

> Blue Door Diner → Breakfast all day → Blueberry pancakes → Oatmeal with honey →
> Sandwiches → Grilled cheese

That is a menu. You can tell what is a section and what is a dish without reading a
single description. **That is what headings are for.**

## The one rule

**Never skip a number going down.** After `<h1>` comes `<h2>`, not `<h3>`. After `<h2>`
comes `<h3>`.

You can jump back up as often as you like — `<h3>` then `<h2>` is completely fine, and
that is exactly what happens when one section ends and the next begins.

This matters because some people use software that reads a page out loud, and it uses
the heading numbers to let them jump around. A skipped number is a missing step on a
staircase.

## Now you fix this

Press **Try it**. The page that opens has every single line marked as an `<h1>` — the
restaurant, the sections and the dishes all shout equally, and you cannot tell what
belongs to what.

Before you change anything, look at it and decide:

- Which one line is the name of the whole page? That stays `<h1>`.
- Which lines are sections of the menu? Those become `<h2>`.
- Which lines are dishes? Those become `<h3>`.

Now change them. Remember to change **both** ends of each tag — `<h1>` at the start and
`</h1>` at the end have to match, or the page will not do what you expect.

## Self-check

- Read only your headings, top to bottom, skipping every paragraph. Do they work as an
  outline on their own?
- Is there exactly **one** `<h1>` on your page?
- Does any `<h2>` come directly after your `<h1>`, with no `<h3>` jumped in between?
- Does the page look sensible — sections looking more important than the dishes inside
  them?
