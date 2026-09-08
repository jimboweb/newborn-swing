---
code: T0a
title: The pieces a website is made of
branch: trunk
depth: 0
ordinal: 2
session: 2
needs: T0
keywords: [html, css, javascript, script, browser, server, editor, file, extension, dev tools, languages]
video_url: null
video_seconds: null
starter: null
---

## Goal

You can name the three languages a web page is made of, and say what each one is for.

## The same page, three times

Look at the picture on this card. It is one menu, shown three times. **The words are
identical in all three.** Nothing was rewritten. Things were only *added*.

![The same menu with HTML only, then HTML and CSS, then HTML, CSS and a script](three-ways.png)

That is the whole idea. Three languages, three jobs, stacked on top of each other.

| | The question it answers | What it does |
|---|---|---|
| **HTML** | What is on the page? | Says which bits are headings, which are paragraphs, which are pictures. The words themselves live here. |
| **CSS** | What does it look like? | Colours, lettering, sizes, spacing. Changes nothing about what the page *says*. |
| **A script** | What happens when someone does something? | Waits for a click or a choice and then changes the page. |

## HTML — the words and what they are

HTML holds the actual content, and it labels each piece so the browser knows what it is
looking at.

```html
<h3>Blueberry pancakes</h3>
<p>Three big pancakes with warm blueberries and maple syrup.</p>
```

That says *this is a dish name* and *this is a description*. Not how they look — what
they **are**.

Look at picture 1 again. With only HTML, the page is plain but **it is not broken**. All
the information is there. You could order lunch from it.

## CSS — how it should look

CSS never changes what the page says. It only changes how it appears.

```css
h3 {
  font-family: Georgia, serif;
  color: #16324F;
}
```

Picture 2 is picture 1 with a stylesheet attached. Same words. Different clothes.

## Scripts — what happens when someone does something

HTML and CSS both just *describe* things. They are written once and they sit there.

A script is different. A script **waits**, and then does something.

In picture 3 there are three buttons. Nothing about the words changed — but now, when a
visitor taps *Vegetarian*, something has to notice the tap and remove the dishes that do
not match. HTML cannot do that. CSS cannot do that. A script can.

The language these are written in is called **JavaScript**. That is the only new name on
this card, and you do not need it yet.

> **HTML and CSS describe. Scripts decide.**
> That is the real difference, and it is why the third one feels so different to write.

## They stack, and the order matters

- HTML **on its own** works fine. Plain, but complete.
- CSS on its own does nothing at all. There is nothing to style.
- A script on its own has nothing to change.

So HTML first, always. That is why you learn it first, and it is why your page still
works when you delete `style.css`.

## The rest of the cast

Things you will hear named constantly. None of them are languages.

| | What it is |
|---|---|
| **Browser** | The program that asks for pages and builds them. Chrome, Safari, Firefox, Edge. |
| **Server** | A computer somewhere whose job is to answer requests. Where the files live. |
| **Editor** | Where you type your code. Yours is in Newborn Swing. |
| **File extension** | The bit after the dot. `.html`, `.css`, `.js` — it tells everyone which language is inside. |
| **Dev tools** | The panel that opens with **F12**. Lets you look inside any page on the internet. |

## Which one is which branch?

Later this term you will pick a direction. This is what each one is really about.

- Going deeper into **CSS** — making it beautiful, and readable by anyone.
- Going deeper into **scripts, reacting** — making it respond to the visitor.
- Going deeper into **scripts, data** — making the page build itself from a list of dishes.

None is harder than the others. They are different, and they mix.

## Self-check

- Cover the table. Name all three languages and what each is for.
- Someone says "the colours have gone but the words are still there." Which file is
  missing, and how do you know?
- Which of the three could make a button do something when it is clicked? Which two
  could not, no matter how well written they were?
