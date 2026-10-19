# Restaurant Row — lessons and video scripts for the remaining cards

Covers every card that does not already have written content or a script:
**T1, T2, T4, T5, T6, T9–T21, V1–V8, I1–I6, D0–D7 (including D1a).**

Already done and not repeated here: T0, T0a, T1a, T3, T7 (full cards) and T8 (script).

---

## The rule I applied to decide what gets a video

Record a video only when one of these is true:

1. **Motion is the lesson.** Something changes on screen and the change *is* the point —
   the box model growing, a layout reflowing, a page reacting to a click.
2. **A stuck student is fully blocked without it.** With 30 students spread across 8
   sections at different checkpoints, you cannot be in the room for every first attempt.

Everything else is faster to read than to watch, and far easier to fix when it is wrong.

**That leaves 11 videos worth making and 5 short ones worth making if you have time.**
The other 22 cards need no video at all.

### Recording order

| Priority | Cards | Why |
|---|---|---|
| **Record first** | T2, T9, T14, T16, T18 | Trunk. Every student hits these, and a stuck student cannot proceed. |
| **Record next** | T13, V5, V6, I1, I3, D2 | The conceptually hardest card in each area. |
| **If you have time** | T5, T6, T17, V7, I2, D1, D1a, D4 | 60–90 seconds each. Nice, not needed. |
| **Never** | everything else | The card does it better. |

All videos: screen only, no talking head, 60–180 seconds. Record after you have taught the
card two or three times and know where students actually stick.

---
---

# TRUNK

## T1 · What is a dish?
*Session 1 · no computer*

**Teaches** — a dish is a set of fields, and some are required.

**The line that lands** — *Before you can build a menu, you have to say what a dish IS.*

**Activity** — Class brainstorms everything a dish has. Write every suggestion up. Then
the hard part: which are **required**? Argue about the awkward ones — a dish with no
description, a soup priced "market price", a special with no fixed name. The argument is
the lesson; the list is just the residue.

Land on the shared model: name, price, description, category, dietary notes.

**Video: no.** This is a discussion, and a recording of a discussion teaches nothing.

---

## T2 · Your first page
*Session 2*

**Teaches** — the skeleton (`html`, `head`, `body`, `title`), then `h1` and `p`.

**The line that lands** — *This same skeleton is on every web page you will ever write.*

**Demo** — Type, save, watch words appear. Show `title` landing in the browser tab, not on
the page — that surprises people and it is the first hint that `head` and `body` do
different jobs.

**Video: YES — record first.** 90 seconds. It is the very first thing, and a student who
cannot start is blocked completely.

### Script

> **0:00 — Empty file.** "This is an empty file. By the end of ninety seconds there will
> be a web page in it."
>
> **0:10 — Type the skeleton,** naming each part once as you go: html wraps everything,
> head is information *about* the page, body is what people see. Do not explain further.
>
> **0:35 — Type `<title>Blue Door Diner</title>` inside head.** Save. "Where did it go?"
> Point at the browser tab. "Not on the page. In the tab. That is what head means —
> information about the page, not the page itself."
>
> **0:50 — Type `<h1>Blue Door Diner</h1>` inside body.** Save. It appears.
>
> **1:05 — Add a `<p>`** with the tagline. Save.
>
> **1:20 — Close.** "That skeleton never changes. Every page you make this year starts
> exactly like that. The only thing that changes is what goes inside body."

**Avoid:** explaining `<!DOCTYPE html>` or `lang="en"`. Say "these two lines are always
there" and move on.

---

## T4 · Lists
*Session 3*

**Teaches** — `ul` and `li`.

**The line that lands** — *One `ul` holds the whole list. One `li` for each item.*

**Demo** — The "Good to know" block: open every day, bread baked next door, pickles are
free. Each item is one short line.

**Video: no.** Static. The worked example in the card does it better than a video could.

---

## T5 · Putting one tag inside another
*Session 3*

**Teaches** — nesting, and closing in reverse order.

**The line that lands** — *Tags close in the opposite order from the one they opened in.*

**Demo** — The runaway-nesting bug: each `<ul>` opened inside the previous one and never
closed. Every item marches further right with a different bullet shape.

**Video: short, optional.** 90 seconds — the marching-right effect is motion and it is
genuinely funny to watch.

### Beats

1. Show the correct list. Indented, tidy.
2. Delete three closing `</ul>` tags. Save.
3. Let the viewer look at it before you say anything — items stepping right, bullets
   changing from dot to circle to square.
4. "Every one of those lists is still open. The browser is still waiting for you to
   finish them."
5. Put them back. "Opened last, closed first. Like boxes inside boxes — you cannot close
   the outer one while the inner one is still open."

---

## T6 · Pictures
*Session 4*

**Teaches** — `img`, `src`, `alt`, and that `img` has no closing tag.

**The line that lands** — *`alt` is what the picture says when it cannot be seen.*

**Demo** — Break the filename on purpose and watch the alt text appear in its place.

**Video: short, optional.** 60 seconds, and it is the best argument for alt text you will
ever make — far better than being told it matters.

### Beats

1. Working image on the page.
2. "This tag is different. There is no closing tag, because there is nothing to put
   inside a picture."
3. Change `pancakes.jpg` to `pancake.jpg`. Save.
4. The image vanishes and the alt text appears where it was. Pause.
5. "That is what someone gets when the picture does not load — and it is what someone
   gets who cannot see the picture at all. If your alt says 'image1', they get 'image1'."

---

## T9 · Connecting a stylesheet
*Session 7*

**Teaches** — the `<link>` tag and the idea of a second file.

**The line that lands** — *Your words live in one file. Your colours live in another.*

**Demo** — The delete-`style.css` moment.

**Video: YES — record first.** 2 minutes. This is the separation-of-concerns moment for
the whole course, and it only lands as motion.

### Script

> **0:00 — Plain page.** "Here is the menu with no styling at all. Plain, but look — it is
> not broken. Every word is there."
>
> **0:15 — Show the two files in the tab bar.** `index.html` and `style.css`. "Two files.
> One has the words. One has the colours. They do not know about each other yet."
>
> **0:30 — Type the `<link>` line** into `head`. Save. The page transforms in one step.
> **Say nothing for two seconds.**
>
> **0:45 — "Not one word changed."** Scroll both versions if you can. Same dishes, same
> prices, same order. Only how it looks changed.
>
> **1:00 — Open `style.css`,** change `background-color` to `gold`, save, change it back.
> "Everything that decides how it looks is in this file. Nothing here says what the menu
> says."
>
> **1:25 — Delete `style.css` entirely.** The page goes plain. "Still readable. Still
> complete. You could still order lunch from it. The content survived losing the
> presentation — that is the whole idea."
>
> **1:45 — Put it back.** "Two files. One job each."

**Avoid:** the words "cascading", "external stylesheet", or anything about `<style>` tags
or inline styles. They do not need to know other options exist.

---

## T10 · What a rule looks like
*Session 7*

**Teaches** — selector, property, value.

**The line that lands** — *Which thing / what about it / what you want it to be.*

**Video: no.** Static anatomy. The card's labelled diagram beats a video.

---

## T11 · Colour
*Session 7*

**Teaches** — `color`, `background-color`, named colours and hex.

**The line that lands** — *Names are for trying things. Hex is for meaning it.*

**Activity** — Everyone stands two metres back from their own screen and reads their
menu. Whatever they cannot read from there is a defect.

**Video: no.** The cheat sheet already has the swatches and both notations.

---

## T12 · Lettering and size
*Session 7*

**Teaches** — `font-family`, `font-size`, `font-weight`, `line-height`, `text-align`.

**The line that lands** — *Always write a backup after the comma, in case the first one is
missing.*

**Video: no.** The cheat sheet's font table shows each face rendered in itself, which is
more useful than watching someone type.

---

## T13 · Choosing what to change
*Session 8*

