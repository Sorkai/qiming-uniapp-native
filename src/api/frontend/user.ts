import { http } from "@/utils/http";

export interface UpdateUserInfoParams {
  nickname?: string; // 昵称（可选）
  sex?: number; // 性别（可选）
  avatar?: string; // 头像地址（可选）
  info?: string; // 个性签名（可选）
}

export interface UpdatePasswordParams {
  oldPassword: string; // 原密码
  newPassword: string; // 新密码
}

export interface ApiResponse<T = any> {
  code: number;
  msg: string;
  data: T;
}

/**
 * 更新前端用户信息
 */
export const updateFrontendUserInfo = (data: UpdateUserInfoParams) => {
  return http.request<ApiResponse>("post", "/edu/frontend/v1/user/update", {
    data
  });
};

/**
 * 修改用户密码
 */
export const updateFrontendUserPassword = (data: UpdatePasswordParams) => {
  return http.request<ApiResponse>(
    "post",
    "/edu/frontend/v1/user/update/password",
    {
      data
    }
  );
};
