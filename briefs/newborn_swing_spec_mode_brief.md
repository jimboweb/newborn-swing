# Feature Brief: Spec-Mode Exercises for Newborn Swing

## Goal

Add an opt-in mode to Python exercises where students write a **specification**
(a general-rule description plus a set of structured test cases) instead of
solving the problem directly. Specs are auto-validated against a teacher-authored
reference solution, optionally batch-approved by the teacher, then used to
generate implementation tasks for other students via **non-reciprocal pairings**
(a directed assignment: student A implements student B's spec; not necessarily
mutual).

Existing "standard" exercises (student writes code, runs against fixed tests)
must be completely unaffected. This is an additive mode, not a replacement.

## Why a structured form instead of raw docstring/doctest text

Students should never hand-type triple-quotes, `>>>`, or exception syntax.
Two reasons:

1. **Boilerplate risk**: a student who fully understands the intended behavior
   can still fail the exercise purely on Python syntax (a missing quote, wrong
   number of `>` characters).
2. **Vocabulary gap**: students at this level have not learned exceptions.
   They should be able to express "this input is invalid" without knowing
   `raise`, `ValueError`, or traceback formatting.

So: a **structured form** captures the spec's content, and the platform
generates any Python text needed from that structured data — never the
reverse.

## Data model

Extend the existing `exercises` table (adjust names to match current schema):

```
exercises
  ...existing columns...
  mode                      enum('standard', 'spec')  default 'standard'
  reference_solution        text, nullable   -- server-side only, never sent to client
  min_examples              int, nullable    -- e.g. 4; only enforced when mode='spec'
  require_teacher_approval  boolean default false
```

New tables:

```
specs
  id
  exercise_id
  student_id
  description_text     -- the free-prose general spec, no numbers
  status                enum('needs_revision','auto_passed','awaiting_approval',
                              'shared','rejected')
  auto_check_details    jsonb   -- per test case: input, claimed output, reference
                                 output, matched? (see "Auto-check logic" below)
  reviewed_by           nullable, fk -> users
  reviewed_at           nullable, timestamp
  created_at, updated_at

spec_test_cases
  id
  spec_id
  order                 int
  inputs                jsonb    -- {"payment": 2.00, "price": 1.25}
  expect_type           enum('returns', 'raises')
  expected_value        nullable  -- only meaningful when expect_type='returns'

pairings
  id
  exercise_id
  round
  spec_author_id
  implementer_id
  -- directed, not reciprocal: one row per assigned implementation task.
  -- Reciprocal pairing (if ever wanted) is just two rows, A->B and B->A;
  -- the schema itself doesn't assume either direction.

implementations
  id
  pairing_id      -- fk -> pairings
  spec_id         -- fk -> specs (the spec being implemented)
  student_id
  code_text
  test_result     -- pass/fail summary, see "Checking implementer code" below
  submitted_at
```

## The student-facing spec form

Two parts, no raw text entry of Python syntax:

1. **Spec description** — a single open text box. This is the general-rule
   paragraph (e.g. "Calculates change owed... if payment is less than price,
   the payment is insufficient and should be treated as an error").
2. **Test cases** — a repeatable row, add/remove freely, minimum enforced by
   `exercise.min_examples`:
   - One input field per parameter, auto-generated from the exercise's
     declared function signature (field labels come from the signature, not
     typed by the student)
   - A choice: **"Returns:"** `[value input]` vs **"Should cause an error"**
     (radio button or toggle) — no exception type, no message, nothing beyond
     the binary. This is intentional: the class has not covered exception
     types, and specifying one is not required at this stage. If/when it is
     needed later, `expect_type='raises'` can gain an optional `error_type`
     column without invalidating any spec written under the current form.

## Auto-check logic (runs on every spec submission, mode='spec' only, no toggle — this always runs)

For each row in `spec_test_cases`:

- Run `exercise.reference_solution` with the given `inputs`.
- If `expect_type='returns'`: compare the reference solution's return value to
  `expected_value`. Mismatch = flag this specific case.
- If `expect_type='raises'`: call the reference solution in a try/except
  `Exception` (broad, deliberately untyped — matches the "any error" semantics
  agreed for this class level). Pass if any exception was raised, fail if the
  call returned normally.

Also check `count(spec_test_cases) >= exercise.min_examples`.

Any failure -> `status = 'needs_revision'`, and `auto_check_details` should
contain enough detail to show the student specifically which case was wrong
(e.g. "Your example claims `calculate_change(2.00, 1.25)` returns `0.65`, but
the reference solution returns `0.75`"). This never reaches another student —
it's a private loop between the platform and the spec's author.

All cases pass -> `status = 'auto_passed'`. Then:
- if `exercise.require_teacher_approval = false` -> immediately `status = 'shared'`
- if `true` -> stays `awaiting_approval`, held for batch review

## Teacher batch approval

Not a live queue — a batch screen, reviewed on the teacher's own timing
(e.g. "specs are due, I review the batch, then I generate this round's
pairings"). For a given exercise, list all specs with `status='awaiting_approval'`,
let the teacher approve or reject each. Approve -> `'shared'`. Reject -> back to
`'needs_revision'` with an optional free-text comment field the student sees.

Batch action affordance: select-all / approve-all should exist, since most
specs that reach this stage (already auto-passed) will be fine and the teacher
is mainly scanning for weak-but-technically-valid specs (e.g. four near-identical
test cases that pass the auto-check but don't actually pin down the interesting
behavior).

## Generating a round (pairings)

Existing/planned pairing generation (round-robin or manual admin assignment)
should only draw from specs with `status='shared'` for that exercise. If a
student hasn't reached `'shared'` yet when a round is generated, whatever
they'd be assigned should show a "waiting on partner's spec" placeholder state
rather than an empty or broken editor.

## What the implementer sees

For their assigned `pairings` row, generate a **read-only Python docstring
header** from the paired spec's `description_text` + `spec_test_cases`, for
display purposes:

```python
def calculate_change(payment, price):
    """
    Calculates change owed when a customer pays for an item.
    If payment is less than price, the payment is insufficient
    and should be treated as an error.

    >>> calculate_change(2.00, 1.25)
    0.75
    >>> calculate_change(5.00, 1.00)
    4.00
    >>> calculate_change(1.25, 1.25)
    0.0
    >>> calculate_change(1.00, 1.25)
    Raises an error
    """
```

Note the last line: **do not** attempt to generate a literal Python
traceback block for `raises` cases. Standard doctest traceback matching
requires an exact exception class name on the last line (or use of
`IGNORE_EXCEPTION_DETAIL`, which still requires *a* class name to be present)
— there's no clean stdlib doctest way to express "any exception, unspecified
type," which is exactly the semantics agreed for this class level. Render
`raises` cases in the displayed docstring as a plain, readable line ("Raises
an error") rather than fake/misleading traceback syntax.

**Important architectural consequence**: because of the above, do **not**
check the implementer's submitted code by running it through the stdlib
`doctest` module. Instead, write a small custom test runner that iterates
`spec_test_cases` directly (the same structured rows used for the auto-check
above) against the implementer's submitted function:

- `expect_type='returns'` -> call function, compare to `expected_value`
- `expect_type='raises'` -> call function in try/except `Exception`, pass if
  any exception raised

This is more robust than parsing generated doctest text back out, and it's
the same logic already written for the spec auto-check — factor it into one
shared function used in both places (checking a spec's claims against the
reference solution, and checking an implementation's behavior against a
spec's test cases).

Store the result on `implementations.test_result` (pass/fail per case is
probably worth keeping as structured detail here too, mirroring
`auto_check_details`, rather than a single boolean).

## Standard-mode exercises

`mode='standard'` exercises use none of the above — existing checkpoint
submission, execution, and grading flow is untouched. The `exercises` table
gains columns but standard-mode rows simply leave them null/default.

## Migration note (exercises is a live production table)

`exercises` already has real rows in production (existing exercises, with
student submissions against them). Add the four new columns via a proper
migration, matching whatever migration tooling Newborn Swing already uses
(migrations currently run automatically on Heroku deploy via the Procfile
release phase). Specifically:

- `mode`'s default of `'standard'` must be enforced at the **database level**
  (`DEFAULT 'standard'` in the column definition itself), not only in
  application code — so every existing row, and any row inserted through a
  path other than the app's normal create-exercise flow, still resolves to
  `'standard'` with no ambiguity.
- This should be a plain additive `ALTER TABLE ... ADD COLUMN ... DEFAULT ...`
  for each of the four columns — safe and non-locking for a table this size,
  no backfill script needed, since the column default handles every existing
  row automatically.
- No changes to any existing column, no data transformation — this migration
  should not touch the values of any pre-existing row, only add new columns
  to the table shape.

## Explicitly out of scope for this pass

- Exception *type* granularity (agreed: not needed yet; schema leaves room
  via a future nullable `error_type` column, don't build it now)
- Live/real-time approval queue (batch only, per teacher preference)
- Reciprocal-pairing UI shortcut (directed pairings cover this as two rows;
  no special-cased "mutual pair" feature needed)
- Fan-out rounds (one spec, many implementers) — schema supports it
  (multiple `pairings` rows with the same `spec_author_id`), no dedicated UI
  needed yet
