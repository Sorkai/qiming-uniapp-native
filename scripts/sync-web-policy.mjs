// Web-only commits are kept in the business source repository. They must not
// be merged into a platform branch just because the source branch advanced.
export const WEB_ONLY_COMMITS = new Map([
  ["58f3aa2c", "Web VRM panel removes native-only handling"],
  ["13472e20", "Web CI switches contract tests to Node 24"],
  ["ca70ce74", "Web-only ECharts/course navigation correction"],
  ["989ac6a3", "Web standalone VRM production asset publishing"]
]);

const WEB_ONLY_MARKERS = [
  /\[web-only\]/i,
  /\bmobile-sync\s*:\s*(?:no|skip)\b/i
];

export function classifyWebCommit({ hash = "", subject = "", body = "" }) {
  const shortHash = String(hash).slice(0, 8).toLowerCase();
  const knownReason = WEB_ONLY_COMMITS.get(shortHash);
  if (knownReason) {
    return { webOnly: true, reason: knownReason };
  }

  const message = `${subject}\n${body}`;
  const marked = WEB_ONLY_MARKERS.some(marker => marker.test(message));
  return {
    webOnly: marked,
    reason: marked
      ? "commit message explicitly marks this change as Web-only"
      : ""
  };
}
