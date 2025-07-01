import { http } from "@/utils/http";

export interface CourseListParams {
  pageNum: number;
  pageSize?: number;
  queryType?: number; // 查询类型 0:全部 1:必修 2:选修 3:已学完 4:未学完（默认0）
}

export interface CourseListResult {
  list: Array<{
    courseId: number;
    courseName: string;
    thumbUrl: string;
    isRequired: number; // 是否必修 1:必修 0:选修
    totalHours: number; // 总课时数
    finishedHours: number; // 已完成课时数
  }>;
  total: number;
}

export interface CourseDetailResult {
  courseId: number;
  courseName: string;
  thumbUrl: string;
  isRequired: number;
  totalHours: number;
  finishedHours: number;
  courseDesc: string;
  courseChapterList: Array<{
    chapterId: number;
    name: string;
    hourList: Array<{
      hourId: number;
      duration: number;
      title: string;
      rType: string;
      fileUrl: string;
      finished: number; // 是否完成 0:否 1:是
    }>;
  }>;
  courseAttrList: Array<{
    resourceId: number;
    title: string;
    rType: string;
    attrId: number;
    fileUrl: string;
  }>;
}

export interface CourseReportLessonParams {
  courseId: number;
  hourId: number;
}

export interface ApiResponse<T = any> {
  code: number;
  msg: string;
  data: T;
}

/**
 * 获取课程列表
 */
export const getFrontendCourseList = (params: CourseListParams) => {
  return http.request<ApiResponse<CourseListResult>>(
    "get",
    "/edu/frontend/v1/course/list",
    { params }
  );
};

/**
 * 获取课程详情
 */
export const getFrontendCourseDetail = (params: { courseId: number }) => {
  return http.request<ApiResponse<CourseDetailResult>>(
    "get",
    "/edu/frontend/v1/course/detail",
    { params }
  );
};

/**
 * 课时完成上报
 */
export const reportFrontendLesson = (data: CourseReportLessonParams) => {
  return http.request<ApiResponse>(
    "post",
    "/edu/frontend/v1/course/report/lesson",
    { data }
  );
}; 