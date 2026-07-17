export function registerPwa() {
  if (
    typeof window === "undefined" ||
    window.location.protocol === "file:" ||
    !("serviceWorker" in navigator)
  ) {
    return;
  }

  const base = import.meta.env.BASE_URL || "/";
  const serviceWorkerUrl = `${base.replace(/\/?$/, "/")}sw.js`;

  window.addEventListener("load", () => {
    navigator.serviceWorker.register(serviceWorkerUrl).catch(error => {
      console.warn("PWA service worker registration failed", error);
    });
  });
}
