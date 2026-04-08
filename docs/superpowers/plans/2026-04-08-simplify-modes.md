# Simplify Modes And Closure Outcomes Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Formalize review modes, objective trigger signals, positive `no cleanup needed` exits, and worked examples across the simplify skills, gate script, and README.

**Architecture:** Keep the router, protocol, enforcement, and documentation layers separate. Use tests to lock the hook behavior first, then align the skill text, AGENTS snippet, worked examples, and README to the same outcome model.

**Tech Stack:** Markdown, Python 3 standard library, Git diff-based hook logic, PowerShell for verification commands.

---

### Task 1: Lock Hook Behavior With Tests

**Files:**
- Create: `tests/test_simplify_stop_gate.py`
- Modify: `scripts/simplify_stop_gate.py`
- Test: `tests/test_simplify_stop_gate.py`

- [ ] **Step 1: Write the failing test**

```python
import unittest

from scripts import simplify_stop_gate


class SimplifyStopGateTests(unittest.TestCase):
    def test_allows_lite_local_task_without_simplify_evidence(self):
        self.assertFalse(
            simplify_stop_gate.should_block_stop(
                task_diff=["skills/simplify/SKILL.md"],
                has_evidence=False,
                review_only=False,
            )
        )

    def test_blocks_standard_scope_without_simplify_evidence(self):
        self.assertTrue(
            simplify_stop_gate.should_block_stop(
                task_diff=[
                    "skills/simplify/SKILL.md",
                    "skills/using-simplify/SKILL.md",
                    "README.md",
                ],
                has_evidence=False,
                review_only=False,
            )
        )

    def test_blocks_strict_signal_without_simplify_evidence(self):
        self.assertTrue(
            simplify_stop_gate.should_block_stop(
                task_diff=["scripts/simplify_stop_gate.py", "package.json"],
                has_evidence=False,
                review_only=False,
            )
        )

    def test_allows_when_simplify_evidence_exists(self):
        self.assertFalse(
            simplify_stop_gate.should_block_stop(
                task_diff=["README.md", "skills/simplify/SKILL.md", "examples/AGENTS.snippet.md"],
                has_evidence=True,
                review_only=False,
            )
        )
```

- [ ] **Step 2: Run test to verify it fails**

Run: `python -m unittest tests.test_simplify_stop_gate -v`
Expected: FAIL because `should_block_stop` does not exist yet.

- [ ] **Step 3: Write minimal implementation**

```python
def is_lite_signal(paths: list[str]) -> bool:
    return len(paths) <= 2 and not has_strict_signal(paths)


def should_block_stop(task_diff: list[str], has_evidence: bool, review_only: bool) -> bool:
    if review_only or not task_diff or has_evidence:
        return False
    if is_lite_signal(task_diff):
        return False
    return True
```

Update `main()` to call `should_block_stop(...)` and keep the block message focused on mode choice, `no cleanup needed`, and verification.

- [ ] **Step 4: Run test to verify it passes**

