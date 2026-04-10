# Codex Simplify

[![Skill-first](https://img.shields.io/badge/shape-skill--first-111111?style=flat-square)](./skills/simplify/SKILL.md)
[![AGENTS gate](https://img.shields.io/badge/gate-AGENTS.md-0A7A3F?style=flat-square)](./examples/AGENTS.snippet.md)

[中文说明](./README.zh-CN.md)

> A skill-first finish-line discipline for Codex.<br>
> Route through `using-simplify`, then run `simplify`, before calling a code task done.

`Codex Simplify` is a small skill bundle for task closure. It can now be installed as a global npm CLI, while still shipping the raw skills and the `AGENTS.md` gate snippet in this repository.

## At A Glance

| Area | Path |
|---|---|
| Entry skill | [`skills/using-simplify/SKILL.md`](./skills/using-simplify/SKILL.md) |
| Cleanup protocol | [`skills/simplify/SKILL.md`](./skills/simplify/SKILL.md) |
| Gate snippet | [`examples/AGENTS.snippet.md`](./examples/AGENTS.snippet.md) |
| Protocol history | [`CHANGELOG.md`](./CHANGELOG.md) |
| Review modes | Lite / Standard / Strict |
| Recommended setup | `npm i -g codex-simplify` then `codex-simplify install` |

## Versioning And Upgrades

Current protocol version: `0.2.1`

Version metadata intentionally lives in the skill body plus [CHANGELOG.md](./CHANGELOG.md). The skill frontmatter stays limited to `name` and `description` for Codex skill compatibility.

Upgrade rule:

- replace [`skills/using-simplify/SKILL.md`](./skills/using-simplify/SKILL.md) and [`skills/simplify/SKILL.md`](./skills/simplify/SKILL.md) together
- refresh any installed copy of [`examples/AGENTS.snippet.md`](./examples/AGENTS.snippet.md) when the protocol version changes
- do not mix router and executor versions

Breaking-change rule:

- bump the major version when mode-selection order, router-to-executor handoff fields, task taxonomy, finding contract semantics, or required closure reporting changes in a way that alters agent behavior
- use minor versions for additive clarifications or new objective signals that preserve the same core contract
- use patch versions for wording or packaging cleanup that does not change expected execution behavior

## Repository Shape

This repo ships:

- [using-simplify](./skills/using-simplify/SKILL.md): finish-line router
- [simplify](./skills/simplify/SKILL.md): cleanup protocol executor
- [AGENTS.snippet.md](./examples/AGENTS.snippet.md): optional instruction-layer gate
- [CHANGELOG.md](./CHANGELOG.md): protocol history

## Install

Global npm install:

```bash
npm i -g codex-simplify
codex-simplify install
```

Optional flags:

```bash
codex-simplify install --no-gate
codex-simplify install --target ~/.codex
codex-simplify install --agents ~/.codex/AGENTS.md
codex-simplify uninstall
```

The default install copies both skills into `~/.codex/skills` and appends `## Simplify Gate` to `~/.codex/AGENTS.md` only when that block is not already present.

## Other Assistant Homes

The default target is `~/.codex`, but the CLI is not limited to that directory. If your assistant environment stores skills or instructions elsewhere, point both paths explicitly:

```bash
codex-simplify install --target /path/to/assistant-home --agents /path/to/instructions.md
```

Examples:

```bash
codex-simplify install --target ~/.codex --agents ~/.codex/AGENTS.md
codex-simplify install --target ~/.claude --agents ~/.claude/CLAUDE.md
```

Use the matching `uninstall` command with the same `--target` and `--agents` values when you want to remove the installed skills and gate block.

## Manual Install

From a local clone of this repository:

Windows PowerShell:

```powershell
New-Item -ItemType Directory -Force "$HOME\.codex\skills" | Out-Null
Copy-Item -Recurse -Force .\skills\using-simplify "$HOME\.codex\skills\"
Copy-Item -Recurse -Force .\skills\simplify "$HOME\.codex\skills\"
New-Item -ItemType File -Force "$HOME\.codex\AGENTS.md" | Out-Null
Get-Content .\examples\AGENTS.snippet.md | Add-Content "$HOME\.codex\AGENTS.md"
```

macOS/Linux:

```bash
mkdir -p ~/.codex/skills
cp -R skills/using-simplify ~/.codex/skills/
cp -R skills/simplify ~/.codex/skills/
touch ~/.codex/AGENTS.md
cat examples/AGENTS.snippet.md >> ~/.codex/AGENTS.md
```

If you prefer repository-local guidance, append the snippet to a project `AGENTS.md` instead of the global one.

## How It Works

When a code task is being wrapped up:

1. `using-simplify` checks whether `Skip`, `Lite`, `Standard`, or `Strict` applies.
2. `simplify` reviews the current task scope using the chosen mode.
3. findings are triaged into `must_fix`, `fix_if_cheap`, and `note_only`.
4. the affected path is re-verified before completion is claimed.

`Skip` and `no cleanup needed` are different:

- `Skip` means there is no meaningful simplify target.
- `No cleanup needed` means simplify ran and found nothing worth changing.

## Review Modes

| Outcome | Use when | Result |
|---|---|---|
| `Skip` | Docs-only, comments-only, formatting-only, unrelated metadata, or no task-related behavior diff | Say the skip reason explicitly |
| `Lite` | 1 to 2 local low-risk files, with no shared module, configuration, manifest, or verification-scope change | Short review plus the smallest meaningful verification |
| `Standard` | Normal feature, bugfix, or refactor closure | Full normal cleanup protocol |
| `Strict` | Any high-risk or wide-scope change | Stronger review and broader verification |

Strict is triggered by objective signals such as:

- 6 or more changed files
- build or runtime configuration changes
- dependency manifest changes
- shared or public module changes
- test changes that expand verification scope
- agent-behavior configuration or manifest changes
- user-visible behavior changes across multiple call sites

## Typical Workflow

1. Finish the main implementation and run normal verification.
2. Let `using-simplify` pick the mode.
3. Run `simplify` on the current task scope.
4. Fix worthwhile findings.
5. Re-run verification and then close the task.

## Worked Examples

- [Feature / Standard](./examples/cases/feature-standard-closure.md)
- [Bugfix](./examples/cases/bugfix-closure.md)
- [Lite / no cleanup needed](./examples/cases/lite-no-cleanup-needed.md)
- [Strict](./examples/cases/strict-closure.md)

## License

[MIT](./LICENSE)
