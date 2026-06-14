function wait(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function waitFor(predicate, timeoutMs = 10000) {
  const startedAt = Date.now();
  while (Date.now() - startedAt < timeoutMs) {
    const value = predicate();
    if (value) return value;
    await wait(180);
  }
  return null;
}

function rectOf(node) {
  if (!node) return null;
  const rect = node.getBoundingClientRect();
  return {
    left: Math.round(rect.left),
    top: Math.round(rect.top),
    right: Math.round(rect.right),
    bottom: Math.round(rect.bottom),
    width: Math.round(rect.width),
    height: Math.round(rect.height)
  };
}

function isVisible(node) {
  if (!node) return false;
  const rect = node.getBoundingClientRect();
  const style = getComputedStyle(node);
  const viewportWidth = visualViewport?.width || innerWidth;
  const viewportHeight = visualViewport?.height || innerHeight;
  const centerX = rect.left + rect.width / 2;
  const centerY = rect.top + rect.height / 2;
  return (
    rect.width > 24 &&
    rect.height > 24 &&
    centerX >= 0 &&
    centerY >= 0 &&
    centerX <= viewportWidth &&
    centerY <= viewportHeight &&
    style.display !== "none" &&
    style.visibility !== "hidden" &&
    Number.parseFloat(style.opacity || "1") > 0.05
  );
}

function compactText(node = document.body) {
  return (node?.innerText || node?.textContent || "")
    .replace(/\s+/g, " ")
    .trim();
}

await wait(1800);

const iframe = await waitFor(() =>
  document.querySelector(".virtual-human-panel iframe")
);
const iframeDocument = await waitFor(() => {
  try {
    return iframe?.contentDocument?.readyState === "complete"
      ? iframe.contentDocument
      : null;
  } catch (_) {
    return null;
  }
});

const state = await waitFor(() => {
  try {
    return iframe?.contentWindow?.__virtualPeopleState?.vrm
      ? iframe.contentWindow.__virtualPeopleState
      : null;
  } catch (_) {
    return null;
  }
}, 12000);

const canvas = iframeDocument?.querySelector("#canvas");
const statusText = iframeDocument?.querySelector("#statusText");
const currentTitle = iframeDocument?.querySelector("#currentTitle");
const currentMeta = iframeDocument?.querySelector("#currentMeta");
const errorFallback = [
  ...document.querySelectorAll(".virtual-human-panel h4")
].find(node => compactText(node).includes("数字人资源加载失败"));
const navItems = [...document.querySelectorAll(".nav-mobile-item")];
const aiNavItem = navItems.find(item => compactText(item).includes("AI App"));

const canvasRect = rectOf(canvas);
const iframeRect = rectOf(iframe);
const stateLoaded = !!state?.vrm && Array.isArray(state?.motionList);
const statusOk =
  compactText(statusText).includes("VRM 已加载") ||
  compactText(statusText).includes("当前动作");
const titleOk =
  compactText(currentTitle).includes("VRM 已加载") ||
  compactText(currentMeta).includes("动作总数") ||
  compactText(currentMeta).includes("sitting_idle");
const canvasVisible =
  !!canvas && !!canvasRect && canvasRect.width > 80 && canvasRect.height > 80;
const panelErrorVisible = isVisible(errorFallback);
const aiNavIconVisible = !!aiNavItem?.querySelector("svg");

return {
  ok:
    !!iframe &&
    !!iframeDocument &&
    stateLoaded &&
    canvasVisible &&
    statusOk &&
    titleOk &&
    !panelErrorVisible &&
    aiNavIconVisible,
  href: location.href,
  iframeRect,
  canvasRect,
  iframeReadyState: iframeDocument?.readyState || "",
  stateLoaded,
  motionCount: state?.motionList?.length || 0,
  currentMotion:
    state?.currentMotion?.fileName || state?.currentMotionName || "",
  statusText: compactText(statusText),
  currentTitle: compactText(currentTitle),
  currentMeta: compactText(currentMeta),
  canvasVisible,
  panelErrorVisible,
  aiNavIconVisible,
  appText: compactText().slice(0, 1000)
};
