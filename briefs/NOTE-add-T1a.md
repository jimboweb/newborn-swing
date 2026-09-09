# Add one card: T1a "What a tag is"

A new trunk card goes between T1 and T2. The current sequence never explicitly teaches
what a tag *is* — T2 jumps straight to building a page skeleton out of them.

## What to do

1. **Replace `db/checkpoints_seed.json`** with the attached version. It now has 44
   entries: T1a is new, and every trunk card from T2 onward has had its `ordinal`
   incremented by one. Branch cards are untouched.

2. **Add `T1a-what-a-tag-is.md`** to `content/cards/`. Its frontmatter carries
   `code: T1a`, so the loader will match it regardless of filename.

3. `update_card_stubs.js` should pick both up on the next deploy — the new checkpoint
   needs inserting rather than updating, so check the seeder handles a code that is not
   yet in the `checkpoints` table.

## Watch out for

- **Ordinals shifted.** Anything that hardcodes a trunk ordinal, or assumes T2 is
  ordinal 4, needs updating. The branch offsets (`trunk: 0`) are unchanged.
- **No student progress exists yet**, so renumbering is safe now. It would not be later.
- The card has a `starter:` block, so the **Try it** button applies to it. The starter is
  deliberately a page with *no tags at all* in the body — that is the lesson, not a bug.
  Do not "fix" it.
