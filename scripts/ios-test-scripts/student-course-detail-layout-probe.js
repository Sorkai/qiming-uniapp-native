function wait(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function rectOf(selector) {
  const node = document.querySelector(selector);
  if (!node) return null;
  const rect = node.getBoundingClientRect();
  const style = window.getComputedStyle(node);
  return {
    selector,
    tag: node.tagName,
    className: String(node.className || ""),
    display: style.display,
    position: style.position,
    overflowX: style.overflowX,
    overflowY: style.overflowY,
    widthStyle: style.width,
    heightStyle: style.height,
    minWidth: style.minWidth,
    maxWidth: style.maxWidth,
    transform: style.transform,
    margin: style.margin,
    padding: style.padding,
    boxShadow: style.boxShadow,
    zIndex: style.zIndex,
    left: Math.round(rect.left),
    top: Math.round(rect.top),
    right: Math.round(rect.right),
    bottom: Math.round(rect.bottom),
    width: Math.round(rect.width),
    height: Math.round(rect.height),
    scrollWidth: Math.round(node.scrollWidth || 0),
    scrollHeight: Math.round(node.scrollHeight || 0),
    clientWidth: Math.round(node.clientWidth || 0),
    clientHeight: Math.round(node.clientHeight || 0),
    text: (node.textContent || "").replace(/\s+/g, " ").trim().slice(0, 140)
  };
}

function cssVar(name) {
  return window
    .getComputedStyle(document.documentElement)
    .getPropertyValue(name)
    .trim();
}

await wait(5000);

const selectors = [
  "html",
  "body",
  "#app",
  ".app-wrapper",
  ".main-container",
  ".main-container > .el-scrollbar",
  ".main-container > .el-scrollbar > .el-scrollbar__wrap",
  ".main-content",
  ".course-detail-root",
  ".course-detail-root > .layout-container",
  ".layout-inner-content",
  ".course-study-root",
  ".layout-header",
  "#layout-sidebar",
  ".layout-sidebar-scroll",
  ".study-container",
  ".main-layout",
  ".left-main",
  ".video-section",
  ".video-info-bar",
  ".video-player-wrapper",
  ".analysis-section",
  ".ai-assistant-widget",
  ".chapter-catalog",
  ".nav-mobile-container"
];

const allRootIds = [...document.querySelectorAll("[id='app']")].map(node => {
  const rect = node.getBoundingClientRect();
  return {
    tag: node.tagName,
    className: String(node.className || ""),
    left: Math.round(rect.left),
    top: Math.round(rect.top),
    width: Math.round(rect.width),
    height: Math.round(rect.height),
    text: (node.textContent || "").replace(/\s+/g, " ").trim().slice(0, 80)
  };
});

return {
  ok: true,
  href: location.href,
  title: document.title,
  viewport: {
    innerWidth: window.innerWidth,
    innerHeight: window.innerHeight,
    visualWidth: window.visualViewport?.width || null,
    visualHeight: window.visualViewport?.height || null,
    scrollX: window.scrollX,
    scrollY: window.scrollY
  },
  classes: {
    html: document.documentElement.className,
    body: document.body.className
  },
  cssVars: {
    safeTop: cssVar("--pure-safe-area-top"),
    safeBottom: cssVar("--pure-safe-area-bottom"),
    mobileTabHeight: cssVar("--pure-mobile-tab-height"),
    mobileContentBottomGap: cssVar("--pure-mobile-content-bottom-gap"),
    courseMobileTopOffset: cssVar("--course-mobile-top-offset"),
    courseMobileFabClearance: cssVar("--course-mobile-fab-clearance")
  },
  ids: allRootIds,
  rects: selectors.map(rectOf),
  bodyText: (document.body.innerText || "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 1200),
  documentSize: {
    documentElementScrollWidth: document.documentElement.scrollWidth,
    bodyScrollWidth: document.body.scrollWidth,
    documentElementScrollHeight: document.documentElement.scrollHeight,
    bodyScrollHeight: document.body.scrollHeight
  }
};
