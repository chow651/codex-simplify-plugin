#!/usr/bin/env python3
import json
import os
import re
import subprocess
import sys
from pathlib import Path


BEHAVIOR_EXTENSIONS = {
    ".c",
    ".cc",
    ".cpp",
    ".cs",
    ".go",
    ".h",
    ".hpp",
    ".java",
    ".js",
    ".json",
    ".jsx",
    ".kt",
    ".kts",
    ".mjs",
    ".py",
    ".rb",
    ".rs",
    ".sh",
    ".sql",
    ".swift",
    ".toml",
    ".ts",
    ".tsx",
    ".yaml",
    ".yml",
}

BEHAVIOR_FILENAMES = {
    "hooks.json",
    ".app.json",
    ".mcp.json",
    "plugin.json",
    "package.json",
    "package-lock.json",
    "pnpm-lock.yaml",
    "yarn.lock",
    "requirements.txt",
    "pyproject.toml",
    "poetry.lock",
    "Cargo.toml",
    "Cargo.lock",
    "go.mod",
    "go.sum",
}

REVIEW_ONLY_PATTERNS = [
    re.compile(r"read-only review", re.IGNORECASE),
    re.compile(r"review only", re.IGNORECASE),
    re.compile(r"acting as a reviewer", re.IGNORECASE),
    re.compile(r"without code ownership", re.IGNORECASE),
    re.compile(r"只读审查"),
    re.compile(r"不负责最终裁决"),
    re.compile(r"不承担 `?simplify`? 收尾责任"),
]

SIMPLIFY_SUMMARY_PATTERNS = [
    re.compile(r"\bsimplify\b", re.IGNORECASE),
    re.compile(r"\busing-simplify\b", re.IGNORECASE),
    re.compile(r"维护债清理"),
    re.compile(r"收尾审查"),
    re.compile(r"收尾路由"),
]

SIMPLIFY_RESOLUTION_PATTERNS = [
    re.compile(r"\bmust_fix\b", re.IGNORECASE),
    re.compile(r"\bfix_if_cheap\b", re.IGNORECASE),
    re.compile(r"\bnote_only\b", re.IGNORECASE),
    re.compile(r"kept findings", re.IGNORECASE),
    re.compile(r"skip reason", re.IGNORECASE),
    re.compile(r"selected tracks", re.IGNORECASE),
    re.compile(r"task type", re.IGNORECASE),
    re.compile(r"已修问题"),
    re.compile(r"保留问题"),
    re.compile(r"保留理由"),
    re.compile(r"跳过依据"),
    re.compile(r"审查轨道"),
    re.compile(r"任务类型"),
]


def load_payload() -> dict:
    raw = sys.stdin.read().strip()
    if not raw:
        return {}
    try:
        return json.loads(raw)
    except json.JSONDecodeError:
        return {}


def git_root(cwd: str) -> str | None:
    try:
        result = subprocess.run(
            ["git", "rev-parse", "--show-toplevel"],
            cwd=cwd,
            capture_output=True,
            text=True,
            check=True,
        )
    except Exception:
        return None
    root = result.stdout.strip()
    return root or None


def changed_files(cwd: str) -> list[str]:
    commands = [
        ["git", "diff", "--name-only"],
        ["git", "diff", "--cached", "--name-only"],
        ["git", "ls-files", "--others", "--exclude-standard"],
    ]
    found: list[str] = []
    seen = set()
    for command in commands:
        try:
            result = subprocess.run(
                command,
                cwd=cwd,
                capture_output=True,
                text=True,
                check=True,
            )
        except Exception:
            continue
        for line in result.stdout.splitlines():
            path = line.strip()
            if not path or path in seen:
                continue
            seen.add(path)
            found.append(path)
    return found


def is_behavior_affecting(path_str: str) -> bool:
    path = Path(path_str)
    if path.name in BEHAVIOR_FILENAMES:
        return True
    if path.name == "SKILL.md":
        return True
    if ".codex-plugin" in path.parts:
        return True
    if "hooks" in path.parts:
        return True
    suffix = path.suffix.lower()
    return suffix in BEHAVIOR_EXTENSIONS


