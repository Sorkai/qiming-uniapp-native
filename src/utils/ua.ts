/**
 * 更加精细化的设备检测工具
 */

export type LayoutDevice = "desktop" | "mobile";

export interface UAInfo {
  isMobile: boolean;
  isTablet: boolean;
  isIOS: boolean;
  isAndroid: boolean;
  isWechat: boolean;
  isApp: boolean; // 是否在壳子内
  deviceType: "desktop" | "mobile" | "tablet";
}

const MOBILE_BREAKPOINT = 760;

function getUserAgent(): string {
  if (typeof navigator === "undefined") return "";
  return navigator.userAgent.toLowerCase();
}

function isTouchDevice(): boolean {
  if (typeof window === "undefined" || typeof navigator === "undefined") {
    return false;
  }

  return "ontouchstart" in window || navigator.maxTouchPoints > 0;
}

function getViewportWidth(): number {
  if (typeof document !== "undefined") {
    return document.documentElement.clientWidth;
  }
  return 0;
}

export const getUA = (): UAInfo => {
  const ua = getUserAgent();

  const isIpad = /ipad/i.test(ua) || (/macintosh/i.test(ua) && isTouchDevice());
  const isIphone = /iphone|ipod/i.test(ua);
  const isAndroid = /android/i.test(ua);
  const isMobile = /mobile|android|iphone|ipod|phone/i.test(ua) || isIpad;
  const isTablet = isIpad || (isAndroid && !/mobile/i.test(ua));
  const isWechat = /micromessenger/i.test(ua);

  // 简单的设备类型分类
  let deviceType: "desktop" | "mobile" | "tablet" = "desktop";
  if (isTablet) {
    deviceType = "tablet";
  } else if (isMobile) {
    deviceType = "mobile";
  }

  return {
    isMobile,
    isTablet,
    isIOS: isIphone || isIpad,
    isAndroid,
    isWechat,
    isApp: false, // 预留
    deviceType
  };
};

export const resolveLayoutDevice = (
  uaInfo: UAInfo = getUA(),
  viewportWidth = getViewportWidth()
): LayoutDevice => {
  if (uaInfo.isMobile || uaInfo.isTablet) {
    return "mobile";
  }

  if (viewportWidth > 0 && viewportWidth <= MOBILE_BREAKPOINT) {
    return "mobile";
  }

  return "desktop";
};

export const applyUAFlags = (uaInfo: UAInfo = getUA()): void => {
  if (typeof document === "undefined") return;

  const root = document.documentElement;
  const mobileLike = uaInfo.isMobile || uaInfo.isTablet;

  root.classList.toggle("ua-mobile", mobileLike);
  root.classList.toggle("ua-desktop", !mobileLike);
  root.classList.toggle("ua-ios", uaInfo.isIOS);
  root.classList.toggle("ua-android", uaInfo.isAndroid);
  root.classList.toggle("ua-wechat", uaInfo.isWechat);
  root.setAttribute("data-device-type", uaInfo.deviceType);
};

export const isMobileLayout = (viewportWidth = getViewportWidth()): boolean => {
  return resolveLayoutDevice(getUA(), viewportWidth) === "mobile";
};

/**
 * 判断是否是移动端环境
 */
export const isMobile = (): boolean => isMobileLayout();

/**
 * 判断是否是 iOS
 */
export const isIOS = (): boolean => getUA().isIOS;

/**
 * 判断是否是微信浏览器
 */
export const isWechat = (): boolean => getUA().isWechat;