**Teaches** — tag selectors vs class selectors.

**The line that lands** — *A tag selector changes every one of them. A class changes only
the ones you picked.*

**Video: YES — record next.** 2 minutes. This is the hardest idea in trunk CSS, and the
lesson is entirely about *scope* — which is motion.

### Script

> **0:00 — Menu with several paragraphs:** descriptions, prices, dietary notes.
>
> **0:10 — Write `p { color: red; }`.** Save. **Everything** turns red — descriptions,
> prices, notes, all of it. "I only wanted the prices. I got all of them."
>
> **0:30 — "The selector `p` means every paragraph on the page. All of them. That is what
> a tag name means."**
>
> **0:40 — Undo.** Go to the HTML. Add `class="price"` to one price paragraph. Save.
> Nothing happens. **Point that out.** "Nothing changed. A class on its own does nothing —
> it is just a label."
>
> **1:00 — Add `.price { color: #B02E1E; }`** to the CSS. Save. One price turns red.
>
> **1:15 — Add the class to the other prices,** one at a time, and watch each turn red as
> you save. "Same rule. I wrote it once. It finds every paragraph I labelled."
>
> **1:40 — The gotcha, said plainly.** Put the cursor on `.price` in the CSS and
> `class="price"` in the HTML, side by side. "Dot in the stylesheet. No dot in the HTML.
> That is the most common mistake there is, and it fails silently — nothing turns red and
> nothing tells you why."

**Avoid:** IDs, specificity, `!important`, combining selectors. One idea.

---

## T14 · Padding, border and margin
*Session 9*

**Teaches** — the box model.

**The line that lands** — *Padding pushes the edge away from the words. Margin pushes
everything else away from the box.*

**Video: YES — record first.** 2.5 minutes. Watching space appear as you type is the only
way this lands.

### Script

> **0:00 — Before you touch the screen:** hold up a paper rectangle with a border drawn
> on it and words in the middle. Point at the three regions. Ten seconds, then to the
> editor.
>
> **0:15 — One dish. Add `border: 2px solid navy;`** to it. Save. Now the box is visible.
> "You can normally not see this box. It is always there. I am only drawing it so you can
> watch what happens next."
>
> **0:35 — Add `padding: 20px;`.** Save. The border pushes *away from the words*. Type
> 40, 60, back to 16, saving each time. "Padding is on the inside. The words stay put and
> the edge moves out."
>
> **1:15 — Add `margin: 30px;`.** Save. **The dish below it moves down.** "Nothing inside
> the box changed. Everything *outside* got pushed away. That is the difference — padding
> is inside the box, margin is outside it."
>
> **1:45 — Swap them** so padding is 30 and margin is 20, and back. Let the viewer watch
> which one moves the neighbour.
>
> **2:05 — Remove the border.** The spacing stays. "The box is still there. It was always
> there. I just stopped drawing it."
>
> **2:20 — The tip to end on:** "When you cannot work out why something is in the wrong
> place, put a temporary border on it. You can put it back to none afterwards."

**Fold T15 in here as a final beat** if the video is running short — see below.

---

## T15 · One side at a time
*Session 9*

**Teaches** — `padding-top`, `margin-bottom`, `border-top`.

**The line that lands** — *A line above every dish name is all you need to separate one
dish from the next. No box required.*

**Demo** — `border-top` on `h3` plus `padding-top`, which is exactly what the model menu
does.

**Video: fold into T14** as a closing 30 seconds. Not worth its own recording.

---

## T16 · Putting things in the middle
*Session 9*

**Teaches** — `max-width`, `margin: 0 auto`, `display: block` for images.

**The line that lands** — *`max-width` stops the lines getting too long to follow.
`margin: 0 auto` splits the leftover space evenly on both sides.*

**Video: YES — record first.** 2 minutes. Dragging the window is motion, and the
picture-will-not-centre problem is the single most common CSS frustration at this stage.

### Script

> **0:00 — Full-width menu.** Drag the browser window as wide as it goes. "Read that top
> line." Let it be uncomfortable. "Your eye has to travel all the way back to find the
> start of the next line."
>
> **0:25 — Add `max-width: 34rem;` to `body`.** Save. The text column narrows and hugs the
> left edge. "Better to read. Stuck on the left."
>
> **0:45 — Add `margin: 0 auto;`.** Save. It jumps to the centre. "Auto means: work out
> the leftover space and put the same amount on each side."
>
> **1:00 — Drag the window wide and narrow.** The column stays centred. "It does the sum
> again every time the window changes."
>
> **1:20 — Now the logo.** Add `margin: 0 auto;` to it. Save. **Nothing happens.** Let that
> sit. "I did exactly the same thing. It did not work."
>
> **1:35 — Add `display: block;`.** Save. It centres. "A picture normally sits in a line
> of text like a word does. `display: block` says: you get a line of your own. And once it
> has a line of its own, auto has leftover space to split."
>
> **1:55 — Close.** "Two properties. `max-width` decides how wide. `margin: 0 auto`
> decides where."

---

## T17 · Sizing pictures
*Session 9*

**Teaches** — `width`, `height`, and why to set only one.

**The line that lands** — *Set the width and let the height sort itself out.*

**Video: short, optional.** 60 seconds. The squash is motion and it is funny.

### Beats

1. Photo at natural size, too big.
2. Set `width: 300px`. Save. It shrinks, still looks right.
3. Now add `height: 300px`. Save. **It squashes.** Leave it up for a moment.
4. "The real picture is not square. I told it to be square, so it stretched to obey."
5. Delete the height. It recovers. "Set the width. Leave the height alone. The browser
   works it out and keeps the shape."

---

## T18 · When nothing happens
*Session 7, and every session after that*

**Teaches** — a debugging checklist, in order of likelihood.

**The line that lands** — *Is it my rule, or is it the link?*

**Video: YES — record first.** 2.5 minutes. Debugging is a process, and a process is
exactly what a video is good for. This is also the card that saves you the most class
time — it answers the question you will otherwise be asked forty times.

### Script

> **0:00 — A page with a CSS rule that is not working.** "I wrote this rule. It is not
> doing anything. Here is the order I check things, and it is almost always one of the
> first three."
>
> **0:15 — THE GOLD TEST, first, always.** Add `background-color: gold;` to the `body`
> rule. Save.
>
> **If the page turns gold:** "The stylesheet is connected. The problem is in my rule."
>
> **If it does not:** "The stylesheet is not connected at all. Nothing I write in it will
> ever work. Stop looking at the rule — go look at the link."
>
> Take the gold back out. "That one test splits the problem in half in five seconds."
>
> **0:50 — Then, in order:**
> 1. Is there a `<link>` line in `head`?
> 2. Does the filename in it match the file *exactly*? `Style.css` is not `style.css`.
> 3. Is there a `;` at the end of every line?
> 4. Is there a `}` closing every rule? **Show this one** — delete one `}` and watch every
>    rule below it stop working. "One missing bracket takes out everything under it."
> 5. Did you spell it `color`, not `colour`?
> 6. Class name spelled the same in both files, dot only in the CSS?
>
> **2:10 — Last.** "Save the file. Then reload the page. Sometimes that is genuinely all
> it is, and there is no shame in it."
>
> **2:25 — Close.** "Work down that list before you ask anyone for help. Most of the time
> you will find it yourself, and you will find it faster than waiting."

---

## T19 · Writing criteria a partner can test
*Session 10 · the gate*

**Teaches** — a test table, and a task statement from the visitor's side.

**The line that lands** — *If your partner has to ask you a question, it is not written
down yet.*

**Activity** — Students write a test table: example dishes, expected result for each. It
must include one boundary case, one dish with a field missing, and one that stresses the
layout. Then they swap and run each other's tables **in silence**. Any question asked is a
hole in the spec.

**Video: no.** This is a gate, done in the room, and it depends on the pairing.

