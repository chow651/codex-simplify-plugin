# Feature / Standard

## Task

Add `codex-simplify uninstall` without changing the existing install contract.

## Signals

- behavior change in the CLI entrypoint
- multiple files touched, but still inside the installer surface
- no runtime enforcement or protocol taxonomy change

## simplify outcome

- mode: `Standard`
- task type: `feature`
- tracks: `repo_fit`, `quality`, `reuse`

## Findings

- `must_fix`: keep install and uninstall on the same path override model
- `fix_if_cheap`: update README command examples in both languages
- `note_only`: none

## Verification

- `npm test`
- `npm pack --dry-run`
- local `npm install -g . --prefix <temp>` followed by `codex-simplify install` and `codex-simplify uninstall`
