const CACHE_PREFIX = "qiming-smart-edu";
const APP_SHELL_CACHE = `${CACHE_PREFIX}-shell-v2`;
const STATIC_CACHE = `${CACHE_PREFIX}-static-v2`;
const MEDIA_CACHE = `${CACHE_PREFIX}-media-v2`;
const RUNTIME_CACHE = `${CACHE_PREFIX}-runtime-v2`;

const CACHE_MAX_AGE = {
  static: 365 * 24 * 60 * 60 * 1000,
  media: 30 * 24 * 60 * 60 * 1000,
  runtime: 7 * 24 * 60 * 60 * 1000
};

const CACHE_MAX_ENTRIES = {
  media: 120,
  runtime: 80
};

const IS_LOCAL_DEV =
  self.location.hostname === "localhost" ||
  self.location.hostname === "127.0.0.1";
const APP_SHELL = [
  "/",
  "/index.html",
  "/manifest.webmanifest",
  "/favicon.ico",
  "/icons/app-192.png",
  "/icons/app-512.png"
];

self.addEventListener("message", event => {
  if (event.data?.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
});

self.addEventListener("install", event => {
  if (IS_LOCAL_DEV) {
    self.skipWaiting();
    return;
  }

  event.waitUntil(
    caches
      .open(APP_SHELL_CACHE)
      .then(cache => cache.addAll(APP_SHELL))
      .then(() => {
        self.skipWaiting();
      })
  );
});

self.addEventListener("activate", event => {
  const currentCaches = [
    APP_SHELL_CACHE,
    STATIC_CACHE,
    MEDIA_CACHE,
    RUNTIME_CACHE
  ];

  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys
          .filter(key => key.startsWith(CACHE_PREFIX))
          .filter(key => !currentCaches.includes(key))
          .map(key => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", event => {
  if (IS_LOCAL_DEV) return;
  if (event.request.method !== "GET") return;

  const requestUrl = new URL(event.request.url);
  const isSameOrigin = requestUrl.origin === self.location.origin;

  if (!isSameOrigin) return;
  if (isApiRequest(requestUrl)) return;

  if (event.request.mode === "navigate") {
    event.respondWith(networkFirst(event.request, APP_SHELL_CACHE, "/"));
    return;
  }

  if (isNoCacheAsset(requestUrl)) {
    event.respondWith(networkFirst(event.request, APP_SHELL_CACHE));
    return;
  }

  if (isHashedBuildAsset(requestUrl)) {
    event.respondWith(cacheFirst(event.request, STATIC_CACHE, CACHE_MAX_AGE.static));
    return;
  }

  if (isHeavyPublicAsset(requestUrl)) {
    event.respondWith(
      cacheFirst(
        event.request,
        MEDIA_CACHE,
        CACHE_MAX_AGE.media,
        CACHE_MAX_ENTRIES.media
      )
    );
    return;
  }

  event.respondWith(
    staleWhileRevalidate(
      event.request,
      RUNTIME_CACHE,
      CACHE_MAX_AGE.runtime,
      CACHE_MAX_ENTRIES.runtime
    )
  );
});

function isApiRequest(url) {
  return url.pathname.startsWith("/api/");
}

function isNoCacheAsset(url) {
  return (
    url.pathname === "/index.html" ||
    url.pathname === "/sw.js" ||
    url.pathname === "/platform-config.json" ||
    url.pathname.endsWith("/index.html")
  );
}

function isHashedBuildAsset(url) {
  return /^\/static\/.+-[A-Za-z0-9_-]{8,}\.(js|css|png|jpg|jpeg|webp|svg|woff2?|ttf)$/.test(
    url.pathname
  );
}

function isHeavyPublicAsset(url) {
  return (
    url.pathname.startsWith("/virtual-people/") ||
    url.pathname.startsWith("/virtualpeopleanimation/") ||
    url.pathname.startsWith("/homepage/") ||
    url.pathname.startsWith("/publicbackgroundpreset/") ||
    url.pathname.startsWith("/textures/") ||
    url.pathname.startsWith("/models/") ||
    url.pathname.startsWith("/wasm/") ||
    url.pathname === "/campus-2d-bg.svg"
  );
}

async function networkFirst(request, cacheName, fallbackUrl) {
  const cache = await caches.open(cacheName);
  try {
    const response = await fetch(request);
    if (isCacheableResponse(response)) {
      await cache.put(request, withTimestamp(response.clone()));
    }
    return response;
  } catch (error) {
    const cached = await cache.match(request);
    if (cached) return cached;
    if (fallbackUrl) return cache.match(fallbackUrl);
    throw error;
  }
}

async function cacheFirst(request, cacheName, maxAge, maxEntries) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);
  if (cached && !isExpired(cached, maxAge)) return cached;

  const response = await fetch(request);
  if (isCacheableResponse(response)) {
    await cache.put(request, withTimestamp(response.clone()));
    if (maxEntries) await trimCache(cacheName, maxEntries);
  }
  return response;
}

async function staleWhileRevalidate(request, cacheName, maxAge, maxEntries) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);

  const fetchPromise = fetch(request)
    .then(async response => {
      if (isCacheableResponse(response)) {
        await cache.put(request, withTimestamp(response.clone()));
        if (maxEntries) await trimCache(cacheName, maxEntries);
      }
      return response;
    })
    .catch(() => null);

  if (cached && !isExpired(cached, maxAge)) return cached;
  return (await fetchPromise) || cached || Response.error();
}

function isCacheableResponse(response) {
  return response && response.status === 200 && response.type === "basic";
}

function withTimestamp(response) {
  const headers = new Headers(response.headers);
  headers.set("sw-cache-timestamp", Date.now().toString());
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers
  });
}

function isExpired(response, maxAge) {
  const timestamp = Number(response.headers.get("sw-cache-timestamp") || 0);
  if (!timestamp) return false;
  return Date.now() - timestamp > maxAge;
}

async function trimCache(cacheName, maxEntries) {
  const cache = await caches.open(cacheName);
  const keys = await cache.keys();
  if (keys.length <= maxEntries) return;

  await Promise.all(
    keys.slice(0, keys.length - maxEntries).map(key => cache.delete(key))
  );
}