---

## T20 · Writing a bug report
*Session 11*

**Teaches** — what I did / what I expected / what happened instead.

**The line that lands** — *A bug report someone else cannot reproduce is not a report, it
is a complaint.*

**Activity** — Give the class a report saying "the page is broken" and have them rewrite
it with the three parts.

**Video: no.**

---

## T21 · Giving useful feedback
*Session 11*

**Teaches** — kind, specific, helpful.

**The line that lands** — *Point at the page, not the person.*

**Activity** — Rewrite "the colours are bad" so the author knows what to change.

**Video: no.**

---
---

# VISUAL BRANCH

## V1 · Blocks and lines
*Depth 1 · needs T16*

**Teaches** — block versus inline, why `margin: 0 auto` needed `display: block` on the logo
in T16, and two new tags, `<strong>` and `<em>`, that emphasize a few words inside a line.

**The line that lands** — *A block takes a whole line to itself. An inline thing sits in
the line like a word.*

*A heading emphasizes a whole line. `strong` and `em` emphasize a few words inside one.*

**For you, not for students** — The trunk uses `display: block` in T16 without explaining
it. This card gives the reason afterward, so the trunk can stay as it is. Students who reach
it already know borders from T14, which is the tool the whole card runs on.

**On a menu** — Two places come up naturally. An allergy or safety note inside a
description is `strong`, because it is genuinely important. A word you would stress out loud,
like the *big* in "three big pancakes," is `em`.

**Demo** — Put a red border on every paragraph and a blue border on every link. The
paragraphs are wide boxes stacked on top of each other. The links are small boxes sitting
inside the text. Same page, two different kinds of thing.

**Video: no.** The border trick is the whole demo, and the card can show it.

### Beats

1. Add `p { border: 2px solid red; }` and `a { border: 2px solid blue; }`. "Look at the
   shapes. Every paragraph is a box as wide as the page. The link is a box as wide as its
   words." Let them look for two seconds before saying anything else. They already know this
   trick from T14.
2. Give both a `width: 200px;`. The paragraph shrinks to 200 pixels. The link does not
   move. "A link is the size of its words. It sits in the line, so the line decides how
   wide it is."
3. **Emphasis inside a line.** Headings emphasize a whole line, and they are blocks. Two new
   tags emphasize a few words inside a line, and they are inline. Add them to a dish:

   ```html
   <p>Three <em>big</em> pancakes with warm blueberries and maple syrup.
      <strong>Contains wheat and eggs.</strong></p>
   ```

   Put a temporary border on `strong` and on `em`. The boxes hug the words and sit inside
   the paragraph, the same as the link did. "`h1` to `h6` are for a heading on its own line.
   `strong` and `em` are for a few words in the middle of one. Same job, different size."
   Say what each means: `strong` is *this is important* and `em` is *say it with stress*.
   Browsers show them bold and italic. "The look is a side effect. The meaning is the point."
4. **The T16 payoff.** "Remember the logo that would not center? A picture sits in a line
   like a word. `margin: 0 auto` splits the leftover space on both sides, but a thing
   sitting in a line has no leftover space of its own. `display: block` gave it a line to
   itself. Now you know why." Add: "And the `body` centered with no `display` at all,
   because `body` is a block already."
5. The dial. Put `display: block;` on the links. They stack, each on its own line, boxes
   stretching across. Put `display: inline;` on the paragraphs. They run together into one
   line of text. "The tag only decides where it starts. `display` is the dial."
6. Take the borders off.

### Activity — predict, then check

Hand over a list of things already on their menu: a heading, a paragraph, a list item, a
link, a picture, a few words in `strong`, a few words in `em`. Students write **block** or
**inline** next to each, then add a temporary border to check. They fix their own list.
`div` and `span` are not on it yet. They come next card.

**Where students stick**

- Reading *inline* as *small* instead of *sits in the line*.
- Putting `width` on a link and thinking the browser is broken.
- Leaving the borders on when they hand the page in.

**Careful** — Pictures are inline, but unlike links they accept `width` and `height`. T17
relies on that. Use a link for the "inline ignores width" demo, and use the picture only for
"it sits in the line, so it cannot be centered until it is a block."

**Never use `strong` or `em` just to get bold or italic.** If a word only needs to look
different, `font-weight` and `font-style` already do that, and students have them. If a
student asks about `<b>` and `<i>`, say they exist and that they say "make it bold" where
`strong` says "this matters." Do not teach them here.

**Avoid:** `inline-block` (V2 stretch), vertical margin on inline things, and any mention
of "replaced elements."

---

## V2 · Grouping: div and span
*Depth 1 · needs V1*

**Teaches** — `<div>` and `<span>`: one bag for blocks and one for words, and what a block
lets you do.

**The line that lands** — *A div does nothing on its own. It exists so you can treat a
group of things as one thing. A div is a block bag. A span is an inline bag.*

**Demo** — A dish needs a background color behind the name, price and description
together. There is nothing to put it on. Wrap them in a div; now there is. Then one word in a
description needs highlighting. A div breaks the sentence. A span does not.

**Video: short, optional.** 60 seconds. The temporary-border trick to see what the div
actually wraps, then the sentence breaking and healing.

### Beats

1. Try to put a background on a dish. Realize you would have to do it three times, on
   three separate tags, and the gaps between them stay white.
2. Wrap the three in a `<div class="dish">`.
3. Add `border: 2px solid red` to `.dish` temporarily. "That is what I just wrapped. Is it
   what I meant?" Then: "A div is a block. You know what that means from the last card:
   a whole line, stacked."
4. Swap the border for a background. Then give `.dish` a `width`, `margin: 0 auto;` and
   some padding. Every one works, and the background fills the whole box. "This is the whole
   job of a div. It is a bag, and because it is a block, everything you learned about
   padding, margin, border, width and height works on it."
5. Highlight one word, say "Vegetarian", in red. Wrap it in a `div`. The sentence breaks
   into three lines. "A div is a block. It will not sit in the middle of a sentence." Change
   `div` to `span`. The sentence heals. "A span is the inline bag. It wraps a few words
   without breaking the line."

### Activity

- **Everyone:** wrap each dish in a `div` and give the group a background.
- **Next step:** make a badge. A `span` with a background color and padding around the
  word "Vegetarian" or "Spicy", inside a dish description. Ask:
  does this word *mean* something extra (use `strong`) or only look different (use `span`)?
- **Stretch, not on the card for everyone:** `display: inline-block;` sits in a line like a
  word but accepts a width and a height. It fixes the badge when its padding crowds the
  line above.

**Where students stick** — Wrapping a single word in a `div` and finding the sentence
split. Putting `width` on a `span` and thinking the browser is broken. Both end the same
way: *is this a block or an inline thing?*

**Avoid:** margin and padding on the sides of inline things beyond the badge. Up-and-down
margin is ignored and up-and-down padding spills over without pushing anything away. It is
true and confusing, and the stretch covers it.

---

## V3 · A colour scheme that works
*Depth 2 · needs T11*

**Teaches** — a small palette used consistently, and contrast as a pass/fail number.

**The line that lands** — *Two or three colours, used the same way every time.*

**Activity** — Run every text-and-background pair through the contrast checker. It gives
a number and a pass or fail; there is nothing to argue about.

**Video: no.** The checker is a website with a pass/fail readout. The card can say that.

---

## V4 · Type that guides the eye
*Depth 2 · needs T12*

**Teaches** — hierarchy through size, weight and space together.

**The line that lands** — *Biggest is not the same as most important.*

**Activity** — The stopwatch test. Hand your laptop to someone who has not seen your menu
and ask them to find the cheapest vegetarian dish. Time them. Under 30 seconds or it is
not finished.

**Video: no.** The activity is better than any video of it.

---

## V5 · Side by side
*Depth 2 · needs V2*

