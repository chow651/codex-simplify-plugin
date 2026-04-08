---
name: simplify
description: Use when a code task is being wrapped up or the agent is about to claim completion while task-related code changes still exist.
---

<SUBAGENT-STOP>
If you were dispatched as a read-only reviewer, advisor, or analyst without code ownership for the current task, skip this skill.
</SUBAGENT-STOP>

<EXTREMELY-IMPORTANT>
If you are about to claim completion on a code task and task-related code changes still exist, you MUST run simplify or explicitly state why simplify is being skipped.

You do not have the option to silently skip this.
</EXTREMELY-IMPORTANT>

# Simplify

## Overview

Simplify is a finish-line discipline for code tasks.

Its job is to reduce future maintenance debt before you treat the current task as finished.

This skill is for the stage after the main implementation works and before you conclude the task.

Whether simplify was triggered by the user, by standing instructions, or by an external stop gate, the protocol is the same.

## When To Use

Run `simplify` when all of these are true:

- the current task is code work, refactor work, bug-fix work, debugging follow-up, testing implementation, architecture implementation, or engineering implementation
- you are wrapping up the task, preparing to stop, or preparing to claim completion
- task-related code changes still exist
- the main implementation is already done

Do not run `simplify` at the start of a task.

Do not run it while you are still discovering requirements, debugging root cause, or deciding architecture.

## Skip Conditions

You may skip `simplify` only when at least one of these is true:

- there is no meaningful task-related code diff
- the task is non-code work
- you are acting as a read-only reviewer or advisor without implementation responsibility
- the user explicitly told you to stop before cleanup

If you skip, say so explicitly and give the reason.

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

Before claiming completion:

1. classify the task
2. choose the review tracks
3. review the current task scope
4. merge findings locally
5. fix the worthwhile findings
6. rerun verification
7. report fixed findings and kept findings with reasons

If you did not complete these steps, you did not finish simplify.

## Step 1: Classify The Task

Choose exactly one closure type:

- `feature`: adds new behavior or expands existing behavior
- `refactor`: improves structure while preserving behavior
- `bugfix`: corrects existing incorrect behavior with minimal intended scope change

If the task began as debugging, testing, or architecture implementation, map it to one of those three closure types before continuing.

## Step 2: Choose Review Tracks

For `feature`:

- `repo_fit`
- `quality`
- `reuse`

For `refactor`:

- `quality`
- `repo_fit`
- `reuse`

For `bugfix`:

- `blast_radius`
- `repo_fit`
- `quality`

Add `efficiency` only when the task touches hot paths, loops, rendering, repeated data work, concurrency, or clearly wasteful repeated work.

## Track Meanings

### `repo_fit`

Look for:

- repository pattern drift
- naming drift
- boundary violations
- special-case logic that will spread
- new abstractions that should have reused existing ones

### `quality`

Look for:

- redundant state
- parameter sprawl
- copy-paste variants
- leaky abstractions
- stringly-typed branching
- unnecessary wrappers
- control-flow noise

### `reuse`

Look for:

- duplicated helpers
- hand-rolled utilities
- repeated transformations
- missed internal abstractions

### `blast_radius`

Look for:

- fixes that change too much surface area
- patch layering that increases fragility
- narrow fixes that add long-term branching or state

### `efficiency`

Look for:

- redundant work
- hot-path bloat
- recurring no-op updates
- missed concurrency
- unnecessary repeated checks
- avoidable memory growth

## Step 3: Review The Current Task Scope

Inspect only the current task scope:

- use `git diff`
- use `git diff --cached` if the staged diff is the intended target
- if the diff is empty, use the explicitly named edited files for the task

Do not expand this into a broad architecture review.

## Step 4: Review Mode

Prefer one read-only reviewer per selected track when subagents are available.

If subagents are unavailable, run the tracks sequentially yourself and keep the same review contract.

Reviewer rules:

- reviewers do not implement fixes
- reviewers stay within the assigned track
- reviewers return at most 3 findings each
- reviewers cite concrete files and lines when possible
- reviewers do not recommend speculative changes outside the current task scope

## Finding Contract

Use this structure for findings:

```yaml
status: ok | no_issues | blocked
task_type: feature | refactor | bugfix
track: repo_fit | quality | reuse | blast_radius | efficiency
inspected_files:
  - path/to/file
findings:
  - severity: P0 | P1 | P2 | P3
    confidence: high | medium | low
    file: path/to/file
    line: 123
    problem: short problem statement
    why_it_matters: concrete maintenance or correctness impact
    maintenance_impact: low | medium | high
    fix_cost: low | medium | high
    recommended_action: concrete suggested action
```

## Severity Rules

- `P0`: correctness risk, regression risk, broken constraints, or a newly introduced hazard
- `P1`: clear repository drift, duplicated logic, structural debt, or rising maintenance cost
- `P2`: worthwhile cleanup with limited scope and clear payoff
- `P3`: optional observation for the record only

## Step 5: Merge Findings Locally

The main agent is the decision-maker.

Never rank findings by which reviewer produced them.

Sort findings using this order:

1. task-goal violation
2. repository-pattern violation
3. maintenance impact
4. fix cost relative to the current task

Bucket findings into:

- `must_fix`
- `fix_if_cheap`
- `note_only`

Default policy:

- `P0` -> `must_fix`
- `P1` -> `must_fix` if it increases maintenance debt in the current task
- `P2` -> `fix_if_cheap`
- `P3` -> `note_only`

## Step 6: Fix Only Worthwhile Things

Fix:

- all real `must_fix` findings
- `fix_if_cheap` findings that stay within the task boundary

Do not:

- broaden the task
- start unrelated refactors
- accept speculative architecture advice without repository evidence
- chase low-confidence findings without concrete support

## Step 7: Rerun Verification

After cleanup changes:

- rerun the normal task verification
- confirm no new failures were introduced
- confirm simplify did not expand scope unexpectedly

## Step 8: Report Outcome

Report:

- task type
- selected tracks
- fixed findings
- kept findings
- reasons for kept findings
- verification run after cleanup

## Red Flags

If you catch yourself thinking any of these, stop and run simplify correctly:

- "the code works, that's enough"
- "tests passed so I can stop"
- "the review comments are optional, I'll skip all of them"
- "this diff is probably fine"
- "I already looked once"
- "I do not need to classify the task"
- "I can review every track every time"
- "I will just say done now"

## Common Rationalizations

| Excuse | Reality |
|--------|---------|
| "The implementation already works" | Working code still accumulates maintenance debt. |
| "Tests passed, so cleanup can wait" | Passing tests do not remove duplication, drift, or structural noise. |
| "This is too small for simplify" | Small tasks are exactly where silent debt slips through. |
| "I'll just run every track" | Wrong track choice adds noise and hides real issues. |
| "I'll accept every suggestion" | Simplify is triage, not blind compliance. |
| "I can skip verification after cleanup" | Cleanup can still break behavior. Re-verify. |
| "A reviewer mentioned ideas, so I should refactor broadly" | Stay inside the current task boundary. |

## Common Failure Modes

- treating simplify like a start-of-task skill
- forgetting to classify the task
- running too broad a review scope
- allowing reviewers to decide what must be fixed
- treating all findings as mandatory
- skipping the post-cleanup verification step
