function wait(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function waitFor(predicate, timeoutMs = 7000) {
  const startedAt = Date.now();
  while (Date.now() - startedAt < timeoutMs) {
    const value = predicate();
    if (value) return value;
    await wait(160);
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

function compactText(node = document.body) {
  return (node.innerText || "").replace(/\s+/g, " ").trim();
}

function clickCourseMenu(label) {
  const item = [...document.querySelectorAll(".layout-sidebar .item")].find(
    node => compactText(node).includes(label)
  );
  item?.dispatchEvent(
    new MouseEvent("click", { bubbles: true, cancelable: true, view: window })
  );
  return item || null;
}

function scrollHost() {
  const appRoot = document.getElementById("app");
  if (appRoot && appRoot.scrollHeight > appRoot.clientHeight + 12) {
    return appRoot;
  }

  const candidates = [
    ".main-container > .el-scrollbar > .el-scrollbar__wrap",
    ".app-main > .el-scrollbar > .el-scrollbar__wrap",
    ".left-main",
    ".message-board-container",
    ".study-container"
  ];
  return candidates
    .map(selector => document.querySelector(selector))
    .find(node => node && node.scrollHeight > node.clientHeight + 12);
}

function setScrollTop(node, top) {
  if (!node) return;
  node.scrollTop = top;
  node.dispatchEvent(new Event("scroll", { bubbles: true }));
}

await wait(2200);

const courseLearnItem = clickCourseMenu("课程学习");
await waitFor(() => compactText().includes("章节目录"), 8000);
await wait(800);

const catalogWrap = document.querySelector(
  ".chapter-catalog .el-scrollbar__wrap"
);
const catalogBefore = catalogWrap
  ? {
      scrollTop: Math.round(catalogWrap.scrollTop),
      scrollHeight: Math.round(catalogWrap.scrollHeight),
      clientHeight: Math.round(catalogWrap.clientHeight),
      rect: rectOf(catalogWrap)
    }
  : null;

if (catalogWrap) {
  setScrollTop(catalogWrap, Math.max(0, catalogWrap.scrollHeight));
  await wait(450);
}

const catalogAfter = catalogWrap
  ? {
      scrollTop: Math.round(catalogWrap.scrollTop),
      scrollHeight: Math.round(catalogWrap.scrollHeight),
      clientHeight: Math.round(catalogWrap.clientHeight),
      rect: rectOf(catalogWrap)
    }
  : null;

const host = scrollHost();
if (host) {
  setScrollTop(host, 0);
  window.scrollTo({ left: 0, top: 0 });
  document.documentElement.scrollTop = 0;
  document.body.scrollTop = 0;
  await wait(250);
  setScrollTop(host, 280);
  await wait(650);
}

const sidebarAfterScroll = document.querySelector("#layout-sidebar");
const sidebarCollapsed =
  sidebarAfterScroll?.classList.contains("mobile-collapsed") || false;

const mobileToggle = document.querySelector(".mobile-sidebar-toggle");
if (sidebarCollapsed && mobileToggle) {
  mobileToggle.dispatchEvent(
    new MouseEvent("click", { bubbles: true, cancelable: true, view: window })
  );
  await waitFor(
    () =>
      !document
        .querySelector("#layout-sidebar")
        ?.classList.contains("mobile-collapsed"),
    3000
  );
}

if (host) {
  setScrollTop(host, 0);
  await wait(400);
}

const qaItem = clickCourseMenu("课程问答");
await waitFor(() => compactText().includes("课程讨论区"), 8000);
await wait(1200);

const header = document.querySelector(".layout-header");
const courseTabs = document.querySelector("#layout-sidebar");
const qaContainer = document.querySelector(".message-board-container");
const qaToolbar = document.querySelector(".board-toolbar");
const qaFirstCard =
  document.querySelector(".message-card") ||
  document.querySelector(".empty-state");

const headerRect = rectOf(header);
const tabsRect = rectOf(courseTabs);
const qaContainerRect = rectOf(qaContainer);
const qaToolbarRect = rectOf(qaToolbar);
const qaFirstCardRect = rectOf(qaFirstCard);
const qaSafeTop = Math.max(headerRect?.bottom || 0, tabsRect?.bottom || 0);
const qaContentTop = qaToolbarRect?.top ?? qaFirstCardRect?.top ?? 0;
const qaClearsTopBars = qaContentTop >= qaSafeTop + 8;

const catalogScrollable =
  !!catalogBefore &&
  !!catalogAfter &&
  catalogBefore.scrollHeight > catalogBefore.clientHeight + 8 &&
  catalogAfter.scrollTop > catalogBefore.scrollTop + 16;

return {
  ok:
    !!courseLearnItem &&
    !!qaItem &&
    catalogScrollable &&
    sidebarCollapsed &&
    qaClearsTopBars,
  href: location.href,
  text: compactText().slice(0, 1200),
  catalogScrollable,
  catalogBefore,
  catalogAfter,
  scrollHost: host
    ? {
        tag: host.tagName,
        id: host.id || "",
        className: String(host.className || ""),
        scrollTop: Math.round(host.scrollTop),
        scrollHeight: Math.round(host.scrollHeight),
        clientHeight: Math.round(host.clientHeight)
      }
    : null,
  sidebarCollapsed,
  sidebarClass: sidebarAfterScroll?.className || "",
  headerRect,
  tabsRect,
  qaContainerRect,
  qaToolbarRect,
  qaFirstCardRect,
  qaSafeTop,
  qaContentTop,
  qaClearsTopBars
};