**Teaches** — `display: flex`, so the things inside a box line up in a row, and
`justify-content: space-between`. Stretch: `gap`, and the idea that some properties only work
when another one is switched on.

**The line that lands** — *You put `display: flex` on the box, and the things inside it line
up in a row. The box itself does not change.*

**For you, not for students** — This card is built as a ladder, because the hard part is that
the property is set on the container while the change shows up in the children. Three scaffolds
carry that:

- **A bridge they already have:** `text-align` is set on a paragraph and moves the words
  inside it. `display: flex` is the same kind of thing, except it arranges whole boxes.
- **See the container before flex arrives.** A red border on the wrapper and a blue border on
  each thing inside it. When flex goes on, the blue boxes jump into a row and the red box does
  not change.
- **The wrapper is given.** They built wrappers in V2. Here, the first time, they only add one
  line of CSS.

A flex box is still a block on the outside. It fills the line and stacks like every other
block. That is why there is leftover space for `justify-content` to place. Flex only arranges
the things directly inside it, which is why the description sits outside the wrapper.

**Video: YES — record next.** 2 minutes. Things moving from stacked to side by side is pure
motion.

### Script

> **0:00 — A dish with the name and price stacked.** Borders already on: a red border on the
> wrapper `div`, blue borders on the name and the price. "Red box: the wrapper. Blue boxes:
> the two things inside it. Right now they are stacked, one above the other."
>
> **0:25 — Pause. Ask:** "If I add one line to the red box, what happens to the blue
> boxes?" Wait three seconds.
>
> **0:35 — Add `display: flex;` to the red box.** Save. **The blue boxes jump into one
> row, and the red box does not change.** "I did not touch the name or the price. I changed
> the box that holds them, and the things inside arranged themselves. Like `text-align`, but
> for whole boxes."
>
> **1:00 — Point at the empty space** at the right inside the red box. "This space is left
> over. `justify-content` decides where it goes." Add `justify-content: space-between;`.
> Save. The price flies to the right edge. "Put the leftover space *between* them."
>
> **1:20 — Change it to `center`.** Both move to the middle. "Split the leftover space on
> both sides, like `margin: 0 auto`." Change it to `flex-start`. They bunch left. Back to
> `space-between`.
>
> **1:40 — Remove the borders.** **Every dish snaps into a price column at once**, because
> they all share the class. Let it sit for two seconds.
>
> **1:55 — Close.** "The box decides. The things inside just show up."

### The ladder students climb

1. **Predict, then add one line.** The starter has the wrapper and the borders already. They
   say what will happen, then add `display: flex;` to `.dish-head`.
2. **Leftover space.** Add `justify-content: space-between;`. Then try `flex-start` and
   `center`, and put it back.
3. **Borders off.** Remove the red and blue borders. The whole menu now has its prices in a
   column.
4. **Break it.** Take the `display: flex;` line out. The other property stays in the
   stylesheet, and nothing complains and nothing changes. Put it back.

**Stretch, not on the card for everyone**

- **`gap`:** The last dish in the starter has a long name. Its name and price touch. Add
  `gap: 16px;` to `.dish-head` and the space comes back. "Space-between spreads them apart
  when there is room. `gap` is the least space there will ever be."
- **A new row:** Build a wrapper for a name, a price and a dietary note, with their own class,
  and put flex on it.

**The switch and its settings** — Step 4 is the point of the card for stronger students.
`display: flex` is the switch. `justify-content` and `gap` are settings that only matter once
the switch is on. When a flex property seems to do nothing, check that the parent has
`display: flex` and that the property is on the parent, not on a child.

**Where students stick**

- Putting `display: flex` on the name or the price instead of the wrapper. Nothing happens.
- Putting it on a bigger wrapper, so the description joins the row.
- Putting `justify-content` on the wrong box, or without `display: flex` at all.
- A missing semicolon after the new line.

**Avoid:** `flex-direction`, `flex-wrap`, `align-items`, `flex: 1`, `inline-flex`, and the
words *flex container* and *flex item*. Say "the box" and "the things inside it." The proper
names can come in a "words" note after the card is done.

---

## V6 · Showing something can be clicked
*Depth 2 · needs T7*

**Teaches** — `:hover` and `:focus`.

**The line that lands** — *`:hover` is for the mouse. `:focus` is for the keyboard. You
need both.*

**Video: YES — record next.** 2 minutes. **This one cannot be taught in text at all** —
tabbing through a page is something you have to watch.

### Script

> **0:00 — Links with `a:hover` set.** Move the mouse over them. They change. "That is
> hover. Most people stop here."
>
> **0:25 — Put the mouse down and do not touch it again for the rest of the video.**
> Say that out loud.
>
> **0:35 — Press Tab. Tab again.** "Something is moving through this page right now and I
> cannot see where it is. Can you?"
>
> **0:50 — "Some people use a website entirely like this** — keyboard only. Right now this
> page is unusable for them, and it looks fine to me because I have a mouse."
>
> **1:05 — Add `a:focus { outline: 3px solid #B02E1E; outline-offset: 2px; }`.** Save.
>
> **1:20 — Tab through again.** The outline jumps link to link. "Now I can see it."
>
> **1:40 — Close.** "Never remove the outline to make a page look tidier. If you do not
> like the default, replace it with one you do like. Do not take it away."

**Avoid:** `outline: none`. Do not even show it as a thing that exists.

---

## V7 · Fits any screen
*Depth 3 · needs V5*

**Teaches** — `@media`, relative widths.

**The line that lands** — *Design the narrow one first, then add a rule for when there is
more room.*

**Video: short, optional.** 90 seconds — dragging the window is the whole lesson.

### Beats

1. Laptop-width layout. Drag the window narrow. It breaks — overlapping, overflowing.
2. "Half the people looking at your menu are on a phone."
3. Show the single-column version working at narrow width.
4. Add the `@media (min-width: 600px)` block with the side-by-side rules inside it.
5. Drag slowly through the breakpoint, back and forth. "Below this width, one column.
   Above it, two. Same page."

---

## V8 · More than one page
*Depth 3 · needs T7*

**Teaches** — a second page, and the same nav on both.

**The line that lands** — *Every page needs a way back to every other page.*

**Demo** — Add `specials.html`. Put the same set of links at the top of both.

**Video: no** — unless the preview-link fix has landed and you want 45 seconds of clicking
between the two pages. The card covers it.

---
---

# INTERACTIVE BRANCH

**How this branch teaches.** Teach the direct way first, the way a student would try it
without being told. Where professional practice is more complicated (adding and removing
classes instead of setting styles, `classList`, arrow functions, `map`, promises), say
nothing, or give it one line marked "later." Almost no student will do professional web
work, and those who do can learn the professional way then. If a card has two reasonable
ways to do something, use the one with fewer new ideas.

## I1 · Your first script
*Depth 1 · needs T8*

**Teaches** — `<script src>`, `console.log`, and where the console is.

**The line that lands** — *The console is where your code talks to you.*

**Video: YES — record next.** 90 seconds. The console is unfamiliar territory and a
student who cannot find it is stuck with no way to tell.

### Script

> **0:00 — "So far everything you have written describes the page. This is different. This
> runs."**
>
> **0:15 — Make `menu.js`.** One line: `console.log("the script ran");`
>
> **0:25 — Add `<script src="menu.js"></script>` just before `</body>`.** Save.
> **Nothing appears on the page.** Say so. "Nothing happened. Or it looks like nothing
> happened."
>
> **0:45 — Open the console.** Show exactly where to click. The message is sitting there.
> "It did run. It just was not talking to the page — it was talking to me."
>
> **1:05 — Break it.** Change `src` to `menus.js`. Save. Reload. The message is gone and
> there is an error in the console. "That is what a missing file looks like. The page
> still loads. It just quietly does less than you thought."
>
> **1:25 — Close.** "When a script does not seem to be doing anything, the console is the
> first place to look — every single time."

