export function isNativeWebViewRuntime() {
  if (typeof window === "undefined") return false;

  const queryText = `${window.location.search}&${window.location.hash}`;
  return (
    queryText.includes("qimingNative=1") ||
    localStorage.getItem("qimingNativeWebView") === "1" ||
    sessionStorage.getItem("qimingNativeWebView") === "1" ||
    document.documentElement.classList.contains("qiming-native-webview")
  );
}

export function logNativeFallback(message: string, error?: unknown) {
  if (isNativeWebViewRuntime()) {
    console.warn(message, error);
    return;
  }

  console.error(message, error);
}
