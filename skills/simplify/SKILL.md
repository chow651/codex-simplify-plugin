---
name: simplify
description: Use when changed code needs a final cleanup pass for reuse, quality, and efficiency before you consider the work settled.
---

# Simplify

## Overview

Run a parallel cleanup review over the current diff, then fix the issues found.

This skill is for the stage after the main implementation works but before you treat the code as finished.

## When To Use

- You have modified code and want a tighter final pass.
- The change feels correct but may contain duplication, hacky structure, or wasteful work.
- You want subagents to review the same diff from three angles in parallel.

## Workflow

1. Inspect the current change set with `git diff`, or `git diff --cached` if the staged diff is the intended review target.
2. If there is no meaningful diff, review the most recently edited files for this task.
3. Launch three read-only review agents in parallel.

Review tracks:
- Reuse review: look for duplicated helpers, hand-rolled utilities, and existing abstractions the change should reuse.
- Quality review: look for redundant state, parameter sprawl, copy-paste variants, leaky abstractions, stringly-typed logic, and unnecessary UI wrappers.
- Efficiency review: look for redundant work, missed concurrency, hot-path bloat, recurring no-op updates, unnecessary existence checks, and memory leaks.

4. Aggregate findings locally.
5. Fix only the findings that are real and worth addressing.
6. Summarize what was fixed and what was intentionally left alone.

## Subagent Packet

Use `spawn_agent` for all three reviewers in parallel. Keep them read-only.

Suggested packet shape:

```text
TaskPacket
id: simplify-<track>
goal: Review the current diff for <track>.
role: researcher
workflow_stage: review
inputs:
- Full git diff
- Short task summary
- Relevant constraints
dependencies:
- none
write_scope:
- none
acceptance_checks:
- Cite concrete files and lines when possible
- Return only real findings
escalation_rules:
- If the diff is empty, say so and review the explicitly named edited files instead
- Do not suggest speculative architecture changes unrelated to the diff
return_contract:
- Status
- Summary
- Inspected files
- Findings
- Suggested next action
```

## Fix Standards

- Prefer deletion over extra abstraction when a pattern is unnecessary.
- Reuse existing helpers before adding new ones.
- Keep fixes tightly scoped to the reviewed change.
- Do not turn review into a broad refactor.

## Common Mistakes

- Running only one review angle and calling it simplify.
- Letting review agents make code changes directly.
- Treating every suggestion as mandatory instead of triaging real findings.
- Expanding scope beyond the current diff.
