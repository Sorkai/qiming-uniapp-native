const upstreamOrigin = "https://aiedu-file.intelledu.cn";
const proxyPrefix = "/mindmap-file";
const allowedMethods = new Set(["GET", "HEAD", "OPTIONS"]);
const forwardedRequestHeaders = [
  "accept",
  "range",
  "if-match",
  "if-none-match",
  "if-modified-since",
  "if-unmodified-since"
];
const forwardedResponseHeaders = [
  "accept-ranges",
  "cache-control",
  "content-disposition",
  "content-length",
  "content-range",
  "content-type",
  "etag",
  "last-modified"
];

function corsHeaders(headers = new Headers()) {
  headers.set("Access-Control-Allow-Origin", "*");
  headers.set("Access-Control-Allow-Methods", "GET, HEAD, OPTIONS");
  headers.set(
    "Access-Control-Allow-Headers",
    "Accept, Range, If-Match, If-None-Match, If-Modified-Since, If-Unmodified-Since"
  );
  headers.set(
    "Access-Control-Expose-Headers",
    "Accept-Ranges, Content-Disposition, Content-Length, Content-Range, Content-Type, ETag, Last-Modified"
  );
  headers.set("Cross-Origin-Resource-Policy", "cross-origin");
  headers.set("Timing-Allow-Origin", "*");
  return headers;
}

function jsonResponse(status, message) {
  return new Response(JSON.stringify({ code: status, message }), {
    status,
    headers: corsHeaders(
      new Headers({
        "Cache-Control": "no-store",
        "Content-Type": "application/json; charset=utf-8"
      })
    )
  });
}

function buildUpstreamUrl(requestUrl) {
  const incoming = new URL(requestUrl);
  if (!incoming.pathname.startsWith(`${proxyPrefix}/`)) return null;
  const upstreamPath = incoming.pathname.slice(proxyPrefix.length);
  if (!upstreamPath.startsWith("/") || upstreamPath.startsWith("//")) {
    return null;
  }
  const upstreamUrl = new URL(
    `${upstreamPath}${incoming.search}`,
    upstreamOrigin
  );
  return upstreamUrl.origin === upstreamOrigin ? upstreamUrl : null;
}

async function fetchFixedUpstream(fetchUpstream, upstreamUrl, init) {
  let currentUrl = upstreamUrl;
  for (let redirectCount = 0; redirectCount <= 4; redirectCount += 1) {
    const response = await fetchUpstream(
      new Request(currentUrl, { ...init, redirect: "manual" })
    );
    if (response.status < 300 || response.status >= 400) return response;

    const location = response.headers.get("location");
    if (!location) return response;
    const redirectUrl = new URL(location, currentUrl);
    if (redirectUrl.origin !== upstreamOrigin) return null;
    currentUrl = redirectUrl;
  }
  throw new Error("Too many upstream redirects");
}

export async function onRequest(context) {
  const request = context.request;
  if (!allowedMethods.has(request.method)) {
    return jsonResponse(405, "Method not allowed");
  }
  if (request.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: corsHeaders() });
  }

  const upstreamUrl = buildUpstreamUrl(request.url);
  if (!upstreamUrl) return jsonResponse(400, "Invalid file path");

  const requestHeaders = new Headers();
  for (const name of forwardedRequestHeaders) {
    const value = request.headers.get(name);
    if (value) requestHeaders.set(name, value);
  }

  try {
    const fetchUpstream = context.fetch || fetch;
    const upstreamResponse = await fetchFixedUpstream(
      fetchUpstream,
      upstreamUrl,
      {
        method: request.method,
        headers: requestHeaders
      }
    );
    if (!upstreamResponse) {
      return jsonResponse(502, "Unsafe upstream redirect");
    }
    const responseHeaders = new Headers();
    for (const name of forwardedResponseHeaders) {
      const value = upstreamResponse.headers.get(name);
      if (value) responseHeaders.set(name, value);
    }
    if (!responseHeaders.has("Cache-Control")) {
      responseHeaders.set("Cache-Control", "public, max-age=300");
    }
    corsHeaders(responseHeaders);
    return new Response(upstreamResponse.body, {
      status: upstreamResponse.status,
      statusText: upstreamResponse.statusText,
      headers: responseHeaders
    });
  } catch {
    return jsonResponse(502, "File service unavailable");
  }
}