---

## I2 · Finding something on the page
*Depth 1 · needs I1*

**Teaches** — `querySelector`, `textContent`, and where the script tag has to sit.

**The line that lands** — *Find it first. Then change it. The selector is the same kind
you already write in CSS.*

**For you, not for students** — The card shows where the script tag goes by breaking it.
The starter already has the tag at the bottom of the body, so everything works until step 6
moves it into `<head>` and the heading stops changing. The error in the console tab is the
lesson: the script ran before the heading existed. Do not explain where the tag goes before
then.

**Video: short, optional.** 60 seconds — text changing on its own is worth seeing once.

### The ladder

1. **Starter.** The page already has `<script src="menu.js"></script>` just before
   `</body>`, and `menu.js` has one line in it. There is one `<h1>`, one
   `<p class="special">` (used once), and several `.price` paragraphs.
2. **Find it.** In `menu.js`:

   ```js
   const heading = document.querySelector("h1");
   console.log(heading.textContent);
   ```

   Save. The console tab prints the heading's words. "The selector is the same kind you
   write in CSS." `const` is a name you will not change. `let` is one you will.
3. **Change it.** Add `heading.textContent = "Blue Door Diner — Closed Mondays";`. Save.
   The heading changes on screen. Point out that the HTML file still says the old words:
   the script changed the page the browser had already built.
4. **Predict.** Ask: if the script finds `.price` and sets its text, which price changes?
   Then try it with `document.querySelector(".price").textContent = "Free today";`. Only
   the first one. `querySelector` gives you the first match.
5. **Change the special.** Target `.special`, the one-of-a-kind line, and change it to a
   new special. This is the realistic use:

   ```js
   const special = document.querySelector(".special");
   special.textContent = "Today's special: tomato soup";
   ```
6. **Break it.** Cut the `<script>` line and paste it into `<head>`. Save. The heading no
   longer changes, and the console tab shows an error such as `Cannot read properties of
   null (reading 'textContent')`, with the file name and line. (It says *set* instead of
   *read* if the `console.log` line is gone.) "The browser reads the page from the top. The
   script ran before the heading existed, so there was nothing to find."
7. **Fix it.** Move the script tag back to the bottom of the body.

**Where students stick**

- Forgetting the dot: `querySelector("special")` looks for a `<special>` tag and finds
  nothing.
- Expecting `.price` to change every price. Only the first one changes. That is step 4,
  and it is worth letting happen.
- Leaving the script tag in `<head>` and not seeing why nothing changes. Send them to the
  console tab first.
- A typo in a name: `heding.textContent` instead of `heading.textContent`. The console tab
  shows `heding is not defined`, with the file name and line.

**Avoid:** `getElementById`, `innerHTML`, `querySelectorAll`, `defer`, `DOMContentLoaded`.
If a student asks about `defer`, the answer is one line: "There are other ways to tell the
page to wait. The bottom of the body is the simplest."

---

## I3 · Responding to a click
*Depth 2 · needs I2*

**Teaches** — `addEventListener`, `<button>`, and hiding something with
`style.display = "none"`.

**The line that lands** — *When this is clicked, then that happens.*

**Video: YES — record next.** 2 minutes. The dead-button moment is the best beat in the
whole branch.

**For you, not for students** — The thing that gets hidden is one element with no other
class: the allergen key (`<p class="key">`). One element, one click, one line of effect. The
many-dishes version is I4. Hiding with `style.display` is the direct way. A stylesheet class
is the neater way once a page gets big, and it can wait.

### Script

> **0:00 — Add `<button>Hide allergen key</button>`** to the HTML. Save. It appears, and it
> looks like a real button.
>
> **0:15 — Click it. Nothing happens. Click it again.** Let it be awkward.
> "It is a button. It looks like a button. It does nothing. HTML can make the button. HTML
> cannot make it *do* anything."
>
> **0:40 — In `menu.js`, find the button and the key** with `querySelector` — "same as last
> time." Two lines, two names.
>
> **1:00 — Add the listener.** Read it aloud in English as you type: *when this button is
> clicked, run this.* Put a `console.log` inside first. Save, click, show the message
> appearing in the console each time. "Before I make it do the real thing, I check that it
> is listening at all."
>
> **1:30 — Replace the `console.log` with `key.style.display = "none";`.** Click. The key
> disappears.
>
> **1:50 — Click again. Nothing.** "It hides the key. That is all it knows how to do. Next
> card, we make it come back."

### The code students end up with

```js
const button = document.querySelector("button");
const key = document.querySelector(".key");

button.addEventListener("click", function () {
  key.style.display = "none";
});
```

**Where students stick**

- Writing `style.display = none` without quotes. The console says `none is not defined`.
- Writing CSS in the script: `display: none`. The console shows a syntax error.
- `querySelector("key")` with no dot, so it looks for a `<key>` tag and finds nothing.
- Calling the function instead of passing it: `addEventListener("click", hide())`. Say it as
  "give it the recipe, do not cook the meal yet." Use only if a student does it.

**Avoid:** the words *callback* and *event*, `classList`, `getElementsByClassName`,
`onclick` in the HTML.

---

## I4 · Hiding many things
*Depth 2 · needs I3*

**Teaches** — `querySelectorAll`, `for...of`, and a variable that remembers a yes or no.

**The line that lands** — *Find all the matching things, then do the same thing to each.*

**For you, not for students** — This is the first loop in the interactive branch, and it
should look like Python. Say it out loud: "`for (const dish of dishes)` is `for dish in
dishes:`." The meat dishes are wrapped in `<div class="meat">` in the starter. Wrapping is
the V2 skill, so the starter supplies it and this branch does not depend on V2.

**Video: no.** I3's video shows the click. The card carries the rest.

### The ladder

1. **Predict.** The starter has a button, "Hide meat dishes," and four dishes. Two have
   `<div class="meat">` around them. Ask: if I find one meat dish with `querySelector` and
   hide it, how many disappear? Try it. One does. "`querySelector` gives you the first one."
2. **Find them all.** Change `querySelector` to `querySelectorAll`. The name is the only
   change. Now there is a list of every `.meat` dish, and `style.display = "none"` on the
   list does nothing. A list cannot be hidden.
3. **Do it to each.** Loop over the list:

   ```js
   const meatDishes = document.querySelectorAll(".meat");

   button.addEventListener("click", function () {
     for (const dish of meatDishes) {
       dish.style.display = "none";
     }
   });
   ```

   Both meat dishes disappear.
4. **Make it come back.** A button that only hides is half a button. Add a variable that
   remembers which way it is, and flip it on each click:

   ```js
   let meatHidden = false;

   button.addEventListener("click", function () {
     meatHidden = !meatHidden;
     for (const dish of meatDishes) {
       if (meatHidden) {
         dish.style.display = "none";
       } else {
         dish.style.display = "";
       }
     }
   });
   ```

   Say it in English: "Flip the yes or no. If it is yes, hide them. If it is no, put them
   back." The empty quotes mean "go back to whatever the stylesheet says."
5. **Change the label.** Use `textContent` from I2 to make the button read "Show all
   dishes" and "Hide meat dishes."

**Where students stick**

- `querySelector` where they meant `querySelectorAll`. The first only hides one dish, so
  the bug is easy to see.
- Forgetting the dot in `".meat"`.
- Putting `let meatHidden = false;` inside the click function. It resets to `false` on
  every click, so the button only ever hides. This is worth letting happen once.
- `!meatHidden` looks like a typo. Read it aloud: "not meat-hidden," flip it.

**Later, not here** — This works. The neater way, for pages that get big, is to add and
remove a class on each dish and let the stylesheet decide what the class does. That is
`classList`, and it comes with the idea that an element can have more than one class. Skip
it for now.

**Avoid:** `getElementsByClassName`, `classList`, `forEach` in this card, `hidden` as an
HTML attribute, and the word *array*. Say "list."

---

## I5 · Collapsing a section
*Depth 2 · needs I3*

**Teaches** — `id`, the `#` selector, and flipping a section between hidden and shown by
asking the section itself which it is.

