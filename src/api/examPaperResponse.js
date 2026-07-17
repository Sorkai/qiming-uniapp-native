/**
 * @template {{ code: number }} T
 * @param {T} response
 * @returns {T}
 */
export function normalizeExamPaperResponse(response) {
  return response.code === 200 ? { ...response, code: 0 } : response;
}
