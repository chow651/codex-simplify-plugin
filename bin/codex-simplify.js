#!/usr/bin/env node

const path = require("node:path");
const { installBundle, uninstallBundle } = require("../lib/install");

function printHelp() {
  console.log("Usage:");
  console.log("  codex-simplify install [--no-gate] [--target <assistant-home>] [--agents <instruction-file>]");
  console.log("  codex-simplify uninstall [--target <assistant-home>] [--agents <instruction-file>]");
}

function parseArgs(args, command) {
  const options = {
    withGate: true,
  };

  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index];

    if (arg === "--no-gate" && command === "install") {
      options.withGate = false;
      continue;
    }

    if (arg === "--target") {
      index += 1;
      if (!args[index]) {
        throw new Error("Missing value for --target");
      }
      options.codexRoot = path.resolve(args[index]);
      continue;
    }

    if (arg === "--agents") {
      index += 1;
      if (!args[index]) {
        throw new Error("Missing value for --agents");
      }
      options.agentsPath = path.resolve(args[index]);
      continue;
    }

    throw new Error(`Unknown argument: ${arg}`);
  }

  return options;
}

function main(argv = process.argv.slice(2)) {
  const [command, ...rest] = argv;

  if (!command || command === "--help" || command === "-h" || command === "help") {
    printHelp();
    return 0;
  }

  if (command !== "install" && command !== "uninstall") {
    throw new Error(`Unknown command: ${command}`);
  }

  const packageRoot = path.resolve(__dirname, "..");
  const options = {
    packageRoot,
    ...parseArgs(rest, command),
  };

  if (command === "install") {
    const result = installBundle(options);

    console.log(`Installed skills to ${path.join(result.codexRoot, "skills")}`);
    if (result.withGate) {
      if (result.gateInstalled) {
        console.log(`Appended Simplify Gate to ${result.agentsPath}`);
      } else {
        console.log(`Simplify Gate already present in ${result.agentsPath}`);
      }
    } else {
      console.log("Skipped AGENTS.md gate update");
    }
    return 0;
  }

  const result = uninstallBundle(options);
  console.log(`Removed ${result.removedSkills.length} installed skill directories from ${path.join(result.codexRoot, "skills")}`);
  if (result.gateRemoved) {
    console.log(`Removed Simplify Gate from ${result.agentsPath}`);
  } else {
    console.log(`No Simplify Gate block found in ${result.agentsPath}`);
  }
  return 0;
}

try {
  process.exitCode = main();
} catch (error) {
  console.error(`codex-simplify: ${error.message}`);
  printHelp();
  process.exitCode = 1;
}
