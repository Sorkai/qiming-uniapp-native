function wait(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
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
    Number.parseFloat(style.opacity || "1") > 0.05
  );
}

async function waitFor(predicate, timeoutMs = 7000) {
  const startedAt = Date.now();
  while (Date.now() - startedAt < timeoutMs) {
    const value = predicate();
    if (value) return value;
    await wait(150);
  }
  return null;
}

function compactText() {
  return (document.querySelector("#app")?.innerText || "")
    .replace(/\s+/g, " ")
    .trim();
}

function cssPixelVar(name) {
  const parsed = Number.parseFloat(
    window
      .getComputedStyle(document.documentElement)
      .getPropertyValue(name)
      .trim()
  );
  return Number.isFinite(parsed) ? parsed : 0;
}

function scrollHost() {
  const candidates = [
    "#app",
    ".main-container > .el-scrollbar > .el-scrollbar__wrap",
    ".app-main > .el-scrollbar > .el-scrollbar__wrap",
    ".left-main",
    ".study-container"
  ];
  return candidates
    .map(selector => document.querySelector(selector))
    .find(node => node && node.scrollHeight > node.clientHeight + 12);
}

await wait(1600);

const courseLearnItem =
  [...document.querySelectorAll(".layout-sidebar .item")].find(item =>
    item.textContent?.replace(/\s+/g, "").includes("课程学习")
  ) || null;
courseLearnItem?.dispatchEvent(
  new MouseEvent("click", { bubbles: true, cancelable: true, view: window })
);

await waitFor(() => compactText().includes("章节目录"), 7000);
await wait(600);

const host = scrollHost();
if (host) {
  host.scrollTop = 0;
}
document.documentElement.scrollTop = 0;
document.body.scrollTop = 0;
window.scrollTo({ left: 0, top: 0 });
await wait(350);

const viewportHeight = window.visualViewport?.height || window.innerHeight;
const safeBottom = cssPixelVar("--pure-safe-area-bottom");
const mobileGap = window
  .getComputedStyle(document.documentElement)
  .getPropertyValue("--pure-mobile-content-bottom-gap")
  .trim();

const sidebar = document.querySelector(".layout-sidebar");
const videoSection = document.querySelector(".video-section");
const topCard =
  document.querySelector(".video-section") ||
  document.querySelector(".glass-card") ||
  sidebar;
const sidebarStyle = sidebar ? window.getComputedStyle(sidebar) : null;
const videoStyle = videoSection ? window.getComputedStyle(videoSection) : null;

const topShadowSoft =
  !sidebarStyle ||
  !/rgba?\(/.test(sidebarStyle.boxShadow) ||
  !["0.2)", "20%", "32px", "40px"].some(token =>
    sidebarStyle.boxShadow.includes(token)
  );
const videoShadowSoft =
  !videoStyle ||
  !/rgba?\(/.test(videoStyle.boxShadow) ||
  !["0.2)", "20%", "32px", "40px"].some(token =>
    videoStyle.boxShadow.includes(token)
  );

if (host) {
  host.scrollTop = host.scrollHeight;
  await wait(500);
}

const visibleBlocks = [...document.querySelectorAll("body *")]
  .filter(node => {
    const rect = node.getBoundingClientRect();
    if (rect.width < 8 || rect.height < 8) return false;
    const style = window.getComputedStyle(node);
    if (
      style.display === "none" ||
      style.visibility === "hidden" ||
      Number.parseFloat(style.opacity || "1") <= 0.05
    ) {
      return false;
    }
    return rect.top < viewportHeight && rect.bottom > 0;
  })
  .map(node => ({
    className: node.className || node.tagName,
    rect: rectOf(node),
    text: (node.textContent || "").replace(/\s+/g, " ").trim().slice(0, 80)
  }));

const bottomContent = visibleBlocks
  .filter(item => item.rect.bottom <= viewportHeight - 1)
  .sort((a, b) => b.rect.bottom - a.rect.bottom)[0];
const blankBelowLastContent = bottomContent
  ? Math.round(viewportHeight - bottomContent.rect.bottom)
  : viewportHeight;
const allowedBottomBlank = Math.round(Math.max(44, safeBottom + 74));
const horizontalOverflow = Math.max(
  0,
  Math.max(document.documentElement.scrollWidth, document.body.scrollWidth) -
    (window.visualViewport?.width || window.innerWidth)
);

return {
  ok:
    !!courseLearnItem &&
    compactText().includes("章节目录") &&
    !!host &&
    blankBelowLastContent <= allowedBottomBlank &&
    topShadowSoft &&
    videoShadowSoft &&
    horizontalOverflow <= 4,
  href: location.href,
  hasCourseLearnItem: !!courseLearnItem,
  hasHost: !!host,
  hostClassName: host?.className || "",
  hostScrollTop: host ? Math.round(host.scrollTop) : 0,
  hostScrollHeight: host ? Math.round(host.scrollHeight) : 0,
  hostClientHeight: host ? Math.round(host.clientHeight) : 0,
  viewportHeight: Math.round(viewportHeight),
  safeBottom,
  mobileGap,
  allowedBottomBlank,
  blankBelowLastContent,
  bottomContent,
  sidebarRect: rectOf(sidebar),
  sidebarBoxShadow: sidebarStyle?.boxShadow || "",
  topShadowSoft,
  topCardRect: rectOf(topCard),
  videoSectionRect: rectOf(videoSection),
  videoBoxShadow: videoStyle?.boxShadow || "",
  videoShadowSoft,
  horizontalOverflow,
  text: compactText().slice(0, 1400)
};
