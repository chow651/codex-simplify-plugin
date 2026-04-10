const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");

const SKILL_NAMES = ["using-simplify", "simplify"];
const GATE_MARKER = "## Simplify Gate";

function defaultCodexRoot() {
  return path.join(os.homedir(), ".codex");
}

function normalizeNewlines(text) {
  return text.replace(/\r\n/g, "\n");
}

function detectNewline(text) {
  return text.includes("\r\n") ? "\r\n" : "\n";
}

function ensureDir(dirPath) {
  fs.mkdirSync(dirPath, { recursive: true });
}

function copyDir(sourceDir, targetDir) {
  fs.cpSync(sourceDir, targetDir, {
    force: true,
    recursive: true,
  });
}

function appendGateIfNeeded(gateText, agentsPath) {
  const hasAgentsFile = fs.existsSync(agentsPath);
  const currentContent = hasAgentsFile ? fs.readFileSync(agentsPath, "utf8") : "";
  const newline = detectNewline(currentContent || gateText);

  if (currentContent.includes(GATE_MARKER)) {
    return false;
  }

  ensureDir(path.dirname(agentsPath));

  let nextContent = currentContent;
  if (nextContent.length > 0 && !nextContent.endsWith("\n")) {
    nextContent += newline;
  }
  if (nextContent.length > 0) {
    nextContent += newline;
  }
  nextContent += normalizeNewlines(gateText).trimEnd().replace(/\n/g, newline) + newline;

  fs.writeFileSync(agentsPath, nextContent, "utf8");
  return true;
}

function removeGateIfPresent(gateText, agentsPath) {
  if (!fs.existsSync(agentsPath)) {
    return false;
  }

  const currentContent = fs.readFileSync(agentsPath, "utf8");
  const newline = detectNewline(currentContent || gateText);
  const normalizedCurrent = normalizeNewlines(currentContent);
  const normalizedGate = normalizeNewlines(gateText).trimEnd();
  const gateIndex = normalizedCurrent.indexOf(normalizedGate);

  if (gateIndex === -1) {
    return false;
  }

  let nextContent =
    normalizedCurrent.slice(0, gateIndex) +
    normalizedCurrent.slice(gateIndex + normalizedGate.length);

  nextContent = nextContent.replace(/\n{3,}/g, "\n\n").trim();

  if (nextContent.length === 0) {
    fs.rmSync(agentsPath, { force: true });
    return true;
  }

  nextContent = nextContent.replace(/\n/g, newline) + newline;
  fs.writeFileSync(agentsPath, nextContent, "utf8");
  return true;
}

function installBundle(options = {}) {
  const packageRoot = options.packageRoot || path.resolve(__dirname, "..");
  const codexRoot = options.codexRoot || defaultCodexRoot();
  const agentsPath = options.agentsPath || path.join(codexRoot, "AGENTS.md");
  const withGate = options.withGate !== false;

  const installedSkills = [];
  const skillsRoot = path.join(codexRoot, "skills");

  ensureDir(skillsRoot);

  for (const skillName of SKILL_NAMES) {
    const sourceDir = path.join(packageRoot, "skills", skillName);
    const targetDir = path.join(skillsRoot, skillName);
    copyDir(sourceDir, targetDir);
    installedSkills.push(targetDir);
  }

  let gateInstalled = false;
  if (withGate) {
    const gatePath = path.join(packageRoot, "examples", "AGENTS.snippet.md");
    const gateText = fs.readFileSync(gatePath, "utf8");
    gateInstalled = appendGateIfNeeded(gateText, agentsPath);
  }

  return {
    agentsPath,
    codexRoot,
    gateInstalled,
    installedSkills,
    withGate,
  };
}

function uninstallBundle(options = {}) {
  const packageRoot = options.packageRoot || path.resolve(__dirname, "..");
  const codexRoot = options.codexRoot || defaultCodexRoot();
  const agentsPath = options.agentsPath || path.join(codexRoot, "AGENTS.md");
  const removedSkills = [];

  for (const skillName of SKILL_NAMES) {
    const targetDir = path.join(codexRoot, "skills", skillName);
    if (fs.existsSync(targetDir)) {
      fs.rmSync(targetDir, { force: true, recursive: true });
      removedSkills.push(targetDir);
    }
  }

  const skillsRoot = path.join(codexRoot, "skills");
  if (fs.existsSync(skillsRoot) && fs.readdirSync(skillsRoot).length === 0) {
    fs.rmSync(skillsRoot, { force: true, recursive: true });
  }

  const gatePath = path.join(packageRoot, "examples", "AGENTS.snippet.md");
  const gateText = fs.readFileSync(gatePath, "utf8");
  const gateRemoved = removeGateIfPresent(gateText, agentsPath);

  return {
    agentsPath,
    codexRoot,
    gateRemoved,
    removedSkills,
  };
}

module.exports = {
  defaultCodexRoot,
  installBundle,
  uninstallBundle,
};
