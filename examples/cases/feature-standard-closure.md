# Feature / Standard Closure

**Task**

Add one-command installers and keep the skill-distribution flow coherent.

**Diff shape**

- touched multiple workflow files
- changed installer behavior
- changed user-facing setup path

**using-simplify decision**

- task type: `feature`
- mode: `Standard`

**Why**

- real feature work
- more than one file changed
- meaningful workflow impact
- not broad enough to require `Strict`

**simplify result**

- reviewed `repo_fit`, `quality`, `reuse`
- aligned the install path with visible skill mirrors
- removed drift between distribution logic and user-facing docs

**Verification**

- parsed both installer scripts
- checked the visible skill mirror paths
- confirmed the workflow description matched the actual install behavior
