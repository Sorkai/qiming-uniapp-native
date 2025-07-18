import { mathCourseContent } from './math';
import { linuxCourseContent } from './linux';

/**
 * 根据课程名称获取课程内容
 * @param courseName 课程名称
 * @returns 对应课程的详细内容，如果没有匹配的课程则返回空字符串
 */
export function getCourseContentByName(courseName: string): string {
  const courseMap: Record<string, string> = {
    '高等数学': mathCourseContent,
    '嵌入式Linux开发实践教程': linuxCourseContent,
    // 可以继续添加更多课程内容
  };

  return courseMap[courseName] || '';
} 