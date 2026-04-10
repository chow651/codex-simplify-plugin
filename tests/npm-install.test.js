const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");

const { installBundle } = require("../lib/install");

function makeTempDir() {
  return fs.mkdtempSync(path.join(os.tmpdir(), "codex-simplify-"));
}

test("installBundle copies both skills and appends the simplify gate", () => {
  const tempRoot = makeTempDir();
  const codexRoot = path.join(tempRoot, ".codex");
  const agentsPath = path.join(codexRoot, "AGENTS.md");

  installBundle({
    packageRoot: path.resolve(__dirname, ".."),
    codexRoot,
    agentsPath,
    withGate: true,
  });

  assert.equal(
    fs.existsSync(path.join(codexRoot, "skills", "using-simplify", "SKILL.md")),
    true,
  );
  assert.equal(
    fs.existsSync(path.join(codexRoot, "skills", "simplify", "SKILL.md")),
    true,
  );

  const agentsContent = fs.readFileSync(agentsPath, "utf8");
  assert.match(agentsContent, /## Simplify Gate/);
});

test("installBundle appends the simplify gate only once", () => {
  const tempRoot = makeTempDir();
  const codexRoot = path.join(tempRoot, ".codex");
  const agentsPath = path.join(codexRoot, "AGENTS.md");

  installBundle({
    packageRoot: path.resolve(__dirname, ".."),
    codexRoot,
    agentsPath,
    withGate: true,
  });

  installBundle({
    packageRoot: path.resolve(__dirname, ".."),
    codexRoot,
    agentsPath,
    withGate: true,
  });

  const agentsContent = fs.readFileSync(agentsPath, "utf8");
  const gateMatches = agentsContent.match(/## Simplify Gate/g) || [];
  assert.equal(gateMatches.length, 1);
});

test("installBundle skips AGENTS.md updates when --no-gate behavior is requested", () => {
  const tempRoot = makeTempDir();
  const codexRoot = path.join(tempRoot, ".codex");
  const agentsPath = path.join(codexRoot, "AGENTS.md");

  installBundle({
    packageRoot: path.resolve(__dirname, ".."),
    codexRoot,
    agentsPath,
    withGate: false,
  });

  assert.equal(
    fs.existsSync(path.join(codexRoot, "skills", "using-simplify", "SKILL.md")),
    true,
  );
  assert.equal(fs.existsSync(agentsPath), false);
});

test("installBundle creates a nested target directory when it does not exist yet", () => {
  const tempRoot = makeTempDir();
  const codexRoot = path.join(tempRoot, "nested", "assistant-home", ".codex");
  const agentsPath = path.join(codexRoot, "AGENTS.md");

  installBundle({
    packageRoot: path.resolve(__dirname, ".."),
    codexRoot,
    agentsPath,
    withGate: true,
  });

  assert.equal(
    fs.existsSync(path.join(codexRoot, "skills", "simplify", "SKILL.md")),
    true,
  );
  assert.equal(fs.existsSync(agentsPath), true);
});

test("installBundle appends the gate cleanly when AGENTS.md has no trailing newline", () => {
  const tempRoot = makeTempDir();
  const codexRoot = path.join(tempRoot, ".codex");
  const agentsPath = path.join(codexRoot, "AGENTS.md");

  fs.mkdirSync(codexRoot, { recursive: true });
  fs.writeFileSync(agentsPath, "# Existing instructions", "utf8");

  installBundle({
    packageRoot: path.resolve(__dirname, ".."),
    codexRoot,
    agentsPath,
    withGate: true,
  });

  const agentsContent = fs.readFileSync(agentsPath, "utf8");
  assert.match(agentsContent, /^# Existing instructions\n\n## Simplify Gate/m);
});

test("uninstallBundle removes installed skills and the appended gate", () => {
  const tempRoot = makeTempDir();
  const codexRoot = path.join(tempRoot, ".codex");
  const agentsPath = path.join(codexRoot, "AGENTS.md");
  const { uninstallBundle } = require("../lib/install");

  installBundle({
    packageRoot: path.resolve(__dirname, ".."),
    codexRoot,
    agentsPath,
    withGate: true,
  });

  const result = uninstallBundle({
    packageRoot: path.resolve(__dirname, ".."),
    codexRoot,
    agentsPath,
  });

  assert.equal(result.removedSkills.length, 2);
  assert.equal(result.gateRemoved, true);
  assert.equal(
    fs.existsSync(path.join(codexRoot, "skills", "using-simplify", "SKILL.md")),
    false,
  );
  assert.equal(fs.existsSync(agentsPath), false);
});
