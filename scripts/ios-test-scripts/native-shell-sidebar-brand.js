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

function cssPixelVar(name) {
  const parsed = Number.parseFloat(
    window
      .getComputedStyle(document.documentElement)
      .getPropertyValue(name)
      .trim()
  );
  return Number.isFinite(parsed) ? parsed : 0;
}

function transparent(value) {
  return /rgba\(\s*0\s*,\s*0\s*,\s*0\s*,\s*0\s*\)|transparent/i.test(
    value || ""
  );
}

async function waitFor(predicate, timeoutMs = 5000) {
  const startedAt = Date.now();
  while (Date.now() - startedAt < timeoutMs) {
    const value = predicate();
    if (value) return value;
    await wait(120);
  }
  return null;
}

function resetShellScroll() {
  document.documentElement.scrollTop = 0;
  document.body.scrollTop = 0;
  window.scrollTo({ left: 0, top: 0 });
  ["#app", ".app-wrapper", ".main-container", ".app-main"].forEach(selector => {
    document.querySelectorAll(selector).forEach(node => {
      node.scrollTop = 0;
      node.scrollLeft = 0;
    });
  });
}

await wait(1800);
resetShellScroll();
await wait(250);

const hamburger = document.querySelector(".hamburger-container");
hamburger?.dispatchEvent(new MouseEvent("mousedown", { bubbles: true }));
hamburger?.dispatchEvent(new MouseEvent("mouseup", { bubbles: true }));
hamburger?.click();

const sidebar = await waitFor(() => {
  const node = document.querySelector(".sidebar-container");
  const rect = node?.getBoundingClientRect();
  return rect && rect.left >= -2 && rect.width >= 220 ? node : null;
}, 5000);
await wait(700);

const safeAreaTop = cssPixelVar("--pure-safe-area-top");
const iosSafeTopFallback = cssPixelVar("--qiming-native-ios-safe-top-fallback");
const effectiveSafeTop = Math.max(safeAreaTop, iosSafeTopFallback);
const navbar = document.querySelector(".navbar");
const navbarRect = rectOf(navbar);
const navbarStyle = navbar ? window.getComputedStyle(navbar) : null;
const brandTitle = document.querySelector(".mobile-brand-title");
const brandTitleRect = rectOf(brandTitle);
const brandTitleStyle = brandTitle ? window.getComputedStyle(brandTitle) : null;
const sidebarRect = rectOf(sidebar);
const sidebarLogoContainer = sidebar?.querySelector(".sidebar-logo-container");
const sidebarLogoContainerRect = rectOf(sidebarLogoContainer);
const sidebarLogoContainerStyle = sidebarLogoContainer
  ? window.getComputedStyle(sidebarLogoContainer)
  : null;
const sidebarTitle = sidebar?.querySelector(".sidebar-title");
const sidebarTitleRect = rectOf(sidebarTitle);
const sidebarTitleStyle = sidebarTitle
  ? window.getComputedStyle(sidebarTitle)
  : null;

const navbarSafe =
  !!navbarRect &&
  navbarRect.top >= -1 &&
  navbarRect.height >= effectiveSafeTop + 72 &&
  Number.parseFloat(navbarStyle?.borderBottomLeftRadius || "0") >= 20 &&
  Number.parseFloat(navbarStyle?.borderBottomRightRadius || "0") >= 20 &&
  !!brandTitleRect &&
  brandTitleRect.top >= effectiveSafeTop + 4 &&
  brandTitleRect.bottom <= navbarRect.bottom - 8 &&
  !!brandTitleStyle &&
  Number.parseFloat(brandTitleStyle.fontSize || "0") >= 18 &&
  brandTitleStyle.fontStyle === "italic" &&
  brandTitleStyle.backgroundImage === "none" &&
  !transparent(brandTitleStyle.color);

const sidebarSafe =
  !!sidebarRect &&
  sidebarRect.left >= -2 &&
  sidebarRect.width >= 220 &&
  !!sidebarLogoContainerRect &&
  sidebarLogoContainerRect.top >= -1 &&
  sidebarLogoContainerRect.height >= effectiveSafeTop + 68 &&
  !!sidebarTitleRect &&
  sidebarTitleRect.top >= effectiveSafeTop + 8 &&
  sidebarTitleRect.bottom <= sidebarLogoContainerRect.bottom - 8 &&
  !!sidebarTitleStyle &&
  Number.parseFloat(sidebarTitleStyle.fontSize || "0") >= 20 &&
  Number.parseInt(sidebarTitleStyle.fontWeight || "0", 10) >= 800 &&
  sidebarTitleStyle.fontStyle === "italic" &&
  sidebarTitleStyle.backgroundImage === "none" &&
  !transparent(sidebarTitleStyle.color) &&
  !transparent(sidebarTitleStyle.webkitTextFillColor) &&
  sidebarTitleStyle.overflowX === "visible" &&
  sidebarLogoContainerStyle?.overflowX === "visible";

return {
  ok: !!hamburger && !!sidebar && navbarSafe && sidebarSafe,
  safeAreaTop,
  iosSafeTopFallback,
  effectiveSafeTop,
  navbarRect,
  navbarSafe,
  brandTitleRect,
  brandTitleFontSize: brandTitleStyle?.fontSize || "",
  brandTitleFontStyle: brandTitleStyle?.fontStyle || "",
  brandTitleColor: brandTitleStyle?.color || "",
  brandTitleBackgroundImage: brandTitleStyle?.backgroundImage || "",
  sidebarRect,
  sidebarLogoContainerRect,
  sidebarLogoContainerOverflowX: sidebarLogoContainerStyle?.overflowX || "",
  sidebarTitleRect,
  sidebarSafe,
  sidebarTitleFontSize: sidebarTitleStyle?.fontSize || "",
  sidebarTitleFontWeight: sidebarTitleStyle?.fontWeight || "",
  sidebarTitleFontStyle: sidebarTitleStyle?.fontStyle || "",
  sidebarTitleColor: sidebarTitleStyle?.color || "",
  sidebarTitleTextFillColor: sidebarTitleStyle?.webkitTextFillColor || "",
  sidebarTitleBackgroundImage: sidebarTitleStyle?.backgroundImage || "",
  sidebarTitleOverflowX: sidebarTitleStyle?.overflowX || "",
  appRect: rectOf(document.querySelector("#app")),
  mainRect: rectOf(document.querySelector(".main-container")),
  text: (document.querySelector("#app")?.innerText || "")
    .replace(/\s+/g, " ")
    .slice(0, 1000)
};
