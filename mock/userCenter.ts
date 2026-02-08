// 用户中心接口 mock 数据
import { defineFakeRoute } from "vite-plugin-fake-server/client";

// 模拟用户数据
const mockUsers = {
  // 学生账号
  student: {
    id: 1001,
    mobile: "13800000001",
    nickname: "学生小明",
    sex: 1,
    avatar: "https://avatars.githubusercontent.com/u/44761321",
    info: "我是一名学生",
    roleType: 1, // 学生
    bannerUrl: ""
  },
  // 教师账号
  teacher: {
    id: 1002,
    mobile: "13800000002",
    nickname: "教师张老师",
    sex: 1,
    avatar: "https://avatars.githubusercontent.com/u/52823142",
    info: "我是一名教师",
    roleType: 2, // 教师
    bannerUrl: ""
  },
  // 管理员账号
  admin: {
    id: 1003,
    mobile: "13800000003",
    nickname: "管理员李总",
    sex: 1,
    avatar: "https://avatars.githubusercontent.com/u/44761321",
    info: "我是管理员",
    roleType: 3, // 管理员
    bannerUrl: ""
  }
};

// 根据手机号获取用户
function getUserByMobile(mobile: string) {
  // 默认登录规则：
  // - 手机号以1结尾：学生
  // - 手机号以2结尾：教师
  // - 手机号以3结尾：管理员
  // - 其他：学生
  if (mobile.endsWith("1")) {
    return { ...mockUsers.student, mobile };
  } else if (mobile.endsWith("2")) {
    return { ...mockUsers.teacher, mobile };
  } else if (mobile.endsWith("3")) {
    return { ...mockUsers.admin, mobile };
  }
  return { ...mockUsers.student, mobile };
}

// 存储当前登录用户（用于 detail 接口）
let currentUser: any = null;

export default defineFakeRoute([
  // 用户登录
  {
    url: "/edu/v1/user/login",
    method: "post",
    response: ({ body }) => {
      const { mobile } = body;

      // 简单验证（mock 模式下密码任意即可）
      if (!mobile) {
        return {
          success: false,
          code: 400,
          msg: "手机号不能为空",
          data: null
        };
      }

      // 保存当前用户 (使用副本避免污染原始数据)
      currentUser = { ...getUserByMobile(mobile) };

      return {
        success: true,
        code: 200,
        msg: "登录成功",
        data: {
          accessToken: `mock_token_${Date.now()}_${currentUser.roleType}`,
          accessExpire: Math.floor(Date.now() / 1000) + 86400 * 7, // 7天后过期
          refreshAfter: Math.floor(Date.now() / 1000) + 86400 * 3 // 3天后刷新
        }
      };
    }
  },
  // 用户注册
  {
    url: "/edu/v1/user/register",
    method: "post",
    response: ({ body }) => {
      const { mobile, password } = body;

      if (!mobile || !password) {
        return {
          success: false,
          code: 400,
          msg: "手机号和密码不能为空",
          data: null
        };
      }

      return {
        success: true,
        code: 200,
        msg: "注册成功",
        data: {
          accessToken: `mock_token_${Date.now()}_1`,
          accessExpire: Math.floor(Date.now() / 1000) + 86400 * 7,
          refreshAfter: Math.floor(Date.now() / 1000) + 86400 * 3
        }
      };
    }
  },
  // 获取用户详情
  {
    url: "/edu/v1/user/detail",
    method: "post",
    response: () => {
      if (!currentUser) {
        currentUser = { ...mockUsers.student };
      }

      return {
        success: true,
        code: 200,
        msg: "获取成功",
        data: {
          userInfo: currentUser
        }
      };
    }
  },
  // 更新用户信息
  {
    url: "/edu/frontend/v1/user/update",
    method: "post",
    response: ({ body }) => {
      if (!currentUser) {
        currentUser = { ...mockUsers.student };
      }
      // 兼容可能存在的 data 层级包裹，并确保解析逻辑健壮
      const updateData = body?.data || body || {};

      // 增量合并用户信息，模拟后端持久化
      currentUser = {
        ...currentUser,
        ...updateData
      };

      return {
        success: true,
        code: 200,
        msg: "更新成功",
        data: {
          userInfo: currentUser
        }
      };
    }
  },
  // 文件上传 mock
  {
    url: "/edu/v1/user/upload",
    method: "post",
    response: () => {
      // 随机返回一个图片地址，避免固定的头像地址导致横幅预览混淆
      const randomId = Math.floor(Math.random() * 1000);
      return {
        success: true,
        code: 200,
        msg: "上传成功",
        data: {
          url: `https://picsum.photos/seed/${randomId}/1200/400`,
          fileId: Date.now()
        }
      };
    }
  },
  // 获取学习动态 mock
  {
    url: "/edu/frontend/v1/user/activities",
    method: "get",
    response: () => {
      return {
        success: true,
        code: 200,
        msg: "获取成功",
        data: {
          list: [
            {
              id: 1,
              content: "完成了《Python 基础入门》第三章的学习",
              timestamp: "10分钟前",
              type: "success",
              iconName: "CheckIcon"
            },
            {
              id: 2,
              content: "提交了《Web 前端开发》的中期作业",
              timestamp: "2小时前",
              type: "primary",
              iconName: "EmailIcon"
            },
            {
              id: 3,
              content: "开始学习新课程《人工智能导论》",
              timestamp: "昨天",
              type: "warning",
              iconName: "PlayIcon"
            },
            {
              id: 4,
              content: "《数据结构与算法》课程进度达到 60%",
              timestamp: "2天前",
              type: "info",
              iconName: "TrendIcon"
            }
          ]
        }
      };
    }
  }
]);
