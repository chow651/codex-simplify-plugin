# Codex Simplify

[![Skill-first](https://img.shields.io/badge/shape-skill--first-111111?style=flat-square)](./skills/simplify/SKILL.md)
[![Windows](https://img.shields.io/badge/windows-AGENTS%20gate-0A7A3F?style=flat-square)](./examples/AGENTS.snippet.md)
[![macOS%2FLinux](https://img.shields.io/badge/macos%2Flinux-optional%20Stop%20hook-1F6FEB?style=flat-square)](./examples/codex.hooks.json)

[中文说明](./README.zh-CN.md)

> A skill-first finish-line discipline for Codex.<br>
> Tighten a code task before you call it done.

`simplify` is primarily a **Codex skill**. The plugin layer exists to make installation and distribution easier, but the core product is the skill itself: a maintenance-debt cleanup protocol for task closure.

## At A Glance

| Area | Default path |
|---|---|
| Core product | [`skills/simplify/SKILL.md`](./skills/simplify/SKILL.md) |
| Best Windows setup | Skill + `AGENTS.md` gate |
| Best macOS/Linux setup | Skill + `AGENTS.md` gate + optional Codex `Stop` hook |
| What the plugin adds | Easier install, marketplace entry, skill mirror, optional gates |

## What It Does

When a code task is being wrapped up, `simplify` asks the main agent to:

- classify the task as `feature`, `refactor`, or `bugfix`
- review the current task scope through the right tracks
- merge findings into `must_fix`, `fix_if_cheap`, and `note_only`
- rerun verification before claiming completion

Core tracks:

- `repo_fit`
- `quality`
- `reuse`
- `blast_radius`
- `efficiency` when performance-relevant

## Quick Start

### Install The Skill Bundle

Windows PowerShell:

```powershell
irm https://raw.githubusercontent.com/chow651/codex-simplify-plugin/master/scripts/install.ps1 | iex
```

macOS/Linux:

```bash
curl -fsSL https://raw.githubusercontent.com/chow651/codex-simplify-plugin/master/scripts/install.sh | bash
```

### Install With Finish-Line Gate

Windows PowerShell:

```powershell
& ([scriptblock]::Create((irm https://raw.githubusercontent.com/chow651/codex-simplify-plugin/master/scripts/install.ps1))) -WithGate
```

macOS/Linux:

```bash
curl -fsSL https://raw.githubusercontent.com/chow651/codex-simplify-plugin/master/scripts/install.sh | SIMPLIFY_WITH_GATE=1 bash
```

## Use Modes

| Mode | Best for | What it adds |
|---|---|---|
| Skill only | Manual use, existing Codex users | Just the skill |
| Skill + `AGENTS.md` gate | Windows, stronger finish-line discipline | Appends `Simplify Gate` to `~/.codex/AGENTS.md` |
| Skill + `AGENTS.md` gate + Codex `Stop` hook | macOS/Linux, extra native stop-time guard | Also writes a `Stop` hook to `~/.codex/hooks.json` |

## Platform Notes

| Platform | Skill | `AGENTS.md` gate | Codex `Stop` hook |
|---|---|---|---|
| Windows | Yes | Recommended primary path | Not currently available |
| macOS/Linux | Yes | Useful | Available as optional extra guard |

OpenAI's Codex hooks documentation currently says hooks are disabled on Windows. For Windows users, the practical enforcement path is the skill plus the `AGENTS.md` gate.

## What The Installer Writes

- plugin: `~/plugins/simplify`
- marketplace entry: `~/.agents/plugins/marketplace.json`
- visible skill mirror: `~/.codex/skills/simplify/SKILL.md`
- optional instruction gate: `~/.codex/AGENTS.md`
- optional Codex hook: `~/.codex/hooks.json`

## Hook Config

Codex hook discovery lives in `~/.codex/hooks.json` or `<repo>/.codex/hooks.json`, not in the plugin manifest.

This repo ships:

- [SKILL.md](./skills/simplify/SKILL.md): the actual simplify meta-skill
- [AGENTS.snippet.md](./examples/AGENTS.snippet.md): instruction-layer finish-line gate
- [simplify_stop_gate.py](./scripts/simplify_stop_gate.py): Codex `Stop` hook script
- [codex.hooks.json](./examples/codex.hooks.json): example Codex hook config

The hook is optional. The skill is the core product.

## Typical Workflow

1. Finish the main implementation and run your normal verification.
2. Invoke `simplify` on the current diff.
3. Run the matching review tracks.
4. Fix worthwhile findings.
5. Re-verify before stopping.

## Why This Repo Is A Plugin At All

Because plugins are useful for **distribution**, not because the skill needs a plugin to work.

If you already know how to manage Codex skills manually, you can think of this repo as:

- a strong `simplify` skill
- plus a convenience installer

## License

[MIT](./LICENSE)