**The line that lands** — *A class can label many things. An id labels exactly one.*

**For you, not for students** — This is the first time an element gets an `id`. Nothing
new is needed in JavaScript: `querySelector("#breakfast")` is the same command as
`querySelector(".key")`, with a `#` where the dot was. The new idea is that an id belongs
to one element only. The starter has three menu sections, each wrapped in a `div` with its
own id (`breakfast`, `sandwiches`, `soups`), and a button above each one.

**Video: no.** The card carries it.

### The ladder

1. **See the id.** Show `<div id="breakfast">` in the HTML. In the stylesheet, add
   `#breakfast { border: 2px solid #B02E1E; }`. The `#` works in CSS the same way the dot
   does. "A class is a label you can put on many things. An id is a name, and only one
   thing gets it."
2. **Predict.** Put `id="breakfast"` on two sections. Ask: which one does
   `querySelector("#breakfast")` find? The first. The browser does not warn. "Nothing stops
   you. The rule is yours to keep."
3. **Hide one section.** Same as I3, with a new selector:

   ```js
   const button = document.querySelector("#breakfast-button");
   const section = document.querySelector("#breakfast");

   button.addEventListener("click", function () {
     section.style.display = "none";
   });
   ```
4. **Make it come back.** Ask the section which way it is:

   ```js
   button.addEventListener("click", function () {
     if (section.style.display === "none") {
       section.style.display = "";
     } else {
       section.style.display = "none";
     }
   });
   ```

   Read it aloud: "If the section is hidden, show it. Otherwise, hide it." Three equals
   signs is the same as Python's `==`.
5. **Do the other two sections.** Copy the block and change the names. Three sections,
   three copies. Let them feel it.

**Where students stick**

- `querySelector("breakfast")` with no `#`. It looks for a `<breakfast>` tag and finds
  nothing.
- One equals sign in the `if`: `section.style.display = "none"` is a change, not a
  question. The section hides on every click, and nothing complains. Let it happen once.
- Two elements with the same id.
- Spaces or capital letters in an id. Keep them short and lowercase.

**Later, not here** — An id is also the target of a link: `<a href="#breakfast">` jumps to
that section. And writing the same block three times is what a function is for. Neither is
needed here.

**Avoid:** `getElementById`, `classList`, and the word *toggle*.

---

## I6 · Tabs
*Depth 2 · needs I4 + I5*

**Teaches** — showing one section of several by hiding all of them, then showing the one
you want.

**The line that lands** — *To show one, hide them all first, then show the one you want.*

**For you, not for students** — This is I4's loop and I5's ids put together. Each panel has
one class (`panel`) and one id (`breakfast`, `sandwiches`, `soups`). The starter has three
tab buttons above the panels and the second and third panels already hidden with an inline
`style="display: none;"`, so the page opens on Breakfast.

**Video: short, optional.** 60 seconds. The page changing under a click is worth seeing
once.

### The ladder

1. **Predict.** Three buttons, three panels. Ask: what has to happen when the Sandwiches
   tab is clicked? Two things. The other panels go away, and Sandwiches appears. Write the
   two things on the board before any code.
2. **Hide them all.** Find every panel by its class, loop over them, hide each. This is I4.
3. **Show one.** After the loop, find the one panel by its id and show it:

   ```js
   const panels = document.querySelectorAll(".panel");
   const sandwichesButton = document.querySelector("#sandwiches-button");

   sandwichesButton.addEventListener("click", function () {
     for (const panel of panels) {
       panel.style.display = "none";
     }
     document.querySelector("#sandwiches").style.display = "";
   });
   ```

   The order matters, and students can test it. Swap the two steps and the panel hides
   itself right after it shows.
4. **Do the other two tabs.** Same block, new names.

**Where students stick**

- Showing the panel first and then hiding every panel, including the one they just showed.
- Putting `style.display = ""` on the class list, not the one panel.
- Mixing up the id of the button and the id of the panel.

**Stretch, not on the card for everyone** — The loop is now copied three times. Put it in
a function named `hideAll()`, define it once, and call it at the start of each click. Python
students already know `def`.

**Avoid:** `classList`, event delegation, `data-` attributes, and anything that highlights
the active tab. Styling the active tab is a nice extra for students who finish early.

---

---
---

# DATA BRANCH

**How this branch teaches.** Teach the direct way first, the way a student would try it
without being told. Where professional practice is more complicated (`map`, `filter`,
`reduce`, `async`/`await`, promises, arrow functions, template strings), say nothing, or
give it one line marked "later." Almost no student will do professional web work, and those
who do can learn the professional way then. If a card has two reasonable ways to do
something, use the one with fewer new ideas.

## Before the cards: the data service

**This branch assumes Newborn Swing provides the following. It does not exist yet.**

Students never type their menu data as code. They fill in a grid, and their page asks for the
data the way a real site asks a database.

- **Menu data tab** — a spreadsheet-style grid in the project IDE, one row per dish, one
  column per field in the content model students wrote in the first week.
- **Data address** — a read-only web address per project that returns the grid as JSON, in
  grid order.
- **A page that asks for it** — a short copy-paste block (D1) that fetches the address and
  hands the dishes to a function the student writes.

### Data contract

| Field | Sent as | Notes |
|---|---|---|
| `name` | text | Required. |
| `category` | text | For example "Sandwiches". |
| `price` | number | Send a number, not text, so D5 behaves exactly as written. Currency is not stored. Students choose their own symbol when they show a price. |
| `description` | text | **Leave the field out when the cell is empty.** Do not send `null` or empty text. D3 depends on this. |
| `dietary` | list of words | The dietary notes from T1, for example `["vegetarian"]`. Entered comma-separated in the grid. **Do not lowercase or clean them.** D4's capital-V bug depends on it being possible. |

---

## D0 · A thing with named parts
*Depth 1 · needs I1*

**Teaches** — object literals, dot notation, and a list of objects.

**The line that lands** — *An object is one dish: a bag of named values. The whole menu is
a list of those bags.*

**Demo** — All in `menu.js`. Write each step, save, and read the console tab.

1. One dish, written by hand:

   ```js
   const dish = { name: "Grilled cheese", price: 7 };
   console.log(dish.name);
   console.log(dish.price);
   ```

   `const` is a name you will not change. `let` is one you will. The console tab shows
   `Grilled cheese` and `7`.
2. Change it, and add a part:

   ```js
   dish.price = 8;
   console.log(dish.price);
   dish.vegetarian = true;
   console.log(dish.vegetarian);
   ```
3. Two dishes in a list:

   ```js
   const dish1 = { name: "Grilled cheese", price: 7 };
   const dish2 = { name: "Tomato soup", price: 5.5 };
   const menu = [dish1, dish2];
   console.log(menu[0].name);
   console.log(menu.length);
   ```
4. Log a whole dish with `console.log(dish);`. The console tab prints it as readable text:
   `{ name: "Grilled cheese", price: 8, vegetarian: true }`.

**Say this out loud:** "Typing one dish is fine for learning what an object is. Nobody
types a whole menu this way. In the next card the menu arrives from somewhere else and you
just read it."

**For students who know Python** — tell them two things:

- In Python you would usually write a `class` first and make dishes from it. In JavaScript
  you can just write the dish. No class, no `__init__`, no `self`.
- The closest thing you already know is a dictionary: named values inside curly braces.

| Python | JavaScript |
|---|---|
| `{"name": "Pancakes"}` | `{ name: "Pancakes" }` |
| `dish["name"]` | `dish.name` |
| `[dish1, dish2]` | `[dish1, dish2]` |
| `len(menu)` | `menu.length` |
| `True`, `None` | `true`, `null` |

