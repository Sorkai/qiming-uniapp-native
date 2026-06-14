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
    rect.width >= 12 &&
    rect.height >= 12 &&
    centerX >= 0 &&
    centerY >= 0 &&
    centerX <= viewportWidth &&
    centerY <= viewportHeight &&
    style.display !== "none" &&
    style.visibility !== "hidden" &&
    Number.parseFloat(style.opacity || "1") > 0.05
  );
}

async function waitFor(predicate, timeoutMs = 6000) {
  const startedAt = Date.now();
  while (Date.now() - startedAt < timeoutMs) {
    const value = predicate();
    if (value) return value;
    await wait(120);
  }
  return null;
}

await wait(1200);

const nav = await waitFor(() =>
  document.querySelector(".nav-mobile-container")
);
const items = [...document.querySelectorAll(".nav-mobile-item")];
const itemReports = items.map(item => {
  const title = item.querySelector(".nav-title")?.textContent?.trim() || "";
  const icon = item.querySelector(".nav-icon");
  const svg = item.querySelector("svg");
  const paths = [
    ...item.querySelectorAll("path, circle, line, polyline, rect")
  ];
  return {
    title,
    itemRect: rectOf(item),
    iconRect: rectOf(icon),
    svgRect: rectOf(svg),
    iconVisible: isVisible(icon),
    svgVisible: isVisible(svg),
    graphicNodeCount: paths.length,
    text: item.innerText.replace(/\s+/g, " ").trim()
  };
});

const aiItem = itemReports.find(item => item.title === "AI App");
const allIconsVisible = itemReports.every(
  item => item.iconVisible && item.svgVisible && item.graphicNodeCount > 0
);

return {
  ok:
    !!nav &&
    !!aiItem &&
    aiItem.svgVisible &&
    aiItem.graphicNodeCount > 0 &&
    allIconsVisible,
  href: location.href,
  hasNav: !!nav,
  navRect: rectOf(nav),
  itemCount: itemReports.length,
  aiItem,
  allIconsVisible,
  itemReports,
  text: (document.querySelector("#app")?.innerText || "")
    .replace(/\s+/g, " ")
    .slice(0, 1000)
};
