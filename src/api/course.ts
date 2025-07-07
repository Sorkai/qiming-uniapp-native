import { http } from "@/utils/http";

export interface CourseCreateParams {
  title: string; // 课程标题
  thumb_url: string; // 课程封面地址
  shortDesc: string; // 课程简介
  isRequired: number; // 是否必修，1: 必修，0: 选修
  categoryIds: number[]; // 课程分类ID列表
  isChapter: number; // 是否章节，1: 是，0: 否
  endingTime: string; // 课程结束时间（yyyy-MM-dd hh:mm:ss）
  chapterList?: Array<{
    // 章节列表（可选）
    chapterId?: number; // 章节ID（可选）
    name: string; // 章节标题
    hourList: Array<{
      // 章节课时
      resourceId: number; // 课时资源ID
      duration: number; // 时长（秒）
      title?: string; // 课时标题（可选）
      rType?: string; // 资源类型（可选）
      hourId?: number; // 课时ID（可选）
      fileUrl?: string; // 课时文件地址（可选）
    }>;
  }>;
  hourList?: Array<{
    // 课时列表（可选）
    resourceId: number; // 课时资源ID
    duration: number; // 时长（秒）
    title?: string; // 课时标题（可选）
    rType?: string; // 资源类型（可选）
    hourId?: number; // 课时ID（可选）
    fileUrl?: string; // 课时文件地址（可选）
  }>;
  attrList?: Array<{
    // 附件资源列表（可选）
    resourceId: number; // 附件资源ID
    title?: string; // 附件标题（可选）
    rType?: string; // 附件类型（可选）
    attrId?: number; // 附件ID（可选）
    fileUrl?: string; // 附件地址（可选）
  }>;
}

export interface CourseUpdateParams {
  courseId: number; // 课程ID
  title?: string; // 课程标题（可选）
  thumbUrl?: string; // 课程封面Url（可选）
  shortDesc?: string; // 课程简介（可选）
  isRequired?: number; // 是否必修，1: 必修，0: 选修
  categoryIds?: number[]; // 课程分类ID列表
  endingTime?: string; // 课程结束时间（yyyy-MM-dd hh:mm:ss）（可选）
}

export interface CourseListResult {
  total: number;
  courseList: Array<{
    courseId: number;
    title: string;
    thumbUrl: string;
    shortDesc: string;
    categoryDesc: string;
    isRequired: number;
    userName: string;
    startTime: string;
    endTime: string;
    categoryList: Array<{
      categoryId: number;
      name: string;
    }>;
  }>;
}

export interface CourseHoursListResult {
  courseChapters: Array<{
    chapterId: number;
    name: string;
    hourList: Array<{
      resourceId: number;
      duration: number;
      title: string;
      rType: string;
      hourId: number;
      fileUrl: string;
    }>;
  }>;
}

export interface CourseAttrListResult {
  courseWares: Array<{
    resourceId: number;
    title: string;
    rType: string;
    attrId: number;
    fileUrl: string;
  }>;
}

export interface AllocationUserResult {
  total: number;
  list: Array<{
    userId: number;
    userName: string;
    avatar: string;
  }>;
}

export interface StudyUserResult {
  total: number;
  list: Array<{
    userId: number;
    userName: string;
    avatar: string;
    totalHours: number;
    finishedHours: number;
    startStudyTime: string;
    finishedStudyTime?: string;
  }>;
}

export interface ApiResponse<T = any> {
  code: number;
  msg: string;
  data: T;
}

/**
 * 创建课程
 */
export const createCourse = (data: CourseCreateParams) => {
  return http.request<ApiResponse>("post", "/edu/backend/v1/course/create", {
    data
  });
};

/**
 * 更新课程信息
 */
export const updateCourse = (data: CourseUpdateParams) => {
  return http.request<ApiResponse>("post", "/edu/backend/v1/course/update", {
    data
  });
};

/**
 * 获取课程列表
 */
export const getCourseList = (params: {
  pageNum: number;
  pageSize?: number;
  courseName?: string;
}) => {
  return http.request<ApiResponse<CourseListResult>>(
    "get",
    "/edu/backend/v1/course/list",
    { params }
  );
};

/**
 * 获取课时列表
 */
export const getCourseHoursList = (params: { courseId: number }) => {
  return http.request<ApiResponse<CourseHoursListResult>>(
    "get",
    "/edu/backend/v1/course/hours/list",
    { params }
  );
};

/**
 * 获取课程附件列表
 */
export const getCourseAttrList = (params: { courseId: number }) => {
  return http.request<ApiResponse<CourseAttrListResult>>(
    "get",
    "/edu/backend/v1/course/attr/list",
    { params }
  );
};

/**
 * 获取课程详情
 */
export const getCourseDetail = (params: { courseId: number }) => {
  return http.request<ApiResponse>("get", "/edu/backend/v1/course/detail", {
    params
  });
};

/**
 * 课程分配
 * @param data 课程ID和用户ID列表
 */
export const coursesAllocation = (data: {
  courseId: number;
  userIdList: number[];
}) => {
  return http.request<ApiResponse>(
    "post",
    "/edu/backend/v1/course/allocation",
    { data }
  );
};

/**
 * 获取课程可分配的学员列表
 * @param params 查询参数
 */
export const getAllocationUserList = (params: {
  courseId: number;
  userName?: string;
  pageNum: number;
  pageSize?: number;
}) => {
  return http.request<ApiResponse<AllocationUserResult>>(
    "get",
    "/edu/backend/v1/course/allocation/user/list",
    { params }
  );
};

/**
 * 获取课程学员学习情况列表
 * @param params 查询参数
 */
export const getStudyUserList = (params: {
  courseId: number;
  userName?: string;
  pageNum: number;
  pageSize?: number;
}) => {
  return http.request<ApiResponse<StudyUserResult>>(
    "get",
    "/edu/backend/v1/course/study/user/list",
    { params }
  );
};

/**
 * 删除课程
 * @param data 包含课程ID的数据对象
 */
export const deleteCourse = (data: { courseId: number }) => {
  return http.request<ApiResponse>(
    "post",
    "/edu/backend/v1/course/delete",
    { data }
  );
};

/**
 * 新增课程的章节及课时
 * @param data 包含课程ID和章节信息的数据对象
 */
export const createCourseChapter = (data: {
  courseId: number;
  chapter: {
    chapterId?: number;
    name: string;
    hourList: Array<{
      resourceId: number;
      duration: number;
      title?: string;
      rType?: string;
      hourId?: number;
      fileUrl?: string;
    }>;
  };
}) => {
  return http.request<ApiResponse>(
    "post",
    "/edu/backend/v1/course/create/chapter",
    { data }
  );
};

/**
 * 删除章节
 * @param data 包含课程ID和章节ID的数据对象
 */
export const deleteChapter = (data: {
  courseId: number;
  chapterId: number;
}) => {
  return http.request<ApiResponse>(
    "post",
    "/edu/backend/v1/course/delete/chapter",
    { data }
  );
};

/**
 * 删除课时
 * @param data 包含课程ID、章节ID和课时ID的数据对象
 */
export const deleteHour = (data: {
  courseId: number;
  chapterId: number;
  hourId: number;
}) => {
  return http.request<ApiResponse>(
    "post",
    "/edu/backend/v1/course/delete/hour",
    { data }
  );
};