**For you, not for students** — JavaScript objects are prototype-based: they inherit from
other objects, not from classes. Nothing in this unit needs that. Students only ever use
plain objects written out directly.

**Where students stick**

- A colon, not an equals sign, between a name and its value inside the braces.
- A comma between parts, and no comma after the last one.
- Counting from zero. `menu[0]` is the first dish.
- `dish.price = 8` works even though `dish` is a `const`. The name still means the same
  dish. Only one of its parts changed.

**Avoid:** `class`, `new`, `this`, prototypes, methods, `Object.keys`. Never explain
prototypes.

**Video: no.** Logging values is static, and the card can show it.

---

## D1 · Getting the menu from the data service
*Depth 1 · needs D0*

**Teaches** — what comes back from a data address, and the block that asks for it.

**The line that lands** — *This is the list you wrote on paper in the first week. Same
fields, same order, now stored where a computer can ask for it.*

**Demo** — Three moments, in this order:

1. Open the student's own session-1 content model next to the Menu data grid. The fields
   match column for column. That moment is worth more than any code walkthrough, because it
   closes a loop opened at the start of the course.
2. Open the data address in its own browser tab. The same rows come back as text, full of
   braces and quotes. "This is what a database hands back. It is called JSON. It looks like
   the objects you typed last card, because JavaScript's objects are where the format came
   from. You will read it. You will never write it."
3. Paste the block below into `menu.js`, put `console.log(dishes);` inside `showMenu`,
   save, and read the console tab. A list of dishes, one per line. Then change that line
   to `console.log(dishes[0].name);`. Just the first dish's name.

### The block students paste

```js
fetch("PASTE-YOUR-DATA-ADDRESS-HERE")
  .then(function (response) { return response.json(); })
  .then(function (dishes) { showMenu(dishes); });

function showMenu(dishes) {
  // your code goes here
}
```

Tell them: change the address, and write only inside `showMenu`. Do not edit the first
three lines. "The page asks, and the answer arrives a moment later. Code inside `showMenu`
runs after the answer arrives. Code outside it runs before." The reason comes in D1a. For
now it is a rule.

**Where students stick**

- Putting `console.log(dishes)` outside `showMenu`, where `dishes` does not exist yet.
- A typo in the address. The console shows an error and the page stays quiet, which is the
  I1 habit: look in the console first. A mistyped data address shows a plain "Failed to
  fetch" error in the console tab, not the longer message real developer tools give.
- Editing the first three lines.

**Avoid:** the words *promise*, *async*, *await* and *callback*. The block is a thing you
paste, the way `<link>` was a thing you pasted in T9. D1a explains the idea in plain words
(*when it arrives, then...*) and keeps the vocabulary off the core path.

**Video: short, optional.** 90 seconds. The surprise is the data address in its own tab: the
rows they typed into a grid are sitting there as text. Then the console tab.

---

## D1a · Waiting for the data
*Depth 2 · needs D1 + I3*

**Teaches** — that asking for data is not the same as having it, and that code using the
data has to wait for it to arrive.

**The line that lands** — *You know "when this is clicked, then that happens." This is the
same sentence: when the data arrives, then build the menu.*

**Why it works** — The block from D1 reads as a sentence students already understand from
I3. The function passed to `addEventListener` does not run when the page loads. It runs
later, when something happens. The function in the data block works the same way: it runs
when the data arrives. No new idea, only a new trigger.

**Video: short, optional.** 60 seconds. The motion is the point: a blank page, three
seconds of nothing, then the menu filling in.

### Beats

1. **Predict first.** Put this on the board and have every student write down the order the
   three messages will print, before anyone runs anything:

   ```js
   console.log("1: asking");

   fetch("PASTE-YOUR-DATA-ADDRESS-HERE")
     .then(function (response) { return response.json(); })
     .then(function (dishes) { console.log("3: the data arrived"); });

   console.log("2: asked, now carrying on");
   ```

   Most students put "3" second, because it sits in the middle of the file.
2. **Run it.** The order is 1, 2, 3. Let it sit for two seconds. "The code did not stop and
   wait. It asked, and it kept going."
3. **Tie it to I3.** "Look at `addEventListener` from last time. That function did not run
   when the page loaded either. It ran later, when someone clicked. The function in the
   data block is the same: it runs *when the data arrives.*"
4. **Make the wait visible.** Add `?delay=3` to the end of the data address, inside the
   quotes. Reload. Nothing for three seconds, then the data. "At school the answer comes
   back in a blink. Out in the world it can take seconds. Your page has to be ready for
   the wait."
5. **The loading message.** Before the request, put "Loading the menu..." on the page with
   `textContent`. The loop in `showMenu` replaces it. With the delay on, the message shows
   for three seconds, then the menu takes its place. "Never leave a visitor looking at a
   blank page."
6. **The D1 error, explained.** Put `console.log(dishes)` after the request, outside the
   function. The error says `dishes is not defined`. "That is not a typo. Out here, the data
   has not arrived yet, so it does not exist yet."

### Activity

- **Everyone:** the prediction and the loading message. Take off `?delay=3` before handing
  the page in.
- **Stretch, not on the card for everyone:** add a third step for when something goes
  wrong, with `.catch`. It is the same sentence shape: *when it fails, then show "Sorry,
  the menu could not load."* Test it by breaking the address.

**Where students stick**

- Expecting the messages to print in file order. This is the lesson. Do not rescue them
  from it before they have predicted.
- Reading the delay as the page being broken. Point at the loading message.
- Leaving `?delay=3` on and wondering why the page is slow.

**Avoid:** *promise*, *async*, *await*, *callback* and *asynchronous*. Say "arrives" and
"when ... then." The newer `async` and `await` spelling is the professional way to write this
block. Leave it for students who meet it elsewhere.

---

## D2 · Building the page from the data
*Depth 2 · needs D1a*

**Teaches** — looping the list and writing the HTML from it. New on this card: `for ... of`,
building up a piece of text, and `innerHTML`.

**The line that lands** — *You stop writing dishes. You write the thing that writes the
dishes.*

**Video: YES — record next.** 2 minutes. This is the payoff of the entire branch and it is
completely a motion lesson.

### Script

> **0:00 — HTML with twelve dishes hand-typed.** Scroll it slowly. "Twelve dishes. Every
> one of these I typed out by hand. If I want to change how a price looks, I change it
> twelve times."
>
> **0:25 — Show the Menu data tab** beside it: the same twelve dishes as rows. "Same
> information. No tags."
>
> **0:40 — Delete every dish from the HTML.** All of it. Leave one empty
> `<div class="menu"></div>`. Save. **The page is blank.** Let it sit.
>
> **0:55 — Write the loop inside `showMenu`.** Narrate in English: for each dish in the
> list, add the HTML for one dish to a growing piece of text, then put the text on the
> page.
>
> **1:20 — Save. All twelve come back.** "I did not type a single one of those."
>
> **1:35 — The payoff.** Switch to the Menu data tab and add a thirteenth row. Save.
> Reload the menu page. **It appears, and you never opened the HTML or the JavaScript.**
> Say that out loud.
>
> **1:50 — One more.** Change how a price is written in the loop, once. Every dish
> updates. "One change. Thirteen dishes. That is why this is worth doing."

### Reference loop (for you, not shown on the card)

```js
function showMenu(dishes) {
  let html = "";
  for (const dish of dishes) {
    html += "<h3>" + dish.name + "</h3>";
    // use your own currency symbol here
    html += '<p class="price">' + dish.price + "</p>";
    html += "<p>" + dish.description + "</p>";
  }
  document.querySelector(".menu").innerHTML = html;
}
```

**Avoid:** `toFixed`, which belongs to D7. Prices come out as `9`, not `9.00`, and that is
fine for now.

**Where students stick**

