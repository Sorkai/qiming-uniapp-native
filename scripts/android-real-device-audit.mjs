#!/usr/bin/env node

import { spawnSync } from "node:child_process";
import { mkdirSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(fileURLToPath(new URL("..", import.meta.url)));
const routeSource = join(root, "scripts", "wechat-real-session-audit.mjs");
const routeAudit = join(root, "scripts", "android-webview-audit.mjs");
const argv = process.argv.slice(2);

function printUsage() {
  process.stdout.write(
    `Usage: node scripts/android-real-device-audit.mjs [options]\n\nOptions:\n  --role <student|teacher|admin>  Audit one role from the shared matrix\n  --route, --only <name>          Audit one named route\n  --from-route <name>             Resume inclusively from one matrix route\n  --serial <adb-serial>            Target one Android device\n  --api-origin <url>              API origin used for real login/fixtures\n  --wait-ms <ms>                  Per-route navigation wait\n  --min-content-ratio <ratio>     Minimum main-content/viewport width ratio\n  --min-usable-content-ratio <r>  Minimum width after route-root padding\n  --max-routes <count>            Limit routes after all other filters\n  --out-dir <path>                Artifact output directory\n  --list                          List selected routes and exit\n  --list-json                     Print selected route definitions as JSON\n  --self-test                     Validate the shared matrix without a device\n  -h, --help                      Show this help and exit\n`
  );
  process.stdout.write(
    "  --package <application-id>       Android package owning the WebView\n"
  );
}

if (argv.includes("-h") || argv.includes("--help")) {
  printUsage();
  process.exit(0);
}

function readArg(name, fallback = "") {
  const index = argv.indexOf(name);
  return index >= 0 && argv[index + 1] ? argv[index + 1] : fallback;
}

const roleFilter = readArg("--role");
const routeFilter = readArg("--route") || readArg("--only");
const fromRoute = readArg("--from-route");
const serial = readArg("--serial");
const packageName = readArg(
  "--package",
  process.env.QIMING_ANDROID_PACKAGE || "io.dcloud.HBuilder"
);
const apiOrigin = readArg(
  "--api-origin",
  process.env.VITE_API_URL || "https://aiedu-api.intelledu.cn"
);
const waitMs = Number(readArg("--wait-ms", "4500"));
const minContentRatio = readArg("--min-content-ratio", "0.88");
const minUsableContentRatio = readArg("--min-usable-content-ratio", "0.92");
const maxRoutes = Number(readArg("--max-routes", "0"));
const listOnly = argv.includes("--list");
const listJson = argv.includes("--list-json");
const selfTest = argv.includes("--self-test");
const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
const outDir = resolve(
  readArg(
    "--out-dir",
    join(root, "artifacts", "android", `real-device-audit-${timestamp}`)
  )
);

const accounts = {
  student: {
    mobile: process.env.QIMING_AUDIT_STUDENT_MOBILE || "13111111112",
    password: process.env.QIMING_AUDIT_STUDENT_PASSWORD || "123456"
  }
};

if (roleFilter && !["student", "teacher", "admin"].includes(roleFilter)) {
  throw new Error(`Unsupported --role value: ${roleFilter}`);
}
if (!Number.isFinite(waitMs) || waitMs < 0 || waitMs > 120_000) {
  throw new Error(`Unsupported --wait-ms value: ${waitMs}`);
}
if (!Number.isInteger(maxRoutes) || maxRoutes < 0) {
  throw new Error(`Unsupported --max-routes value: ${maxRoutes}`);
}
if (!/^[A-Za-z][A-Za-z0-9_]*(?:\.[A-Za-z][A-Za-z0-9_]*)+$/.test(packageName)) {
  throw new Error(`Unsupported --package value: ${packageName}`);
}

function runNode(script, args, options = {}) {
  return spawnSync(process.execPath, [script, ...args], {
    cwd: root,
    encoding: "utf8",
    maxBuffer: 20 * 1024 * 1024,
    ...options
  });
}

function legacyEnvironmentInterruption(message) {
  const text = String(message || "");
  const patterns = [
    [
      "device-unavailable",
      /(?:no devices\/emulators found|device .* not found|device offline|device unauthorized|adb server.*(?:failed|not running)|cannot connect to daemon)/i
    ],
    [
      "android-runtime-stopped",
      /(?:Android runtime is not running|Command failed:.*\bpidof\b)/i
    ],
    [
      "webview-devtools-unavailable",
      /(?:Unable to list WebView targets|No WebView page matched|ECONNREFUSED|fetch failed)/i
    ],
    [
      "cdp-connection-lost",
      /(?:Timed out connecting to|Failed to connect to|CDP WebSocket (?:closed|failed)|WebSocket.*(?:closed|not open)|(?:Runtime|Network)\.(?:enable|evaluate|getResponseBody) timed out|Inspected target.*(?:closed|navigated)|Session closed)/i
    ]
  ];
  const matched = patterns.find(([, pattern]) => pattern.test(text));
  return matched ? { code: matched[0], message: text } : null;
}

function parseAuditExecution(auditResult) {
  let report = null;
  let parseError = "";
  try {
    report = JSON.parse(auditResult.stdout);
  } catch (error) {
    parseError = error instanceof Error ? error.message : String(error);
  }

  if (report?.auditStatus === "environment-interrupted" && report.environment) {
    return {
      auditResult,
      report,
      parseError,
      interruption: {
        kind: "environment-interrupted",
        ...report.environment
      }
    };
  }
  if (report?.auditStatus === "runner-error") {
    return {
      auditResult,
      report,
      parseError,
      interruption: {
        kind: "runner-error",
        code: "audit-runner-error",
        message: report.error?.message || "Android audit runner failed"
      }
    };
  }
  if (report) return { auditResult, report, parseError, interruption: null };

  const details = [parseError, auditResult.stderr, auditResult.stdout]
    .filter(Boolean)
    .join("; ");
  const environment = legacyEnvironmentInterruption(details);
  return {
    auditResult,
    report: null,
    parseError,
    interruption: environment
      ? { kind: "environment-interrupted", ...environment }
      : {
          kind: "runner-error",
          code: "audit-output-unavailable",
          message: details || `audit child exited ${auditResult.status}`
        }
  };
}

async function fetchJson(url, init = {}) {
  const response = await fetch(url, init);
  const body = await response.text();
  let parsed;
  try {
    parsed = JSON.parse(body);
  } catch {
    throw new Error(`${url} returned non-JSON: ${body.slice(0, 180)}`);
  }
  if (!response.ok) {
    throw new Error(`${url} failed with HTTP ${response.status}: ${body}`);
  }
  return parsed;
}

async function resolveStudentCourseFixture() {
  const login = await fetchJson(
    `${new URL(apiOrigin).origin}/edu/v1/user/login`,
    {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(accounts.student)
    }
  );
  if (Number(login?.code) !== 200 || !login?.data?.accessToken) {
    throw new Error(
      `Student fixture login failed: ${login?.msg || login?.code}`
    );
  }
  const courseList = await fetchJson(
    `${new URL(apiOrigin).origin}/edu/frontend/v1/course/list?pageNum=1&pageSize=20`,
    { headers: { authorization: `Bearer ${login.data.accessToken}` } }
  );
  if (Number(courseList?.code) !== 200 && courseList?.code !== undefined) {
    throw new Error(
      `Student course fixture failed: ${courseList?.msg || courseList?.code}`
    );
  }
  const course = courseList?.data?.list?.find(
    item => Number(item?.courseId) > 0
  );
  if (!course?.courseId) {
    throw new Error(
      "Student account has no real course fixture for route audit"
    );
  }
  return Number(course.courseId);
}

function selectAuditRoutes(
  matrix,
  { role = "", route = "", from = "", limit = 0 } = {}
) {
  if (route && from) {
    throw new Error("--route/--only cannot be combined with --from-route");
  }
  if (route && !matrix.some(item => item.name === route)) {
    throw new Error(`Unknown --route value: ${route}`);
  }
  if (from && !matrix.some(item => item.name === from)) {
    throw new Error(`Unknown --from-route value: ${from}`);
  }

  let selected = role ? matrix.filter(item => item.role === role) : [...matrix];
  if (route) {
    selected = selected.filter(item => item.name === route);
    if (selected.length === 0) {
      throw new Error(`Route ${route} is outside the selected ${role} role`);
    }
  }
  if (from) {
    const resumeIndex = selected.findIndex(item => item.name === from);
    if (resumeIndex < 0) {
      throw new Error(`Route ${from} is outside the selected ${role} role`);
    }
    selected = selected.slice(resumeIndex);
  }
  return limit > 0 ? selected.slice(0, limit) : selected;
}

function expectsCompactDigitalHuman(entry) {
  const pathname = new URL(entry, "https://qiming.local").pathname;
  return new Set(["/account/ai-app", "/ai-app/chat", "/ai-app/workspace"]).has(
    pathname
  );
}

const routeResult = runNode(routeSource, ["--list-json"]);
if (routeResult.status !== 0) {
  throw new Error(
    `Unable to read route matrix: ${(routeResult.stderr || routeResult.stdout).trim()}`
  );
}

const matrixRoutes = JSON.parse(routeResult.stdout);
const routes = selectAuditRoutes(matrixRoutes, {
  role: roleFilter,
  route: routeFilter,
  from: fromRoute,
  limit: maxRoutes
});
if (routes.length === 0) throw new Error("No Android audit routes selected");

if (selfTest) {
  const failures = [];
  const names = matrixRoutes.map(route => route.name);
  if (new Set(names).size !== names.length)
    failures.push("duplicate route names");
  for (const role of ["student", "teacher", "admin"]) {
    if (!matrixRoutes.some(route => route.role === role)) {
      failures.push(`missing ${role} routes`);
    }
  }
  for (const route of matrixRoutes.filter(item => item.requiresCourse)) {
    if (
      route.role !== "student" ||
      !/^\/course\/1(?=([?#]|$))/.test(route.entry)
    ) {
      failures.push(`invalid course fixture route: ${route.name}`);
      continue;
    }
    const resolvedEntry = route.entry.replace(
      /\/course\/1(?=\?|$)/,
      "/course/37"
    );
    if (
      new URL(resolvedEntry, "https://qiming.local").pathname !== "/course/37"
    ) {
      failures.push(`invalid resolved course path: ${route.name}`);
    }
  }
  for (const route of matrixRoutes.filter(item => item.accountMenuText)) {
    if (!route.entry.startsWith("/account?menu=")) {
      failures.push(`invalid account menu route: ${route.name}`);
    }
  }
  for (const route of matrixRoutes.filter(item => item.requiredRequestPath)) {
    if (!route.requiredRequestPath.startsWith("/")) {
      failures.push(`invalid required request path: ${route.name}`);
    }
  }
  for (const route of matrixRoutes.filter(item => !item.expectedForbidden)) {
    const visibleExpectations = [
      ...(route.expect || []),
      ...(route.readyExpect || [])
    ].filter(Boolean);
    if (visibleExpectations.length === 0) {
      failures.push(`visible page expectation missing: ${route.name}`);
    }
  }
  const cloudRequirements = [
    "student-account-cloud-disk",
    "teacher-cloud-disk",
    "admin-online-disk"
  ];
  for (const name of cloudRequirements) {
    const route = matrixRoutes.find(item => item.name === name);
    if (route?.requiredRequestPath !== "/edu/backend/v1/user/file/list") {
      failures.push(`cloud API evidence missing: ${name}`);
    }
  }
  const childSelfTest = runNode(routeAudit, ["--self-test"]);
  if (childSelfTest.status !== 0) {
    failures.push(
      `android webview self-test failed: ${(childSelfTest.stderr || childSelfTest.stdout).trim()}`
    );
  }
  const executionCases = [
    {
      name: "structured environment interruption",
      result: {
        status: 2,
        stdout: JSON.stringify({
          auditStatus: "environment-interrupted",
          environment: { code: "cdp-connection-lost", message: "closed" }
        }),
        stderr: ""
      },
      kind: "environment-interrupted"
    },
    {
      name: "legacy CDP timeout",
      result: {
        status: 1,
        stdout: "",
        stderr: "Error: Runtime.enable timed out"
      },
      kind: "environment-interrupted"
    },
    {
      name: "unstructured runner failure",
      result: { status: 1, stdout: "", stderr: "SyntaxError: broken" },
      kind: "runner-error"
    },
    {
      name: "normal audit report",
      result: { status: 0, stdout: '{"session":{}}', stderr: "" },
      kind: null
    }
  ];
  for (const executionCase of executionCases) {
    const execution = parseAuditExecution(executionCase.result);
    const actualKind = execution.interruption?.kind || null;
    if (actualKind !== executionCase.kind) {
      failures.push(
        `${executionCase.name}: expected ${executionCase.kind}, got ${actualKind}`
      );
    }
  }
  const selectionMatrix = [
    { name: "student-a", role: "student" },
    { name: "teacher-a", role: "teacher" },
    { name: "teacher-b", role: "teacher" },
    { name: "student-b", role: "student" }
  ];
  const resumed = selectAuditRoutes(selectionMatrix, { from: "teacher-a" });
  if (
    resumed.map(item => item.name).join(",") !== "teacher-a,teacher-b,student-b"
  ) {
    failures.push("--from-route is not inclusive or does not preserve order");
  }
  const filteredResume = selectAuditRoutes(selectionMatrix, {
    role: "teacher",
    from: "teacher-b",
    limit: 1
  });
  if (filteredResume.map(item => item.name).join(",") !== "teacher-b") {
    failures.push("role/from-route/max-routes filter order is invalid");
  }
  for (const [name, options, expectedMessage] of [
    ["unknown", { from: "missing" }, "Unknown --from-route"],
    [
      "role mismatch",
      { role: "student", from: "teacher-a" },
      "outside the selected student role"
    ],
    [
      "conflicting filters",
      { route: "student-a", from: "student-a" },
      "cannot be combined"
    ]
  ]) {
    try {
      selectAuditRoutes(selectionMatrix, options);
      failures.push(`${name} selection did not throw`);
    } catch (error) {
      if (!String(error).includes(expectedMessage)) {
        failures.push(`${name} selection error was not actionable: ${error}`);
      }
    }
  }
  if (failures.length)
    throw new Error(`Matrix self-test failed: ${failures.join("; ")}`);
  process.stdout.write(
    `${JSON.stringify(
      {
        ok: true,
        routes: matrixRoutes.length,
        roles: Object.fromEntries(
          ["student", "teacher", "admin"].map(role => [
            role,
            matrixRoutes.filter(route => route.role === role).length
          ])
        ),
        courseFixtures: matrixRoutes.filter(route => route.requiresCourse)
          .length,
        requiredResponses: matrixRoutes.filter(
          route => route.requiredRequestPath
        ).length,
        resumePolicyAssertions: 5,
        child: childSelfTest.stdout.trim()
      },
      null,
      2
    )}\n`
  );
  process.exit(0);
}

if (listOnly) {
  routes.forEach(route => {
    process.stdout.write(
      `${route.role.padEnd(7)} ${route.name} ${route.entry}\n`
    );
  });
  process.exit(0);
}
if (listJson) {
  process.stdout.write(`${JSON.stringify(routes, null, 2)}\n`);
  process.exit(0);
}

mkdirSync(outDir, { recursive: true });
const studentCourseId = routes.some(route => route.requiresCourse)
  ? await resolveStudentCourseFixture()
  : 0;
const expectedRole = {
  student: { roleType: 1, mobile: "13111111112" },
  teacher: { roleType: 2, mobile: "13111111113" },
  admin: { roleType: 3, mobile: "13111111111" }
};
const results = [];
let activeRole = "";
let terminalInterruption = null;

for (const [routeIndex, route] of routes.entries()) {
  const routeEntry = route.requiresCourse
    ? route.entry.replace(/\/course\/1(?=\?|$)/, `/course/${studentCourseId}`)
    : route.entry;
  const expected =
    route.expect?.find(Boolean) || route.readyExpect?.find(Boolean) || "";
  const reportPath = join(outDir, `${route.name}.json`);
  const commandArgs = [
    "--strict",
    "--entry",
    routeEntry,
    "--wait-ms",
    String(waitMs),
    "--min-content-ratio",
    minContentRatio,
    "--min-usable-content-ratio",
    minUsableContentRatio,
    "--api-origin",
    apiOrigin,
    "--out",
    reportPath
  ];
  if (serial) commandArgs.push("--serial", serial);
  commandArgs.push("--package", packageName);
  if (expected) commandArgs.push("--expect-text", expected);
  if (route.accountMenuText) {
    commandArgs.push("--account-menu-text", route.accountMenuText);
  }
  if (route.expectedForbidden) commandArgs.push("--expect-forbidden");
  const readyExpected = route.readyExpect?.find(Boolean) || "";
  if (readyExpected && route.action) {
    commandArgs.push("--ready-expect-text", readyExpected);
  }
  if (route.action) {
    commandArgs.push(
      "--action-selector",
      route.action.selector,
      "--action-text",
      route.action.text,
      "--post-action-wait-ms",
      String(route.postActionWaitMs || 2000)
    );
  }
  if (route.requiredRequestPath) {
    commandArgs.push("--required-request-path", route.requiredRequestPath);
  }
  if (expectsCompactDigitalHuman(routeEntry)) {
    commandArgs.push("--expect-compact-digital-human");
  }
  if (activeRole !== route.role) {
    commandArgs.push("--role", route.role);
  }

  const execution = parseAuditExecution(runNode(routeAudit, commandArgs));

  if (execution.interruption?.kind === "environment-interrupted") {
    terminalInterruption = {
      ...execution.interruption,
      route: route.name,
      routeIndex,
      reason: execution.interruption.message
    };
  } else if (execution.interruption?.kind === "runner-error") {
    terminalInterruption = {
      ...execution.interruption,
      route: route.name,
      routeIndex,
      reason: execution.interruption.message
    };
  }

  if (terminalInterruption) {
    results.push({
      role: route.role,
      name: route.name,
      entry: route.entry,
      resolvedEntry: routeEntry,
      expectedText: expected,
      status: terminalInterruption.kind,
      ok: false,
      failures: [],
      reportPath,
      report: execution.report,
      interruption: terminalInterruption
    });
    process.stdout.write(
      `[INTERRUPTED] ${route.role.padEnd(7)} ${route.name}: ${terminalInterruption.code} ${String(terminalInterruption.reason).replace(/\s+/g, " ")}\n`
    );
    break;
  }

  const { auditResult, report } = execution;

  const roleExpectation = expectedRole[route.role];
  const roleMatches =
    report?.session?.roleType === roleExpectation.roleType &&
    report?.session?.username === roleExpectation.mobile &&
    report?.session?.roles?.length === 1 &&
    report.session.roles[0] === route.role;
  const failures = [...(report?.strict?.failures || [])];
  if (!roleMatches) {
    failures.push(
      `role mismatch: ${report?.session?.username || "none"}/${report?.session?.roleType || 0}/${report?.session?.roles?.join("+") || "none"}`
    );
  }
  const result = {
    role: route.role,
    name: route.name,
    entry: route.entry,
    resolvedEntry: routeEntry,
    expectedText: expected,
    status:
      auditResult.status === 0 && failures.length === 0 ? "passed" : "failed",
    ok: auditResult.status === 0 && failures.length === 0,
    failures,
    reportPath,
    report
  };
  results.push(result);
  if (roleMatches) activeRole = route.role;

  process.stdout.write(
    `[${result.ok ? "OK" : "FAIL"}] ${route.role.padEnd(7)} ${route.name.padEnd(34)} width=${report?.mainContentWidthRatio ?? "?"} usable=${report?.mainContentUsableWidthRatio ?? "?"} overflow=${report?.document?.overflowX ?? "?"} ${failures.join(", ")}\n`
  );
}

const summary = {
  generatedAt: new Date().toISOString(),
  deviceSerial: serial || "default",
  androidPackage: packageName,
  apiOrigin: new URL(apiOrigin).origin,
  waitMs,
  minContentRatio: Number(minContentRatio),
  minUsableContentRatio: Number(minUsableContentRatio),
  fromRoute: fromRoute || null,
  status: terminalInterruption
    ? terminalInterruption.kind
    : results.some(result => result.status === "failed")
      ? "failed"
      : "passed",
  totals: {
    routes: routes.length,
    completed: results.filter(result =>
      ["passed", "failed"].includes(result.status)
    ).length,
    ok: results.filter(result => result.status === "passed").length,
    fail: results.filter(result => result.status === "failed").length,
    environmentInterrupted: results.filter(
      result => result.status === "environment-interrupted"
    ).length,
    runnerError: results.filter(result => result.status === "runner-error")
      .length,
    notRun: routes.length - results.length
  },
  interruption: terminalInterruption,
  notRunRoutes: terminalInterruption
    ? routes.slice(terminalInterruption.routeIndex + 1).map(route => ({
        role: route.role,
        name: route.name,
        entry: route.entry,
        reason: "matrix stopped after audit execution interruption"
      }))
    : [],
  results
};
const summaryPath = join(outDir, "summary.json");
writeFileSync(summaryPath, `${JSON.stringify(summary, null, 2)}\n`, "utf8");
process.stdout.write(`Summary written: ${summaryPath}\n`);
if (terminalInterruption?.kind === "environment-interrupted")
  process.exitCode = 2;
else if (terminalInterruption?.kind === "runner-error") process.exitCode = 3;
else if (summary.totals.fail > 0) process.exitCode = 1;
