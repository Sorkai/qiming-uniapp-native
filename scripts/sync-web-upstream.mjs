import { spawnSync } from "node:child_process";
import { chdir, cwd, exit } from "node:process";

const defaults = {
  sourceRemote: "web-upstream",
  sourceBranch: "agent",
  targetRemotes: ["origin", "farrran"]
};

function fail(message, code = 1) {
  console.error(`[sync-web] ${message}`);
  exit(code);
}

function run(command, args, options = {}) {
  const result = spawnSync(command, args, {
    cwd: options.cwd || cwd(),
    encoding: "utf8",
    stdio: options.capture ? "pipe" : "inherit"
  });

  if (result.error) throw result.error;
  if (result.status !== 0 && !options.allowFailure) {
    const detail = options.capture
      ? String(result.stderr || result.stdout || "").trim()
      : "";
    throw new Error(
      `${command} ${args.join(" ")} failed${detail ? `: ${detail}` : ""}`
    );
  }
  return result;
}

function git(args, options = {}) {
  return run("git", args, options);
}

function output(args) {
  return String(git(args, { capture: true }).stdout || "").trim();
}

function parseList(value) {
  return String(value || "")
    .split(",")
    .map(item => item.trim())
    .filter(Boolean);
}

function parseArgs(argv) {
  const options = {
    dryRun: false,
    push: false,
    skipVerify: false,
    sourceRemote: defaults.sourceRemote,
    sourceBranch: defaults.sourceBranch,
    targetRemotes: defaults.targetRemotes,
    publishBranches: []
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    const next = () => {
      index += 1;
      if (!argv[index]) fail(`Missing value after ${arg}`);
      return argv[index];
    };

    if (arg === "--dry-run") options.dryRun = true;
    else if (arg === "--push") options.push = true;
    else if (arg === "--skip-verify") options.skipVerify = true;
    else if (arg === "--source-remote") options.sourceRemote = next();
    else if (arg === "--source-branch") options.sourceBranch = next();
    else if (arg === "--remotes") options.targetRemotes = parseList(next());
    else if (arg === "--publish-branches") {
      options.publishBranches = parseList(next());
    } else if (arg === "--help" || arg === "-h") {
      console.log(`Usage: node scripts/sync-web-upstream.mjs [options]

Options:
  --dry-run                 Fetch and report the pending merge only.
  --push                    Push the resulting branch to both mobile remotes.
  --skip-verify             Skip typecheck and Android/WeChat build checks.
  --source-remote <name>    Business source remote (default: web-upstream).
  --source-branch <name>    Business source branch (default: agent).
  --remotes <a,b>           Mobile remotes (default: origin,farrran).
  --publish-branches <a,b>  Push HEAD to these branch names on every remote.

The script refuses dirty worktrees, unrelated histories, merge conflicts, and
non-fast-forward pushes. Business code comes from vue-pure-admin-max/agent;
native-app, platform adapters, and release tooling stay in this repository.`);
      exit(0);
    } else {
      fail(`Unknown option: ${arg}`);
    }
  }

  if (!options.targetRemotes.length) fail("At least one target remote is required");
  return options;
}

function hasRemote(name) {
  return output(["remote"]).split("\n").includes(name);
}

function hasRef(ref) {
  return (
    git(["show-ref", "--verify", "--quiet", ref], {
      allowFailure: true,
      capture: true
    }).status === 0
  );
}

function isAncestor(ancestor, descendant) {
  return (
    git(["merge-base", "--is-ancestor", ancestor, descendant], {
      allowFailure: true,
      capture: true
    }).status === 0
  );
}

function verifyBuilds() {
  const checks = [
    ["pnpm", ["typecheck"]],
    ["pnpm", ["build:app-h5"]],
    ["pnpm", ["sync:app-h5"]],
    ["pnpm", ["--dir", "native-app", "type-check"]],
    ["pnpm", ["--dir", "native-app", "build:app"]],
    ["pnpm", ["mini:build"]],
    ["pnpm", ["mini:smoke"]],
    ["pnpm", ["--ignore-workspace", "edgeone:build"]]
  ];

  for (const [command, args] of checks) {
    console.log(`[sync-web] verify: ${command} ${args.join(" ")}`);
    run(command, args);
  }
}

