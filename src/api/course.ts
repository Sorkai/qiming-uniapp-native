import { http } from "@/utils/http";

export interface CourseCreateParams {
  title: string;
  thumb: number;
  shortDesc: string;
  isRequired: number;
  categoryIds: number[];
  isChapter: number;
  endingTime: string;
  chapterList?: {
    chapterId?: number;
    name: string;
    hourList: any[];
  }[];
  hourList?: {
    resourceId: number;
    duration: number;
    title?: string;
    rType?: string;
    hourId?: number;
    fileUrl?: string;
  }[];
  attrList?: {
    resourceId: number;
    title?: string;
    rType?: string;
    attrId?: number;
    fileUrl?: string;
  }[];
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

export interface ApiResponse<T = any> {
  code: number;
  msg: string;
  data: T;
}

/**
 * 创建课程
 */
export const createCourse = (data: CourseCreateParams) => {
  return http.request<ApiResponse>("post", "/course/v1/course/create", {
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
    "/course/v1/course/list",
    { params }
  );
};

/**
 * 获取课时列表
 */
export const getCourseHoursList = (params: { courseId: number }) => {
  return http.request<ApiResponse<CourseHoursListResult>>(
    "get",
    "/course/v1/course/hours/list",
    { params }
  );
};

/**
 * 获取课程附件列表
 */
export const getCourseAttrList = (params: { courseId: number }) => {
  return http.request<ApiResponse<CourseAttrListResult>>(
    "get",
    "/course/v1/course/attr/list",
    { params }
  );
};

/**
 * 获取课程详情
 */
export const getCourseDetail = (params: { courseId: number }) => {
  return http.request<ApiResponse>("get", "/course/v1/course/detail", {
    params
  });
};
