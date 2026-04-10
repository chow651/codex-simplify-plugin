# Bugfix

## Task

Fix gate appending so an existing instruction file without a trailing newline still gets a clean separator before `## Simplify Gate`.

## Signals

- local behavior bug
- one installer module plus one test file
- no verification-scope expansion beyond installer behavior

## simplify outcome

- mode: `Lite`
- task type: `bugfix`
- tracks: `blast_radius`, `repo_fit`, `quality`

## Findings

- `must_fix`: preserve readable formatting in `AGENTS.md`
- `fix_if_cheap`: add an explicit regression test for the no-trailing-newline case
- `note_only`: none

## Verification

- `node --test tests/npm-install.test.js`