def transcript_window(transcript_path: str | None) -> str:
    if not transcript_path:
        return ""
    transcript_file = Path(transcript_path)
    if not transcript_file.exists():
        return ""
    try:
        content = transcript_file.read_text(encoding="utf-8", errors="ignore")
    except OSError:
        return ""
    return content[-120000:]


def is_review_only(window: str) -> bool:
    return any(pattern.search(window) for pattern in REVIEW_ONLY_PATTERNS)


def has_simplify_evidence(window: str) -> bool:
    has_summary = any(pattern.search(window) for pattern in SIMPLIFY_SUMMARY_PATTERNS)
    has_resolution = any(pattern.search(window) for pattern in SIMPLIFY_RESOLUTION_PATTERNS)
    return has_summary and has_resolution


def has_strict_signal(paths: list[str]) -> bool:
    if len(paths) >= 6:
        return True
    lowered_paths = [path.lower().replace("\\", "/") for path in paths]
    signal_patterns = (
        "/tests/",
        "/test/",
        "/hooks/",
        "/.codex-plugin/",
        "package.json",
        "package-lock.json",
        "pnpm-lock.yaml",
        "yarn.lock",
        "requirements.txt",
        "pyproject.toml",
        "poetry.lock",
        "cargo.toml",
        "cargo.lock",
        "go.mod",
        "go.sum",
        "dockerfile",
        ".github/workflows/",
        "simplify_stop_gate.py",
        "/config/",
        "/configs/",
    )
    return any(any(pattern in path for pattern in signal_patterns) for path in lowered_paths)


def has_shared_surface_signal(paths: list[str]) -> bool:
    lowered_paths = [path.lower().replace("\\", "/") for path in paths]
    return any(
        path.startswith("skills/") or path == "examples/agents.snippet.md"
        for path in lowered_paths
    )


def is_lite_signal(paths: list[str]) -> bool:
    return (
        len(paths) <= 2
        and not has_strict_signal(paths)
        and not has_shared_surface_signal(paths)
    )


def task_related_files(changed: list[str], window: str) -> list[str]:
    if not window:
        return []
    lowered = window.lower().replace("\\", "/")
    related: list[str] = []
    for path_str in changed:
        path = Path(path_str)
        candidates = {
            path_str.lower().replace("\\", "/"),
            path.as_posix().lower(),
            path.name.lower(),
        }
        if any(candidate and candidate in lowered for candidate in candidates):
            related.append(path_str)
    return related


def emit_continue() -> None:
    json.dump({"continue": True}, sys.stdout)


def emit_block(reason: str) -> None:
    json.dump(
        {
            "decision": "block",
            "reason": reason,
        },
        sys.stdout,
    )


def should_block_stop(task_diff: list[str], has_evidence: bool, review_only: bool) -> bool:
    if review_only or not task_diff or has_evidence:
        return False
    if is_lite_signal(task_diff):
        return False
    return True


def main() -> int:
    payload = load_payload()
    if payload.get("stop_hook_active"):
        emit_continue()
        return 0

    cwd = payload.get("cwd") or os.getcwd()
    if not git_root(cwd):
        emit_continue()
        return 0

    window = transcript_window(payload.get("transcript_path"))
    review_only = is_review_only(window)
    if review_only:
        emit_continue()
        return 0

    changed = [path for path in changed_files(cwd) if is_behavior_affecting(path)]
    task_diff = task_related_files(changed, window)
    has_evidence = has_simplify_evidence(window)
    if not should_block_stop(task_diff=task_diff, has_evidence=has_evidence, review_only=review_only):
        emit_continue()
        return 0

    emit_block(
        "Run using-simplify before stopping. Decide whether this closure is Lite, Standard, or Strict; "
        "if simplify is required, classify the task as feature, refactor, or bugfix, review the matching "
        "tracks, conclude no-cleanup-needed or fix must-fix items, rerun the right level of verification, "
        "then report the outcome with reasons."
    )
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
