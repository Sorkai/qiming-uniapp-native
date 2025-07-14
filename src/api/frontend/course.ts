import { http } from "@/utils/http";

export interface CourseListResult {
  list: Array<{
    courseId: number;
    courseName: string;
    thumbUrl: string;
    isRequired: number;
    totalHours: number;
    finishedHours: number;
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
      finished: number;
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

export interface CourseScoreResult {
  courseId: number;
  courseScore: number;
  workScore: number;
  examScore: number;
}

export interface CourseStudyEffectResult {
  courseId: number;
  keyPointNum: number;
  difficultPointNum: number;
  knowledgePointNum: number;
  conceptNum: number;
  chapterList: Array<{
    chapterId: number;
    chapterName: string;
    keyPointArray: Array<{
      title: string;
      content: string;
    }>;
    difficultPointArray: Array<{
      title: string;
      content: string;
    }>;
    knowledgeArray: Array<{
      title: string;
      content: string;
    }>;
    ConceptArray: Array<{
      title: string;
      content: string;
    }>;
  }>;
}

export interface ApiResponse<T = any> {
  code: number;
  msg: string;
  data: T;
}

/**
 * 获取课程列表
 */
export const getCourseList = (params: {
  pageNum: number;
  pageSize?: number;
  queryType?: number;
}) => {
  return http.request<ApiResponse<CourseListResult>>(
    "get",
    "/edu/frontend/v1/course/list",
    { params }
  );
};

/**
 * 获取课程详情
 */
export const getCourseDetail = (params: { courseId: number }) => {
  return http.request<ApiResponse<CourseDetailResult>>(
    "get",
    "/edu/frontend/v1/course/detail",
    { params }
  );
};

/**
 * 课时完成上报
 */
export const reportCourseLesson = (data: {
  courseId: number;
  hourId: number;
}) => {
  return http.request<ApiResponse>(
    "post",
    "/edu/frontend/v1/course/report/lesson",
    { data }
  );
};

/**
 * 获取课程学习效果
 */
export const getCourseStudyEffect = (params: { courseId: number }) => {
  return http.request<ApiResponse<CourseStudyEffectResult>>(
    "get",
    "/edu/frontend/v1/course/study/effect",
    { params }
  );
};

/**
 * 获取课程成绩
 */
export const getCourseScore = (params: { courseId: number }) => {
  return http.request<ApiResponse<CourseScoreResult>>(
    "get",
    "/edu/frontend/v1/course/score",
    { params }
  );
};
