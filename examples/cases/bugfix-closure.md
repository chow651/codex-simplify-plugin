# Bugfix Closure

**Task**

Fix `install.ps1` so it works on older PowerShell versions where `ConvertFrom-Json -AsHashtable` is unavailable.

**Diff shape**

- local script bugfix
- installer behavior changed
- setup path risk increased above Lite

**using-simplify decision**

- task type: `bugfix`
- mode: `Standard`

**Why**

- installer behavior matters at setup time
- compatibility bug affects real users
- local enough to avoid `Strict`

**simplify result**

- reviewed `blast_radius`, `repo_fit`, `quality`
- replaced unsupported JSON parsing assumptions
- normalized collection handling for older PowerShell behavior

**Verification**

- parsed `install.ps1`
- reran install from local source
- confirmed local skill mirrors were updated