function preflightPushes(remotes, branches) {
  const targets = [];
  for (const remote of remotes) {
    for (const branch of branches) {
      const trackingRef = `refs/remotes/${remote}/${branch}`;
      if (hasRef(trackingRef) && !isAncestor(trackingRef, "HEAD")) {
        fail(
          `Refusing non-fast-forward push: ${remote}/${branch} is not an ancestor of HEAD`
        );
      }
      targets.push({ remote, branch });
    }
  }
  return targets;
}

const options = parseArgs(process.argv.slice(2));

try {
  const root = output(["rev-parse", "--show-toplevel"]);
  chdir(root);

  const currentBranch = output(["branch", "--show-current"]);
  if (!currentBranch) fail("Detached HEAD is not supported");

  const status = output(["status", "--porcelain"]);
  if (status) fail("Working tree must be clean before syncing");

  const requiredRemotes = [options.sourceRemote, ...options.targetRemotes];
  for (const remote of requiredRemotes) {
    if (!hasRemote(remote)) {
      fail(
        `Missing remote '${remote}'. Configure it before running the sync script.`
      );
    }
  }

  console.log(
    `[sync-web] source: ${options.sourceRemote}/${options.sourceBranch}`
  );
  git(["fetch", "--prune", options.sourceRemote, options.sourceBranch]);
  for (const remote of options.targetRemotes) {
    git(["fetch", "--prune", remote]);
  }

  const sourceRef = `${options.sourceRemote}/${options.sourceBranch}`;
  const sourceCommit = output(["rev-parse", sourceRef]);
  const sourceShort = output(["rev-parse", "--short=12", sourceCommit]);
  const mergeBase = git(["merge-base", "HEAD", sourceRef], {
    allowFailure: true,
    capture: true
  });
  if (mergeBase.status !== 0) {
    fail(
      `No shared history with ${sourceRef}. Complete the one-time integration merge first.`
    );
  }

  const pending = Number(output(["rev-list", "--count", `HEAD..${sourceRef}`]));
  console.log(`[sync-web] pending source commits: ${pending}`);

  if (options.dryRun) {
    if (pending > 0) {
      const preview = git(
        ["merge-tree", "--write-tree", "--name-only", "HEAD", sourceRef],
        { allowFailure: true, capture: true }
      );
      console.log(String(preview.stdout || preview.stderr || "").trim());
      if (preview.status !== 0) {
        fail("Dry-run detected merge conflicts", 2);
      }
    }
    console.log(`[sync-web] dry-run complete at ${sourceShort}`);
    exit(0);
  }

  let createdCommit = false;
  if (pending > 0) {
    const merge = git(
      [
        "merge",
        "--no-commit",
        "--no-ff",
        sourceRef,
        "-m",
        `chore: sync vue-pure-admin-max agent ${sourceShort}`
      ],
      { allowFailure: true }
    );
    if (merge.status !== 0) {
      const conflicts = output(["diff", "--name-only", "--diff-filter=U"]);
      git(["merge", "--abort"], { allowFailure: true });
      fail(`Merge conflicts require manual resolution:\n${conflicts}`, 2);
    }

    if (!options.skipVerify) verifyBuilds();
    git([
      "commit",
      "-m",
      `chore: sync vue-pure-admin-max agent ${sourceShort}`
    ]);
    createdCommit = true;
  } else if (!options.skipVerify) {
    verifyBuilds();
  }

  if (options.push) {
    const publishBranches = options.publishBranches.length
      ? options.publishBranches
      : [currentBranch];
    const targets = preflightPushes(options.targetRemotes, publishBranches);
    for (const { remote, branch } of targets) {
      console.log(`[sync-web] push: ${remote}/${branch}`);
      git(["push", remote, `HEAD:refs/heads/${branch}`]);
    }
  }

  console.log(
    `[sync-web] complete: ${sourceShort}${createdCommit ? " merged" : " already current"}`
  );
} catch (error) {
  fail(error instanceof Error ? error.message : String(error));
}