- A blank page. Send them to the console first, then check the selector has its dot.
- **Later, not here** — The loop trusts the data, so a dish whose name had HTML tags in it
  would change the layout. Do not teach the fix.

---

## D3 · When the data is wrong
*Depth 2 · needs D2*

**Teaches** — defaults and empty states.

**The line that lands** — *Decide once what a missing price means, and make the page do
that every time.*

**Demo** — Clear a dish's description in the Menu data tab. The word **`undefined`**
appears on the menu for every visitor to see. Then handle it.

**Setup note** — This works as written only because the data service leaves an empty
field out entirely. If it sent empty text or `null` instead, the page would show a blank
or the word `null`, and the demo would change.

**Video: no.** The card's before-and-after screenshot does it. `undefined` on a restaurant
menu is funny enough in a still image.

---

## D4 · Filtering
*Depth 3 · needs D2 + I3*

**Teaches** — picking some of the dishes out of the list with a loop and an `if`, and
specifying behavior as trigger and response.

**The line that lands** — *Given the menu is showing everything, when I choose vegetarian,
then only vegetarian dishes remain.*

**This is where given/when/then gets named**, and it is the only card in the course that
uses the term. It earns it here because the starting state genuinely changes the outcome.

**For Python students** — This is the loop they already know, written in JavaScript. Put the
two side by side:

```python
veg = []
for dish in dishes:
    if "vegetarian" in dish["dietary"]:
        veg.append(dish)
```
```js
const veg = [];
for (const dish of dishes) {
  if (dish.dietary.includes("vegetarian")) {
    veg.push(dish);
  }
}
```

`append` becomes `push`, `in` becomes `includes`, and the punctuation changes. Nothing else
is new. Then `showMenu(veg)` builds the page from the short list, and the D2 code does not
change at all.

**Video: short, optional.** 90 seconds.

### Beats

1. Full menu. Click "Vegetarian". Non-vegetarian dishes disappear.
2. Click "Everything". They return. (The button calls `showMenu(dishes)` with the whole list.)
3. **Count out loud** before and after, and check against the data. "Eight dishes.
   Five vegetarian. I counted five on the screen. That is the test."
4. Break it, without touching any code: in the Menu data tab, change one dietary note from
   `vegetarian` to `Vegetarian`. Save. Reload. That dish drops out of the filter. "Capital
   V. The computer does not think those are the same word. The code is fine. The data
   changed."

**Later, not here** — JavaScript lists have a built-in `filter` that does this in one line.
Students who ask can be shown it. It is not needed, and the loop above is not wrong.

**Avoid:** `filter`, `map`, arrow functions, and the word *callback* on the core path.

---

## D5 · Sorting
*Depth 3 · needs D2*

**Teaches** — `sort` with a comparator.

**The line that lands** — *Sorting numbers is not the same as sorting words.*

**Demo** — The gotcha, which is verified and real:

```
default sort:      10, 11.5, 5.5, 6, 9
with a comparator: 5.5, 6, 9, 10, 11.5
```

"`10` comes before `9` — because it is comparing them letter by letter, and `1` comes
before `9`. It is alphabetizing your prices."

**The recipe students paste** — Sorting by price needs a short function. Give it as a recipe
and do not explain how it works:

```js
dishes.sort(function (a, b) {
  return a.price - b.price;
});
```

"`a.price - b.price` puts the cheapest first. Swap them, `b.price - a.price`, for the most
expensive first." That is the whole lesson. The surprise is that sorting numbers needs a
rule, and the rule is a recipe. Students who want to know why it works can ask at the table.

**Video: no.** The two lines above, side by side in the card, make the point instantly.

---

## D6 · One data service, many pages
*Depth 3 · needs D2*

**Teaches** — several pages reading the same data address.

**The line that lands** — *Change the price once. It changes everywhere it appears.*

**Demo** — A menu page and a specials page, both pasting the same block with the same
address. Change one price in the Menu data tab. Reload both. Both show the new price.

**Video: no.** Two or three students reach this. Teach it at the table.

---

## D7 · Adding up an order
*Depth 3 · needs D2 + I4*

**Teaches** — keeping a list of what the visitor picked, and working out the total from the
list every time.

**The line that lands** — *Work the total out from scratch every time, rather than adding
and subtracting as you go.*

**For you, not for students** — The prices start out in the program's data, as numbers, so
nothing is read back out of text on the page. This card is the reason the order tracker
lives in the data branch. Each student chooses their own currency by what they write when
they show a price: `"$" + dish.price` in one restaurant, `dish.price + " gold pieces"` in
another. The grid stores only the number.

**Video: no.** One or two students reach this; teach it at the table.

### The ladder

1. **A list for the order.** Beside `dishes`, add `let order = [];`. This list is what the
   visitor has picked. Nothing else in the program knows.
2. **An Add button on each dish.** The loop from D2 writes a button into each dish's HTML.
3. **Connect each button to its dish.** The page is built from one long string, so the
   buttons do not exist until the loop is done. Find them afterward and loop with a position
   number. Button number `i` belongs to dish number `i`:

   ```js
   const buttons = document.querySelectorAll(".add");
   for (let i = 0; i < buttons.length; i++) {
     buttons[i].addEventListener("click", function () {
       order.push(dishes[i]);
       showOrder();
     });
   }
   ```

   Python students know this shape as `for i in range(len(buttons))`.
4. **Show the order.** `showOrder()` loops over `order`, adds up the prices, and writes the
   lines and the total to the page. It rebuilds the whole summary every time:

   ```js
   function showOrder() {
     let total = 0;
     let html = "";
     for (const dish of order) {
       html += "<p>" + dish.name + "</p>";
       total += dish.price;
     }
     html += "<p>Total: " + total + "</p>";
     document.querySelector(".order").innerHTML = html;
   }
   ```
5. **A Clear button.** Set `order = []` and call `showOrder()`.

> **Note before you record or write this:** most of the Blue Door prices are clean and will
> *not* produce the floating point error. `9.00 + 5.50 + 6.50` is exactly `21`. To get the
> artifact you need a price ending in `.99` or an odd ten-cent value, for example
> **`4.00 + 12.99` displays as `16.990000000000002`**. Put one `.99` dish on the menu if you
> want this beat, and then show `total.toFixed(2)`.

**Where students stick**

- Putting `let order = [];` inside a function, so it empties on every call.
- A dish with no price (a soup at "market price"). `total += undefined` gives `NaN`.
  This is D3's lesson again: skip dishes with no price, or decide what they cost.
- Connecting buttons to dishes before the page has been built, so `querySelectorAll`
  finds nothing.
- Counting from one. Dish number `0` is the first.

**Stretch, not on the card for everyone** — Add a Remove button. It is harder than it
looks. Students who add a running total on the side (`total += ...`, `total -= ...`) will
find that it drifts out of agreement with the order after a few clicks. That is the reason
for step 4: the list is the one place that says what was picked, and the page is rebuilt
from it. Removing an item from a list needs `splice`, so show it only to students who ask.

**Avoid:** `reduce`, `map`, `data-` attributes, and reading prices back out of the page.

---

---
---

# Summary

| | Cards |
|---|---|
| **Videos to record first** | T2, T9, T14, T16, T18 |
| **Videos to record next** | T13, V5, V6, I1, I3, D2 |
| **Short, if time** | T5, T6, T17, V2, V7, I2, I6, D1, D1a, D4 |
| **No video** | T1, T4, T10, T11, T12, T15, T19, T20, T21, V1, V3, V4, V8, I4, I5, D0, D3, D5, D6, D7 |

**Rules that hold across every script above**

- Screen only. No talking head. 60–180 seconds.
- Record **after** teaching the card two or three times, so the video answers where
  students actually stick rather than where you think they will.
- Never name a tag or property the card has not introduced.
- Let the surprising moment sit in silence for two seconds before explaining it. The pause
  is what makes it land.
- Never apologise for a plain page.
