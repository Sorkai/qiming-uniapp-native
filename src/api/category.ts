import { http } from "@/utils/http";

/**
 * 获取分类列表
 * @param params 请求参数
 */
export const getCategoryList = (params: {
  pageNum: number;
  pageSize?: number;
}) => {
  return http.request<{
    total: number;
    categoryList: Array<{
      categoryId: number;
      name: string;
    }>;
  }>("get", "/course/v1/course/category/list", { params });
};

/**
 * 添加或更新分类
 * @param data 请求参数
 */
export const upsertCategory = (data: {
  categoryId?: number;
  categoryName: string;
}) => {
  return http.request<void>("post", "/course/v1/course/category/upsert", {
    data
  });
};

/**
 * 删除分类
 * @param data 请求参数
 */
export const deleteCategory = (data: { categoryId: number }) => {
  return http.request<void>("post", "/course/v1/course/category/delete", {
    data
  });
};
