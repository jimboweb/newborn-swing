---
code: T0
title: What happens when you go to a website
branch: trunk
depth: 0
ordinal: 1
session: 2
needs: null
keywords: [request, response, server, browser, http, url, loading, network tab, how the web works]
video_url: null
video_seconds: null
starter: null
---

## Goal

You can explain, in order, what happens between clicking a link and seeing a page.

## The short version

**Your browser asks for something. A computer somewhere answers. Your browser builds
the page out of the answer.**

That is the whole thing. Everything below is that sentence, slowly.

## Step by step

**1. You ask for something.**
You type an address, or you click a link. Either way your browser now has an address and
a job: go and get whatever is at that address.

**2. The question travels to a server.**
A server is just a computer whose job is to sit there and answer questions all day. It
might be in another city or another country. Your question goes out through the wire or
the wifi, across a lot of other machines, and arrives there. It takes about as long as
blinking.

**3. The server works out what to send back.**
Two things can happen here, and the difference matters.

Sometimes the answer is already written and sitting in a folder, and the server just
picks it up and sends it. That is a **static** page — the same for everybody.

Sometimes the server has to *build* the answer right at that moment, just for you.
Anything that shows your name, or today's date, or how many people liked something, has
to be made fresh. The server does some thinking first, then sends the result.

**4. What comes back is not a page. It is instructions for making one.**

This is the part almost everybody gets wrong at first, so it is worth saying carefully.

The server does not send you a picture of a web page. It sends **HTML** — the same tags
you are learning to write. Your browser reads those instructions and builds the page on
your screen from them.

> It is the difference between someone posting you a cake and someone posting you a
> recipe. What arrives in the envelope is not the thing. It is how to make the thing.

That is why *you* can write HTML at all. You are writing the instructions that somebody
else's browser will follow.

**5. Reading the instructions makes the browser ask for more things.**

Now the interesting bit. Your browser starts reading the HTML and almost immediately
runs into lines like these:

```html
<link rel="stylesheet" href="style.css">
<img src="logo.svg" alt="A blue door">
```

Neither of those *contains* anything. They are both notes saying **go and fetch this
too**. So the browser sends off another request. And another. One for the stylesheet,
one for every picture, one for every script.

A page you think of as "one thing" is usually thirty or forty separate requests, and
your browser fires them off as fast as it can.

**6. The browser draws the page, then runs any scripts inside it.**

Once it has the pieces, the browser puts the words on the screen and paints the colours
on.

The HTML can also carry **scripts** — sets of instructions that run on *your* computer,
inside your browser, rather than on the server far away. A script can change the page
after you are already looking at it, and it can send off requests of its own.

That is why some pages appear and then fill in a second later, and why clicking a button
can change what you see without the whole page reloading.

> So there are two places code can run: on the **server**, before anything is sent to
> you, and in your **browser**, after it arrives. You will write both kinds eventually.
> For now the only thing to hold on to is that there are two.

## Watch it actually happen

You do not have to take any of this on trust. Your browser will show you.

1. Open any website you like.
2. Press **F12** to open the developer tools. Choose the tab called **Network**.
3. Reload the page.

Every line that appears is one request. Watch how many there are. Look for the `.css`
files and the pictures — those are step 5 happening in front of you.

## Why this matters for your menu

Three things you will run into make sense once you know this.

| What you see | Why |
|---|---|
| Deleting `style.css` makes your page go plain but not empty | The words came in the first answer. The colours were a second request that now fails. |
| An `<img>` with a misspelled filename shows nothing | The browser asked for a file by that exact name and was told there is no such thing. |
| The `<link>` line has to name the file exactly right | It is an address, not a description. Close enough is not good enough. |

## Self-check

- Say the six steps out loud, in order, without looking.
- Open the Network tab on your own menu page. How many requests does it make? Can you
  say what each one is for?
- Someone asks you what the server sent back. What is the one-word answer, and why is
  "a page" the wrong one?
