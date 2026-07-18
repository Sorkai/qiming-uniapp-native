const clean = value => String(value || "").trim();

const proxyPrefix = "/mindmap-file";

/**
 * Keep trusted file resources on the same origin as the mobile H5 shell.
 * The upstream file host does not expose browser CORS headers, while the
 * EdgeOne function deliberately does.
 */
export function normalizeMindmapResourceUrl(
  url,
  { target = "", proxyOrigin = "", dev = false } = {}
) {
  const source = clean(url);
  const fileTarget = clean(target).replace(/\/$/, "");
  const edgeOrigin = clean(proxyOrigin).replace(/\/$/, "");

  if (!source || !fileTarget || !/^https?:\/\//i.test(source)) {
    return source;
  }

  try {
    const resource = new URL(source);
    const upstream = new URL(fileTarget);
    if (resource.origin !== upstream.origin) return source;

    const proxyPath = `${proxyPrefix}${resource.pathname}${resource.search}`;
    if (dev) return proxyPath;
    return edgeOrigin ? `${edgeOrigin}${proxyPath}` : source;
  } catch {
    return source;
  }
}
