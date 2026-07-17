/**
 * @param {{
 *   code: number,
 *   data?: {
 *     userInfo?: {
 *       mobile?: string,
 *       nickname?: string,
 *       avatar?: string,
 *       info?: string
 *     }
 *   }
 * }} response
 */
export function adaptUserDetailToMine(response) {
  const userInfo = response.data?.userInfo;

  return {
    success: response.code === 0 || response.code === 200,
    data: {
      avatar: userInfo?.avatar ?? "",
      username: userInfo?.mobile ?? "",
      nickname: userInfo?.nickname ?? "",
      email: "",
      phone: userInfo?.mobile ?? "",
      description: userInfo?.info ?? ""
    }
  };
}

/**
 * @param {{
 *   code: number,
 *   msg: string,
 *   data?: {
 *     courseList?: Array<{ courseId: number, title: string }>
 *   }
 * }} response
 */
export function adaptBackendCourseListToPaperOptions(response) {
  return {
    ...response,
    data: (response.data?.courseList ?? []).map(course => ({
      id: course.courseId,
      name: course.title
    }))
  };
}
