# Bugfix Closure

**Task**

Fix `install.ps1` so it works on older PowerShell versions where `ConvertFrom-Json -AsHashtable` is unavailable.

**Diff shape**

- one script plus small surrounding support changes
- installer behavior changed

**using-simplify decision**

- task type: `bugfix`
- mode: `Standard`

**Why**

- compatibility bug in the install path
- installer behavior matters at user setup time
- local enough to avoid Strict

**simplify result**

- reviewed `blast_radius`, `repo_fit`, `quality`
- replaced unsupported parsing assumptions
- normalized collection handling for older PowerShell behavior

**Verification**

- parsed `install.ps1`
- reran install against the current repo as source
- confirmed visible skill mirrors updated correctly