Run: `python -m unittest tests.test_simplify_stop_gate -v`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add tests/test_simplify_stop_gate.py scripts/simplify_stop_gate.py
git commit -m "test: lock simplify stop gate mode routing"
```

### Task 2: Align Router And Protocol Text

**Files:**
- Modify: `skills/using-simplify/SKILL.md`
- Modify: `skills/simplify/SKILL.md`
- Modify: `examples/AGENTS.snippet.md`
- Test: `tests/test_simplify_stop_gate.py`

- [ ] **Step 1: Write the failing consistency check**

Create a short checklist from the spec and confirm the current text still misses at least one of these items:

```text
- mode order: skip -> strict -> lite -> standard
- positive no-cleanup-needed evidence
- verification order
- report fields include mode and cleanup outcome
```

- [ ] **Step 2: Run the check to verify it fails**

Run: `Select-String -Path 'skills/using-simplify/SKILL.md','skills/simplify/SKILL.md','examples/AGENTS.snippet.md' -Pattern 'no cleanup needed|verification order|mode'`
Expected: The result set is incomplete or phrased inconsistently against the spec checklist.

- [ ] **Step 3: Write minimal implementation**

Update the three files so they all describe the same:

```text
- skip conditions
- Lite / Standard / Strict objective signals
- no-cleanup-needed evidence
- verification order
- closure report fields
```

- [ ] **Step 4: Run checks to verify they pass**

Run: `Select-String -Path 'skills/using-simplify/SKILL.md','skills/simplify/SKILL.md','examples/AGENTS.snippet.md' -Pattern 'no cleanup needed|affected-path verification|task-level verification|Strict|Lite|Standard'`
Expected: Each file contains the expected concepts with matching terminology.

- [ ] **Step 5: Commit**

```bash
git add skills/using-simplify/SKILL.md skills/simplify/SKILL.md examples/AGENTS.snippet.md
git commit -m "docs: align simplify routing and closure protocol"
```

### Task 3: Add Worked Examples

**Files:**
- Create: `examples/feature-standard-closure.md`
- Create: `examples/bugfix-closure.md`
- Create: `examples/lite-no-cleanup-needed.md`
- Create: `examples/strict-closure.md`
- Modify: `README.md`

- [ ] **Step 1: Write the failing link target list**

```text
- examples/feature-standard-closure.md
- examples/bugfix-closure.md
- examples/lite-no-cleanup-needed.md
- examples/strict-closure.md
```

- [ ] **Step 2: Run the check to verify it fails**

Run: `Get-Item 'examples/feature-standard-closure.md','examples/bugfix-closure.md','examples/lite-no-cleanup-needed.md','examples/strict-closure.md'`
Expected: FAIL because the files do not exist yet.

- [ ] **Step 3: Write minimal implementation**

Each example file should include:

```text
1. task background
2. changed files
3. mode decision
4. task type
5. review tracks
6. findings and triage result
7. verification commands
8. final closure wording
```

Update `README.md` to link to the four files directly and remove the placeholder sentence about expanding examples later.

- [ ] **Step 4: Run the check to verify it passes**

Run: `Get-Item 'examples/feature-standard-closure.md','examples/bugfix-closure.md','examples/lite-no-cleanup-needed.md','examples/strict-closure.md'`
Expected: PASS

Run: `Select-String -Path 'README.md' -Pattern 'feature-standard-closure|bugfix-closure|lite-no-cleanup-needed|strict-closure'`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add README.md examples/feature-standard-closure.md examples/bugfix-closure.md examples/lite-no-cleanup-needed.md examples/strict-closure.md
git commit -m "docs: add simplify closure worked examples"
```

### Task 4: Final Verification And Closure Check

**Files:**
- Modify: `README.md`
- Modify: `skills/using-simplify/SKILL.md`
- Modify: `skills/simplify/SKILL.md`
- Modify: `examples/AGENTS.snippet.md`
- Modify: `scripts/simplify_stop_gate.py`
- Modify: `tests/test_simplify_stop_gate.py`

- [ ] **Step 1: Run affected-path verification**

Run: `python -m unittest tests.test_simplify_stop_gate -v`
Expected: PASS

- [ ] **Step 2: Run task-level verification**

Run: `git diff -- README.md examples/AGENTS.snippet.md scripts/simplify_stop_gate.py skills/simplify/SKILL.md skills/using-simplify/SKILL.md tests/test_simplify_stop_gate.py examples`
Expected: Diff shows the five requested themes and the four example files, with no placeholder wording left in `README.md`.

- [ ] **Step 3: Run final consistency check**

Run: `Select-String -Path 'README.md','skills/using-simplify/SKILL.md','skills/simplify/SKILL.md','examples/AGENTS.snippet.md' -Pattern 'Lite|Standard|Strict|no cleanup needed|affected-path verification|task-level verification'`
Expected: PASS

- [ ] **Step 4: Commit**

```bash
git add README.md examples scripts/simplify_stop_gate.py skills/simplify/SKILL.md skills/using-simplify/SKILL.md tests/test_simplify_stop_gate.py docs/superpowers/specs/2026-04-08-simplify-modes-design.md docs/superpowers/plans/2026-04-08-simplify-modes.md
git commit -m "feat: formalize simplify review modes and closure outcomes"
```
