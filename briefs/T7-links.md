---
code: T7
title: Links
branch: trunk
ordinal: 9
session: "4"
keywords: [link, a, href, url, file path, anchor, mailto, tel, click here]
video_url: null
video_seconds: null
starter:
  index.html: |
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="utf-8">
      <title>Blue Door Diner</title>
      <link rel="stylesheet" href="style.css">
    </head>
    <body>
      <h1>Blue Door Diner</h1>

      <p>Read about where our food comes from:
        <a href="farms.html">click here</a></p>

      <p>The library next door has a website too:
        <a href="www.example.com">the library</a></p>

    </body>
    </html>
  style.css: |
    body {
      font-family: Verdana, sans-serif;
      font-size: 18px;
      padding: 20px;
    }
  farms.html: |
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="utf-8">
      <title>Our farms</title>
    </head>
    <body>
      <h1>Our farms</h1>
      <p>Our eggs come from a farm about an hour north of here.</p>
    </body>
    </html>
---

## Goal

You can send someone somewhere else, and you know how to write the address.

## A link is two separate things

Look at this link. It has two halves, and they have nothing to do with each other.

```html
<a href="farms.html">Read about our farms</a>
```

- **Where it goes** is inside the quote marks after `href`. Nobody ever sees this.
- **What it says** is between the tags. This is the part on the screen that people
  actually click.

You can change one without changing the other. If you rewrite the words to say
*Meet our farmers*, the link still goes to exactly the same place. If you change
`farms.html` to `menu.html`, the words on the screen do not move at all.

That trips almost everybody up once. When a link goes somewhere wrong, the problem is
always in the `href`, never in the words.

## Where it goes: near or far

The address is written differently depending on how far away the thing is. This is not
a computer idea — you already do it.

If you are telling a stranger where you live, you give them the whole address: number,
street, city, everything. If you are telling someone standing in your kitchen where the
forks are, you say *second drawer down*. Both are directions. The far one has to be
complete; the near one only has to work from where you are already standing.

**Far away — a whole other website.** Write the whole address, starting with `https://`.

```html
<a href="https://www.nypl.org">the library</a>
```

**Near — another one of your own files.** Just write the file name.

```html
<a href="farms.html">Read about our farms</a>
```

That works because the browser is already standing in your folder. It looks for
`farms.html` right next to the page it is showing.

## Sometimes it is not a place at all

A few links do something instead of going somewhere. They are written the same way, but
the address starts with a word and a colon that tells the browser what kind of thing it
is.

```html
<a href="tel:5550142">555-0142</a>
<a href="mailto:hello@bluedoor.example">Email us</a>
```

On a phone, the first one starts a call and the second one opens a new email. This is
why "a link goes to another page" is *usually* true rather than always true — a link
hands the browser an address, and the browser decides what to do with it.

## Say where it goes

The words you click are the only part most people ever read. Some people use software
that reads out just the links on a page, one after another, so they can jump around.
A page full of links that all say *click here* is useless to them.

```html
Bad:   <a href="farms.html">click here</a>
Good:  <a href="farms.html">Read about our farms</a>
```

Write the link text so it still makes sense with the rest of the sentence taken away.

## Now you fix this

Two links in the starter page are broken. Predict what each one does before you run it.

1. The first says `click here`. It works, but it does not tell you where it goes.
2. The second is meant to leave your site, but the address does not start with
   `https://`. Press Try it and click it. The browser will look for a *file* called
   `www.example.com` in your folder, not find one, and give you an error.

Fix both.

## Self-check

- Click every link on your page. Did each one go where you expected?
- Cover the rest of the sentence with your hand and read just the blue words. Do you
  still know where that link goes?
- Does every address that leaves your site start with `https://`?
