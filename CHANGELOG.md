# Changelog

All notable protocol changes for the `simplify` skill set are recorded here.

## [0.4.0] - 2026-04-10

- added `codex-simplify uninstall` to remove installed skills and the appended `Simplify Gate` block
- restored worked examples so the cleanup modes and `no cleanup needed` outcome have concrete references
- expanded install coverage for nested targets and pre-existing instruction files without trailing newlines
- documented cross-environment installation by making `--target` and `--agents` the primary override path

## [0.3.0] - 2026-04-10

- added the `codex-simplify` npm CLI for global installation
- introduced `codex-simplify install` with default skill copy plus gate append behavior
- documented npm-first installation while keeping manual installation available

## [0.2.1] - 2026-04-10

- removed repository distribution scaffolding, setup scripts, automation gate code, and internal design artifacts from the published tree
- rewrote the README files around manual skill installation plus the `AGENTS.md` gate snippet
- replaced repository-facing distribution wording with generic agent-behavior and manifest terminology

## [0.2.0] - 2026-04-10

- moved mode selection fully into `using-simplify`; `simplify` now requires a caller-provided mode
- added an explicit invocation contract and required router-to-executor handoff data
- defined `no_issues` versus `ok` status semantics and a deterministic Lite merge rule
- made `efficiency` entry depend on objective diff signals instead of vague performance intuition
- added inline decision guards and a pre-report self-checklist

## [0.1.0] - 2026-04-08

- introduced the layered `using-simplify` router plus `simplify` executor split
- formalized `Skip`, `Lite`, `Standard`, `Strict`, and `no cleanup needed`
- mapped task closure to `feature`, `refactor`, and `bugfix`
- defined track selection and post-cleanup verification as required closure steps
