# Strict

## Task

Rework the distribution surface from manual-only installation to a published npm CLI while preserving the simplify protocol and cross-platform installation behavior.

## Signals

- shared packaging metadata changed
- CLI entrypoint added
- installer logic added
- tests and README changed together
- user-visible installation flow changed

## simplify outcome

- mode: `Strict`
- task type: `feature`
- tracks: `repo_fit`, `quality`, `reuse`, `efficiency`

## Findings

- `must_fix`: keep the install logic idempotent for the gate block
- `must_fix`: verify the published package only ships runtime files
- `fix_if_cheap`: add an uninstall path so npm users can remove what the installer wrote
- `note_only`: transcript-scanning hooks remain out of scope for this iteration

## Verification

- `npm test`
- `npm pack --dry-run`
- `npm publish --dry-run --registry https://registry.npmjs.org/`
- real install through `npm i -g codex-simplify`
