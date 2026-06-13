function wait(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function appText() {
  return (document.querySelector("#app")?.innerText || "").replace(/\s+/g, " ");
}

function isVisible(node) {
  if (!node) return false;

  const rect = node.getBoundingClientRect();
  const style = window.getComputedStyle(node);
  const viewportWidth = window.visualViewport?.width || window.innerWidth;
  const viewportHeight = window.visualViewport?.height || window.innerHeight;
  const centerX = rect.left + rect.width / 2;
  const centerY = rect.top + rect.height / 2;

  return (
    rect.width > 12 &&
    rect.height > 12 &&
    centerX >= 0 &&
    centerY >= 0 &&
    centerX <= viewportWidth &&
    centerY <= viewportHeight &&
    style.display !== "none" &&
    style.visibility !== "hidden" &&
    style.opacity !== "0" &&
    !style.transform.includes("matrix(0")
  );
}

function hitTarget(node) {
  if (!isVisible(node)) return null;

  const rect = node.getBoundingClientRect();
  return document.elementFromPoint(
    rect.left + rect.width / 2,
    rect.top + rect.height / 2
  );
}

function isInteractable(node) {
  const target = hitTarget(node);
  return !!(
    target &&
    (target === node ||
      node.contains(target) ||
      target.closest?.("button") === node ||
      target.closest?.(".el-button") === node)
  );
}

function findButtonByText(label, root = document) {
  return [...root.querySelectorAll("button")].find(button =>
    button.textContent?.replace(/\s+/g, "").includes(label)
  );
}

async function waitFor(predicate, timeoutMs = 6000, stepMs = 200) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    const value = predicate();
    if (value) return value;
    await wait(stepMs);
  }
  return null;
}

const initialText = appText();
const examCenterVisible =
  initialText.includes("试题试卷中心") || initialText.includes("开始答题");
if (!examCenterVisible) {
  return {
    ok: false,
    reason: "student exam center did not render",
    initialText: initialText.slice(0, 800),
    href: location.href
  };
}

const startButton = findButtonByText("开始答题") || findButtonByText("开始补考");
if (!startButton) {
  return {
    ok: false,
    reason: "missing start exam button",
    initialText: initialText.slice(0, 900),
    href: location.href
  };
}

startButton.scrollIntoView({ block: "center", inline: "nearest" });
await wait(300);
const startInteractable = isInteractable(startButton);
if (!startInteractable) {
  return {
    ok: false,
    reason: "start exam button is not interactable",
    buttonText: startButton.textContent?.trim() || "",
    href: location.href
  };
}

startButton.dispatchEvent(
  new MouseEvent("click", { bubbles: true, cancelable: true, view: window })
);

const routed = await waitFor(
  () =>
    location.hash.includes("/student-exam-center/do/") &&
    appText().includes("答题卡") &&
    appText().includes("交卷"),
  9000
);

if (!routed) {
  return {
    ok: false,
    reason: "did not navigate to exam answering page",
    startInteractable,
    href: location.href,
    textAfterClick: appText().slice(0, 1000)
  };
}

const option = await waitFor(
  () => document.querySelector(".question-options .option-item"),
  5000
);
if (!option) {
  return {
    ok: false,
    reason: "answer page missing option item",
    startInteractable,
    href: location.href,
    answerPageText: appText().slice(0, 1000)
  };
}

option.scrollIntoView({ block: "center", inline: "nearest" });
await wait(300);
const optionInteractable = isInteractable(option);
if (!optionInteractable) {
  return {
    ok: false,
    reason: "answer option is not interactable",
    startInteractable,
    href: location.href,
    optionText: option.textContent?.trim() || ""
  };
}

option.dispatchEvent(
  new MouseEvent("click", { bubbles: true, cancelable: true, view: window })
);
await wait(800);

const after = appText();
const selected = !!document.querySelector(".question-options .option-item.is-checked");
const answered = /已答\s*1\s*题/.test(after) || /已答\s*1/.test(after);
const navAnswered = !!document.querySelector(".question-nav .nav-item.answered");

return {
  ok:
    startInteractable &&
    location.hash.includes("/student-exam-center/do/") &&
    optionInteractable &&
    selected &&
    answered &&
    navAnswered,
  href: location.href,
  startInteractable,
  optionInteractable,
  selected,
  answered,
  navAnswered,
  optionText: option.textContent?.trim() || "",
  beforeText: initialText.slice(0, 700),
  afterText: after.slice(0, 900)
};
