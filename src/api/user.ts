import { http } from "@/utils/http";

export type UserResult = {
  success: boolean;
  data: {
    /** 头像 */
    avatar: string;
    /** 用户名 */
    username: string;
    /** 昵称 */
    nickname: string;
    /** 当前登录用户的角色 */
    roles: Array<string>;
    /** 按钮级别权限 */
    permissions: Array<string>;
    /** `token` */
    accessToken: string;
    /** 用于调用刷新`accessToken`的接口时所需的`token` */
    refreshToken: string;
    /** `accessToken`的过期时间（格式'xxxx/xx/xx xx:xx:xx'） */
    expires: Date;
  };
};

export type RefreshTokenResult = {
  success: boolean;
  data: {
    /** `token` */
    accessToken: string;
    /** 用于调用刷新`accessToken`的接口时所需的`token` */
    refreshToken: string;
    /** `accessToken`的过期时间（格式'xxxx/xx/xx xx:xx:xx'） */
    expires: Date;
  };
};

export type UserInfo = {
  /** 头像 */
  avatar: string;
  /** 用户名 */
  username: string;
  /** 昵称 */
  nickname: string;
  /** 邮箱 */
  email: string;
  /** 联系电话 */
  phone: string;
  /** 简介 */
  description: string;
};

export type UserInfoResult = {
  success: boolean;
  data: UserInfo;
};

export type UserCenterLoginResult = {
  code: number;
  msg: string;
  data: {
    accessToken: string;
    accessExpire: number;
    refreshAfter: number;
  };
};

export type UserCenterDetailResult = {
  code: number;
  msg: string;
  data: {
    userInfo: {
      id: number;
      mobile: string;
      nickname: string;
      sex: number;
      avatar: string;
      info: string;
      roleType: number;
      bannerUrl: string;
    };
  };
};

export type UploadResult = {
  code: number;
  msg: string;
  data: {
    url: string;
    fileId: number;
  };
};

export type FileListResult = {
  total: number;
  fileList: Array<{
    fileId: number;
    fileUrl: string;
    fileName: string;
    extension: string;
    size: number;
    resourceType: string;
  }>;
};

export type UserListResult = {
  total: number;
  userList: Array<{
    id: number;
    mobile: string;
    nickname: string;
    sex: number;
    avatar: string;
    info: string;
    roleType: number;
  }>;
};

type ResultTable = {
  success: boolean;
  data?: {
    /** 列表数据 */
    list: Array<any>;
    /** 总条目数 */
    total?: number;
    /** 每页显示条目个数 */
    pageSize?: number;
    /** 当前页数 */
    currentPage?: number;
  };
};

/** 登录 */
export const getLogin = (data?: object) => {
  return http.request<UserResult>("post", "/login", { data });
};

/** 刷新`token` */
export const refreshTokenApi = (data?: object) => {
  return http.request<RefreshTokenResult>("post", "/refresh-token", { data });
};

/** 账户设置-个人信息 */
export const getMine = (data?: object) => {
  return http.request<UserInfoResult>("get", "/mine", { data });
};

/** 账户设置-个人安全日志 */
export const getMineLogs = (data?: object) => {
  return http.request<ResultTable>("get", "/mine-logs", { data });
};

// 新增用户中心接口

/** 用户注册 */
export const userRegister = (data: { mobile: string; password: string }) => {
  return http.request<UserCenterLoginResult>("post", "/edu/v1/user/register", {
    data
  });
};

/** 用户登录 */
export const userLogin = (data: { mobile: string; password: string }) => {
  return http.request<UserCenterLoginResult>("post", "/edu/v1/user/login", {
    data
  });
};

/** 获取用户信息 */
export const getUserDetail = () => {
  return http.request<UserCenterDetailResult>(
    "post",
    "/edu/v1/user/detail",
    {}
  );
};

/** 文件上传 */
export const uploadFile = (data: FormData) => {
  return http.request<UploadResult>(
    "post",
    "/edu/v1/user/upload",
    { data },
    {
      headers: {
        "Content-Type": "multipart/form-data"
      }
    }
  );
};

/** 获取文件列表 */
export const getFileList = (params: { pageNum: number; pageSize?: number }) => {
  return http.request<FileListResult>("get", "/edu/backend/v1/user/file/list", {
    params
  });
};

/** 获取用户列表 */
export const getUserList = (params: {
  pageNum: number;
  pageSize?: number;
  mobile?: string;
}) => {
  return http.request<UserListResult>("get", "/edu/backend/v1/user/list", {
    params
  });
};

/** 修改用户角色 */
export const updateUserRole = (data: {
  targetUserId: number;
  roleType: number;
}) => {
  return http.request<{ code: number; msg: string; data: any }>(
    "post",
    "/edu/backend/v1/user/update/role",
    { data }
  );
};

/** 学生学习统计数据类型 */
export type StudentStatsResult = {
  code: number;
  msg: string;
  data: {
    /** 入驻日期 */
    joinDate: string;
    /** 作业均分 */
    avgScore: number | string;
    /** 个性签名（可选，部分接口返回） */
    signature?: string;
    info?: string;
  };
};

/** 获取学生学习统计数据（入驻日期、作业均分等） */
export const getStudentStats = () => {
  return http.request<StudentStatsResult>(
    "get",
    "/edu/frontend/v1/user/study",
    {}
  );
};

export type UserStatusResult = {
  code: number;
  msg: string;
  data: {
    /** 累计学时 */
    totalHours?: number;
    /** 总体进度（百分比或小数，前端做归一化） */
    totalProgress?: number;
    /** 兜底签名字段（如后端返回） */
    signature?: string;
    info?: string;
  };
};

/** 获取学生状态数据（累计学时、总体进度等） */
export const getUserStatus = () => {
  return http.request<UserStatusResult>(
    "get",
    "/edu/frontend/v1/user/status",
    {}
  );
};

/** 学习动态数据类型 */
export type UserActivity = {
  id: number;
  content: string;
  timestamp: string;
  type: "success" | "primary" | "warning" | "info" | "danger";
  iconName: string;
};

export type UserActivitiesResult = {
  code: number;
  msg: string;
  data: {
    list: Array<UserActivity>;
  };
};

/** 获取学习动态列表 */
export const getUserActivities = () => {
  return http.request<UserActivitiesResult>(
    "get",
    "/edu/frontend/v1/user/activities",
    {}
  );
};
