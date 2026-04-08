---
name: using-simplify
description: Use when a code task is being wrapped up or the agent is about to claim completion while task-related code changes still exist.
---

<SUBAGENT-STOP>
If you were dispatched as a read-only reviewer, advisor, or analyst without code ownership for the current task, skip this skill.
</SUBAGENT-STOP>

<EXTREMELY-IMPORTANT>
If a code task is being wrapped up and task-related code changes still exist, you MUST decide the simplify mode, invoke `simplify` when required, and explicitly state the skip reason when you do not continue into the full protocol.

If `simplify` concludes `no cleanup needed`, report the evidence in the final closure message.

You do not have the option to silently skip this.
</EXTREMELY-IMPORTANT>

# Using Simplify

## Overview

`using-simplify` is the finish-line router for `simplify`.

It does not perform the cleanup protocol itself. Its job is to detect closure conditions, choose the right simplify mode, and route into the full `simplify` skill.

## When To Use

Use this skill when all of these are true:

- the current task is code work
- you are wrapping up the task, preparing to stop, or preparing to claim completion
- task-related code changes still exist

Do not use it at task start.

Do not use it while requirements, root cause, or architecture are still unsettled.

## Skip Conditions

You may skip `simplify` only when at least one of these is true:

- there is no meaningful task-related code diff
- the task is non-code work
- you are acting as a read-only reviewer or advisor without implementation responsibility
- the user explicitly told you to stop before cleanup

If you skip, say so explicitly and give the reason.

## Objective Signals

Do not decide mode from vague feelings alone. Use the current task scope and these signals.

Mode order is fixed:

1. check `skip`
2. if not skipped, check `Strict`
3. if not `Strict`, check `Lite`
4. otherwise use `Standard`

### Skip Signals

You may skip only when all meaningful changes are one of these:

- docs-only edits
- comments-only edits
- formatting-only edits
- unrelated generated churn
- unrelated metadata changes with no behavior impact

### Strict Signals

Use `Strict` when any of these is true:

- 6 or more files are touched
- build or runtime configuration changed
- dependency manifests changed
- tests changed in a way that expands or reshapes verification scope
- shared or public modules changed
- hook configuration changed
- plugin manifest changed
- user-visible behavior changed across multiple call sites

### Lite Signals

Use `Lite` only when all of these are true:

- the change is local and low-risk
- 1 or 2 files are touched
- no shared or public module is changed
- no build, runtime, dependency, hook, or plugin configuration is changed
- no test strategy change is needed

Typical Lite cases:

- single-file bug fix
- local prompt or microcopy correction
- local guard clause or branch cleanup

### Standard Signals

Use `Standard` for everything in between:

- normal feature work
- normal bug fixes
- normal refactors

## No Cleanup Needed

`No cleanup needed` is a valid simplify outcome.

It is not a skip reason. It is the outcome of a completed simplify pass.

You may conclude `no cleanup needed` only when you can point to concrete evidence such as:

- the change stays local
- it follows existing repository patterns
- it does not introduce extra abstraction or state
- it does not duplicate existing behavior
- the affected path is already adequately verified

## Meaningful Diff

A meaningful diff means task-related changes to behavior-affecting files such as:

- source code
- tests
- scripts
- build or runtime configuration
- hook configuration
- plugin manifest
- prompts or instructions that change agent behavior

It does not mean:

- docs-only edits
- comments-only edits
- formatting-only edits
- unrelated generated churn
- unrelated metadata changes with no behavior impact

## The Rule

If the closure conditions are true:

1. decide whether a valid skip condition exists
2. if not skipped, choose `Strict`, `Lite`, or `Standard` using the objective signal order
3. invoke `simplify`
4. follow `simplify` exactly for that mode
5. only then claim completion

This skill routes. `simplify` executes.

## Red Flags

If you catch yourself thinking any of these, stop and invoke `simplify`:

- "the task is basically done"
- "tests passed, so I can stop"
- "the diff is probably fine"
- "this is too small for cleanup"
- "I already looked once"
- "I can just say done now"

## Common Rationalizations

| Excuse | Reality |
|--------|---------|
| "The implementation works already" | Working code can still accumulate maintenance debt. |
| "This task is too small for simplify" | Small tasks are where silent debt often slips through. |
| "I already reviewed the diff mentally" | Informal review is not the simplify protocol. |
| "I do not need to reroute into simplify" | This skill is only the router. `simplify` is the protocol. |
| "I'll just use the full protocol every time" | Wrong mode choice adds noise and encourages formalism. |
