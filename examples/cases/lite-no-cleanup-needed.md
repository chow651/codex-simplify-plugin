# Lite / no cleanup needed

## Task

Adjust a README command example to point at the published package name after the registry release.

## Signals

- docs-only update inside the installer usage section
- no behavior change in skills or CLI

## simplify outcome

- mode: `Lite`
- task type: `refactor`
- tracks: `quality`, `repo_fit`, `reuse`

## Evidence for `no cleanup needed`

- the change stays local to usage text
- it follows the existing README pattern
- it adds no abstraction, state, or duplication
- the affected path is covered by manual doc review

## Verification

- check the rendered command block in both README files
