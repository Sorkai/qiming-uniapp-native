export interface UserDetailEnvelope {
  code: number;
  data?: {
    userInfo?: {
      mobile?: string;
      nickname?: string;
      avatar?: string;
      info?: string;
    };
  };
}

export interface LegacyUserInfoResult {
  success: boolean;
  data: {
    avatar: string;
    username: string;
    nickname: string;
    email: string;
    phone: string;
    description: string;
  };
}

export interface BackendCourseListEnvelope {
  code: number;
  msg: string;
  data?: {
    courseList?: Array<{
      courseId: number;
      title: string;
    }>;
  };
}

export interface PaperCourseListResult {
  code: number;
  msg: string;
  data: Array<{
    id: number;
    name: string;
  }>;
}

export declare function adaptUserDetailToMine(
  response: UserDetailEnvelope
): LegacyUserInfoResult;

export declare function adaptBackendCourseListToPaperOptions(
  response: BackendCourseListEnvelope
): PaperCourseListResult;
