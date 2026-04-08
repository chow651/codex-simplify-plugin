import unittest

from scripts import simplify_stop_gate


class SimplifyStopGateTests(unittest.TestCase):
    def test_allows_lite_local_task_without_simplify_evidence(self):
        self.assertFalse(
            simplify_stop_gate.should_block_stop(
                task_diff=["scripts/install.ps1"],
                has_evidence=False,
                review_only=False,
            )
        )

    def test_blocks_shared_skill_surface_without_simplify_evidence(self):
        self.assertTrue(
            simplify_stop_gate.should_block_stop(
                task_diff=["skills/simplify/SKILL.md"],
                has_evidence=False,
                review_only=False,
            )
        )

    def test_blocks_agents_snippet_surface_without_simplify_evidence(self):
        self.assertTrue(
            simplify_stop_gate.should_block_stop(
                task_diff=["examples/AGENTS.snippet.md"],
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
                task_diff=[
                    "README.md",
                    "skills/simplify/SKILL.md",
                    "examples/AGENTS.snippet.md",
                ],
                has_evidence=True,
                review_only=False,
            )
        )


if __name__ == "__main__":
    unittest.main()
