---
code: T1a
title: What a tag is
branch: trunk
ordinal: 4
session: "2"
needs: []
keywords: [tag, angle brackets, opening, closing, slash, element, p, paragraph, whitespace]
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

    Blueberry pancakes

    $9.00

    Three big pancakes with warm blueberries and maple syrup.

    Vegetarian.

    </body>
    </html>
---

## Goal

You can write a tag, and you know why the browser needs you to.

## Start by looking

Press **Try it**. A page opens with four pieces of writing about one dish, each on its
own line, with blank lines between them. In the editor it looks tidy and separated.

Look at what the browser shows you.

```
Blueberry pancakes $9.00 Three big pancakes with warm blueberries and maple syrup. Vegetarian.
```

**All of it on one line.** Every blank line you can see in the editor was thrown away.

This surprises everyone, so it is worth being blunt about it:

> **The browser ignores your spacing.** Line breaks, blank lines, extra spaces — it
> throws them all away and runs your words together.

Which leaves an obvious question. If pressing Enter does nothing, how do you tell the
browser that these are four separate things?

## You tell it with tags

A **tag** is an instruction to the browser. You write it in angle brackets:

```html
<p>
```

`p` is short for *paragraph*. The angle brackets are what make it an instruction instead
of ordinary writing. Without them, `p` is just the letter p and the browser would print
it on the page.

**Tags almost always come in pairs**, and the pair wraps around the thing you are talking
about:

```html
<p>Blueberry pancakes</p>
```

- `<p>` is the **opening tag**. It means *a paragraph starts here*.
- `</p>` is the **closing tag**. It means *the paragraph ends here*.
- The **slash** is the only difference between them. `/` means "this is the one that
  finishes it".

Everything between the two is the paragraph's content. The browser puts it in a block of
its own, with space above and below — which is exactly what the blank lines in your file
failed to do.

**A tag itself never appears on the page.** If you can see `<p>` in the browser, something
has gone wrong.

## Spotting them

Scroll to the top of your file. There are already tags there:

```html
<html lang="en">
<head>
<title>Blue Door Diner</title>
```

You do not need to know what those do yet — that is the next card. Just notice the shape.
Angle brackets, a word, and further down the file, the same word again with a slash in
front of it.

Once you can spot that shape, you can read any web page in the world.

## Now do this

Wrap each of the four pieces of writing in its own paragraph. The first one is done for
you here:

```html
<p>Blueberry pancakes</p>
```

Do the same for the price, the description and the word Vegetarian. Save, and watch the
page.

Four separate blocks, in the same order you typed them.

**Then break one on purpose.** Delete the `<` from the front of one opening tag, so it
reads `p>` instead of `<p>`. Save and look. You will see `p>` printed on the page as if it
were a word — because without the angle bracket that is exactly what it is.

Put it back.

## Self-check

- Does each of the four pieces sit on its own, with space between them?
- Does every `<p>` you wrote have a matching `</p>` after it?
- Can you see any angle brackets on the page itself? You should not be able to.
- Add three more blank lines between two of your paragraphs and save. Does the page
  change at all? Why not?
