# Feature / Standard Closure

## Task Background

Repository case: commit `6bf4b5e4d067c0060b85433cf6f6d132ee3c6d79`

Commit subject:

```text
feat: add one-command installers
```

This change added a new user-facing installation path across both platform scripts and updated the README files to explain how to use it.

## Changed Files

```text
README.md
README.zh-CN.md
scripts/install.ps1
scripts/install.sh
```

## Mode Decision

`Standard`

Why:

- the diff touched 4 files
- it added behavior, not just wording
- it did not hit the strict signals for dependency, hook, plugin manifest, or shared-module changes

## Task Type

`feature`

## Review Tracks

- `repo_fit`
- `quality`
- `reuse`

## Findings And Triage

Example closure result:

```yaml
must_fix: []
fix_if_cheap:
  - keep the installer flags aligned between PowerShell and shell entry points
note_only:
  - README wording can stay concise because the command examples already carry the path difference
```

## Verification Commands

Windows PowerShell:

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File scripts/install.ps1 -RepoSource "$PWD" -InstallHome "$env:TEMP\\simplify-install-test"
```

macOS/Linux:

```bash
SIMPLIFY_REPO_SOURCE="$PWD" SIMPLIFY_INSTALL_HOME="$(mktemp -d)" bash scripts/install.sh
```

## Final Closure Wording

```text
Mode: Standard
Task type: feature
Selected tracks: repo_fit, quality, reuse
Outcome: cleanup applied
Fixed findings: aligned the two installer entry points and kept the docs consistent with the shipped flags
Kept findings: README compression note only
Verification: local PowerShell install run and local shell install run
```
