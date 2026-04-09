# Strict Closure

**Task**

Change hook policy, installer behavior, gate wording, and layered skill routing together.

**Diff shape**

- many files touched
- hook behavior changed
- installer behavior changed
- closure semantics changed

**using-simplify decision**

- task type: `feature`
- mode: `Strict`

**Why**

- broad impact surface
- hook and installer changes affect setup and task closure
- verification had to cover more than one execution path

**simplify result**

- full cleanup discipline
- findings triaged into `must_fix`, `fix_if_cheap`, `note_only`
- stop-gate evidence and installer behavior aligned with the layered skill system

**Verification**

- JSON parsing for plugin and hook examples
- Python compile for stop gate
- PowerShell parse check for `install.ps1`
- shell parse check for `install.sh`
