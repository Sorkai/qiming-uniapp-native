import { http } from "@/utils/http";

// 接口返回数据类型定义
interface TeacherUsageResult {
  usageInfoList: Array<{
    date: string; // 日期 yyyy-MM-dd
    usageNum: number; // 使用次数
  }>;
}

interface StudentUsageResult {
  usageInfoList: Array<{
    date: string; // 日期 yyyy-MM-dd
    usageNum: number; // 使用次数
  }>;
}

interface WeekUsageResult {
  studentTotalNum: number; // 学生总次数
  teacherTotalNum: number; // 老师总次数
}

interface CourseUsersProgressResult {
  courseUsersProgress: Array<{
    courseId: number; // 课程id
    courseName: string; // 课程名称
    usersProgress: Array<{
      userId: number; // 用户id
      userName: string; // 用户名称
      progress: number; // 进度 后端返回50代表完成50%
    }>;
  }>;
}

interface CourseUsersExamInfoResult {
  courseUsersExamInfoList: Array<{
    courseId: number; // 课程id
    courseName: string; // 课程名称
    examId: number; // 考试id
    examName: string; // 考试名称
    examInfo: Array<{
      level: number; // 成绩等级 1:差 2:中等 3:良好 4:优秀
      levelNum: number; // 等级对应的学生人数
      levelUserList: Array<{
        userId: number; // 用户id
        userName: string; // 用户名称
      }>;
    }>;
  }>;
}

interface ApiResponse<T = any> {
  code: number;
  msg: string;
  data: T;
}

/**
 * 获取最近7天老师使用情况【管理端统计】
 */
export const getTeacherUsage = () => {
  return http.request<ApiResponse<TeacherUsageResult>>(
    "get",
    "/edu/backend/v1/statistics/teacher/usage"
  );
};

/**
 * 获取最近7天学生使用情况【管理端统计】
 */
export const getStudentUsage = () => {
  return http.request<ApiResponse<StudentUsageResult>>(
    "get",
    "/edu/backend/v1/statistics/student/usage"
  );
};

/**
 * 获取一周内学生、老师的总使用情况【管理端统计】
 */
export const getWeekUsage = () => {
  return http.request<ApiResponse<WeekUsageResult>>(
    "get",
    "/edu/backend/v1/statistics/week/usage"
  );
};

/**
 * 统计老师课程下学生完成的进度【老师端统计】
 */
export const getCourseUsersProgress = () => {
  return http.request<ApiResponse<CourseUsersProgressResult>>(
    "get",
    "/edu/backend/v1/statistics/course/users/progress"
  );
};

/**
 * 统计老师课程考试学生成绩情况【老师端统计】
 */
export const getCourseUsersExamInfo = () => {
  return http.request<ApiResponse<CourseUsersExamInfoResult>>(
    "get",
    "/edu/backend/v1/statistics/course/users/exam/info"
  );
};
