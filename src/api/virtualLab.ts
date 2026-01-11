import { http } from "@/utils/http";

/**
 * 获取实验列表
 */
export const getLabList = (params: {
  pageNum: number;
  pageSize?: number;
  title?: string;
  category?: string;
  status?: number | string;
}) => {
  return http.request<{
    code: number;
    msg: string;
    data: {
      total: number;
      labList: Array<{
        labId: number;
        title: string;
        icon: string;
        description: string;
        category: "animation" | "game" | "simulation";
        difficulty: "easy" | "medium" | "hard";
        duration: string;
        url: string;
        gradient: string;
        featured: boolean;
        status: number;
        viewCount: number;
        createTime: string;
      }>;
    };
  }>("get", "/edu/backend/v1/virtual-lab/list", { params });
};

/**
 * 获取实验统计数据
 */
export const getLabStats = () => {
  return http.request<{
    code: number;
    msg: string;
    data: {
      totalLabs: number;
      activeLabs: number;
      totalViews: number;
    };
  }>("get", "/edu/backend/v1/virtual-lab/stats");
};

/**
 * 添加或更新实验
 */
export const upsertLab = (data: {
  labId?: number;
  title: string;
  icon: string;
  description: string;
  category: string;
  difficulty: string;
  duration: string;
  url: string;
  gradient?: string;
  featured?: boolean;
  status: number;
}) => {
  return http.request<void>("post", "/edu/backend/v1/virtual-lab/upsert", {
    data
  });
};

/**
 * 删除实验
 */
export const deleteLab = (data: { labId: number }) => {
  return http.request<void>("post", "/edu/backend/v1/virtual-lab/delete", {
    data
  });
};
