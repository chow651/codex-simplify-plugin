# Codex Simplify Plugin

`simplify` is a Codex plugin and skill for final code cleanup review.

It is designed for the end of a coding task, not the beginning. The goal is to review the current diff from three angles and tighten the result before you treat the work as finished:

- reuse
- quality
- efficiency

## What it includes

- `.codex-plugin/plugin.json`
- `skills/simplify/SKILL.md`

## Install

Clone this repository into your local Codex plugins directory:

```powershell
git clone https://github.com/chow651/codex-simplify-plugin.git "$HOME\\plugins\\simplify"
```

Add the plugin to your local marketplace file `~/.agents/plugins/marketplace.json`.

An example entry is included at [examples/marketplace.json](./examples/marketplace.json).

## Optional completion gate

If you want `simplify` to run automatically at the end of code tasks, add the snippet from [examples/AGENTS.snippet.md](./examples/AGENTS.snippet.md) to your global `AGENTS.md`.

This keeps the trigger scoped to code-task completion instead of letting the skill fire on unrelated conversations.

## Usage

Manual use:

- invoke `simplify` from the skill picker or command surface

Recommended behavior:

- use it only after code changes exist
- keep the review focused on the current diff
- use it as a cleanup gate, not as a general-purpose code review tool
