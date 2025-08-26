<template>
  <div class="user-profile">
    <!-- 顶部自定义横幅图片区域 -->
    <div class="profile-banner" v-if="extraInfo.bannerUrl || defaultBanner" :style="bannerStyle">
      <div class="banner-overlay">
        <div class="banner-text">
          <div class="banner-title">个人中心</div>
          <div class="banner-sub">定制你的专属空间</div>
        </div>
      </div>
    </div>
    <div class="profile-header">
      <h3>个人资料</h3>
      <div class="action-buttons">
        <el-button class="btn-elevated info" size="small" @click="openEditDialog">
          <el-icon><Edit /></el-icon>
          <span>修改资料</span>
        </el-button>
        <el-button class="btn-elevated warn" size="small" @click="openPasswordDialog">
          <el-icon><Lock /></el-icon>
          <span>修改密码</span>
        </el-button>
      </div>
    </div>

    <div class="profile-content">
      <div class="profile-avatar">
        <el-avatar :size="100" :src="userInfo?.avatar" />
        <div class="user-name">
          {{ userInfo?.nickname || userInfo?.username }}
        </div>
        <div class="user-role">{{ userRole }}</div>
      </div>

      <div class="profile-info">
        <div class="info-group">
          <div class="group-title">基本信息</div>
          <div class="info-item">
            <div class="label">用户名</div>
            <div class="value">{{ userInfo?.username || userInfo?.mobile || "-" }}</div>
          </div>
          <div class="info-item">
            <div class="label">昵称</div>
            <div class="value">{{ userInfo?.nickname || "未设置" }}</div>
          </div>
          <div class="info-item">
            <div class="label">邮箱</div>
            <div class="value email-value">
              <el-icon v-if="extraInfo.email"><Message /></el-icon>
              {{ extraInfo.email || "未设置" }}
              <el-tag v-if="!extraInfo.email" size="small" type="info" effect="plain">建议尽快完善</el-tag>
            </div>
          </div>
          <div class="info-item">
            <div class="label">性别</div>
            <div class="value">{{ getSexLabel }}</div>
          </div>
          <div class="info-item signature">
            <div class="label">个性签名</div>
            <div class="value">
              {{ userInfo?.info || "这个人很懒，什么都没留下" }}
            </div>
          </div>
        </div>
        <div class="info-group timeline">
          <div class="group-title">账户时间</div>
          <div class="info-item">
            <div class="label">注册时间</div>
            <div class="value time-value">
              <el-icon><Calendar /></el-icon>
              {{ formattedRegisterTime }}
            </div>
          </div>
            <div class="info-item">
              <div class="label">最后登录</div>
              <div class="value time-value">
                <el-icon><Calendar /></el-icon>
                {{ formattedLastLoginTime }}
              </div>
            </div>
        </div>
      </div>
    </div>

    <!-- 编辑资料弹窗 -->
    <el-dialog
      v-model="dialogVisible"
      title="修改个人资料"
      width="500px"
      destroy-on-close
      :close-on-click-modal="false"
    >
      <el-form ref="formRef" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="头像">
          <el-upload
            class="avatar-uploader"
            action="#"
            :auto-upload="false"
            :show-file-list="false"
            :on-change="handleAvatarChange"
          >
            <div class="avatar-container">
              <el-avatar v-if="avatarUrl" :src="avatarUrl" :size="100" />
              <el-icon v-else class="avatar-uploader-icon"><Plus /></el-icon>
              <div class="edit-icon">
                <el-icon><Edit /></el-icon>
              </div>
            </div>
          </el-upload>
        </el-form-item>
        <el-form-item label="昵称" prop="nickname">
          <el-input v-model="form.nickname" placeholder="请输入昵称" />
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="form.email" placeholder="请输入邮箱" />
        </el-form-item>
        <el-form-item label="横幅图" prop="bannerUrl">
          <el-input
            v-model="form.bannerUrl"
            placeholder="请输入横幅图片地址（留空使用默认图）"
            clearable
          />
        </el-form-item>
        <el-form-item v-if="form.bannerUrl" label="预览">
          <div class="banner-preview">
            <img :src="form.bannerUrl" alt="banner" />
          </div>
        </el-form-item>
        <el-form-item label="性别">
          <el-radio-group v-model="form.sex">
            <el-radio :label="1">男</el-radio>
            <el-radio :label="2">女</el-radio>
            <el-radio :label="0">保密</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="个性签名" prop="info">
          <el-input
            v-model="form.info"
            type="textarea"
            :rows="4"
            placeholder="请输入个性签名"
            maxlength="200"
            show-word-limit
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="loading" @click="submitForm">
          保存
        </el-button>
      </template>
    </el-dialog>

    <!-- 修改密码弹窗 -->
    <el-dialog
      v-model="passwordDialogVisible"
      title="修改密码"
      width="500px"
      destroy-on-close
      :close-on-click-modal="false"
    >
      <el-form
        ref="passwordFormRef"
        :model="passwordForm"
        :rules="passwordRules"
        label-width="100px"
      >
        <el-form-item label="原密码" prop="oldPassword">
          <el-input
            v-model="passwordForm.oldPassword"
            type="password"
            placeholder="请输入原密码"
            show-password
          />
        </el-form-item>
        <el-form-item label="新密码" prop="newPassword">
          <el-input
            v-model="passwordForm.newPassword"
            type="password"
            placeholder="请输入新密码"
            show-password
          />
        </el-form-item>
        <el-form-item label="确认新密码" prop="confirmPassword">
          <el-input
            v-model="passwordForm.confirmPassword"
            type="password"
            placeholder="请再次输入新密码"
            show-password
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="passwordDialogVisible = false">取消</el-button>
        <el-button
          type="primary"
          :loading="passwordLoading"
          @click="submitPasswordForm"
        >
          确认修改
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, reactive } from "vue";
import { useRouter } from "vue-router";
import { Edit, Plus, Lock, Calendar, Message } from "@element-plus/icons-vue";
import type { FormInstance } from "element-plus";
import { ElMessage } from "element-plus";
import { storageLocal } from "@pureadmin/utils";
import { userKey, removeToken } from "@/utils/auth";
import type { DataInfo } from "@/utils/auth";
import { updateFrontendUserInfo, updateFrontendUserPassword } from "@/api/frontend/user";
import { uploadFile, getUserDetail } from "@/api/user";
import dayjs from "dayjs";

const router = useRouter();
const defaultAvatar = "/src/assets/user.jpg";
const dialogVisible = ref(false);
const loading = ref(false);
const userInfo = ref<DataInfo<number> | any>(storageLocal().getItem(userKey));

// 修改密码相关
const passwordDialogVisible = ref(false);
const passwordLoading = ref(false);
const passwordFormRef = ref<FormInstance>();
const passwordForm = reactive({
  oldPassword: "",
  newPassword: "",
  confirmPassword: ""
});

const formRef = ref<FormInstance>();
const avatarUrl = ref("");

// 表单数据
const form = reactive({
  nickname: "",
  sex: 0,
  avatar: "",
  info: "",
  email: "",
  bannerUrl: ""
});

// 额外前端模拟信息（注册时间、最后登录时间、邮箱）
const EXTRA_KEY = "userExtraInfo";
interface ExtraInfo {
  registrationTime: string; // ISO string
  lastLoginTime: string; // ISO string
  email?: string;
  bannerUrl?: string;
}
const extraInfo = reactive<ExtraInfo>({
  registrationTime: "",
  lastLoginTime: "",
  email: "",
  bannerUrl: ""
});

const loadExtraInfo = () => {
  try {
    const cached = storageLocal().getItem(EXTRA_KEY) as ExtraInfo | null;
    if (cached && cached.registrationTime) {
      Object.assign(extraInfo, cached, { lastLoginTime: dayjs().toISOString() });
    } else {
      extraInfo.registrationTime = dayjs().toISOString();
      extraInfo.lastLoginTime = dayjs().toISOString();
    }
    persistExtra();
  } catch (e) {
    console.warn("读取额外信息失败", e);
  }
};

const persistExtra = () => {
  storageLocal().setItem(EXTRA_KEY, { ...extraInfo });
};

// 表单验证规则
const emailValidator = (rule, value, callback) => {
  if (!value) return callback();
  const emailRegex = /^(?:[\w!#$%&'*+/=?`{|}~^-]+(?:\.[\w!#$%&'*+/=?`{|}~^-]+)*)@(?:[A-Z0-9-]+\.)+[A-Z]{2,}$/i;
  if (!emailRegex.test(value)) callback(new Error("邮箱格式不正确"));
  else callback();
};

const rules = {
  nickname: [{ max: 20, message: "昵称长度不能超过20个字符", trigger: "blur" }],
  email: [{ validator: emailValidator, trigger: "blur" }],
  info: [
    { max: 200, message: "个性签名长度不能超过200个字符", trigger: "blur" }
  ]
};

// 密码表单验证规则
const validateConfirmPassword = (rule, value, callback) => {
  if (value === "") {
    callback(new Error("请再次输入新密码"));
  } else if (value !== passwordForm.newPassword) {
    callback(new Error("两次输入的密码不一致"));
  } else {
    callback();
  }
};

const passwordRules = {
  oldPassword: [
    { required: true, message: "请输入原密码", trigger: "blur" },
    { min: 6, message: "密码长度不能少于6个字符", trigger: "blur" }
  ],
  newPassword: [
    { required: true, message: "请输入新密码", trigger: "blur" },
    { min: 6, message: "密码长度不能少于6个字符", trigger: "blur" }
  ],
  confirmPassword: [
    { required: true, message: "请再次输入新密码", trigger: "blur" },
    { validator: validateConfirmPassword, trigger: "blur" }
  ]
};

// 计算属性：用户角色展示
const userRole = computed(() => {
  const roleType = userInfo.value?.roleType;
  switch (roleType) {
    case 1:
      return "学生";
    case 2:
      return "教师";
    case 3:
      return "管理员";
    default:
      return "普通用户";
  }
});

// 计算属性：性别显示
const getSexLabel = computed(() => {
  const sex = userInfo.value?.sex || 0;
  return sex === 1 ? "男" : sex === 2 ? "女" : "保密";
});

// 获取用户详情
const fetchUserDetail = async () => {
  try {
    const res = await getUserDetail();
    if (res.code === 200) {
      userInfo.value = res.data.userInfo; // 修改这里，从res.data.userInfo获取
      storageLocal().setItem(userKey, res.data.userInfo); // 更新缓存
      // ElMessage.success("用户信息已更新"); // 移除此行
    } else {
      ElMessage.error(res.msg || "获取用户信息失败");
    }
  } catch (error) {
    ElMessage.error("获取用户信息失败");
    console.error("获取用户信息失败", error);
  }
};

// 打开编辑对话框
const openEditDialog = () => {
  if (userInfo.value) {
    form.nickname = userInfo.value.nickname || "";
    form.sex = userInfo.value.sex || 0;
    form.info = userInfo.value.info || "";
    form.email = extraInfo.email || "";
    form.bannerUrl = extraInfo.bannerUrl || "";
    avatarUrl.value = userInfo.value.avatar || defaultAvatar;
  }
  dialogVisible.value = true;
};

// 处理头像变更
const handleAvatarChange = async file => {
  const isJPG = file.type === "image/jpeg";
  const isPNG = file.type === "image/png";
  const isLt2M = file.size / 1024 / 1024 < 2;

  if (!isLt2M) {
    ElMessage.error("头像图片大小不能超过 2MB!");
    return false;
  }

  // 本地预览
  avatarUrl.value = URL.createObjectURL(file.raw);

  try {
    // 使用FormData上传文件
    const formData = new FormData();
    formData.append("file", file.raw);

    // 上传头像
    const { code, msg, data } = await uploadFile(formData);

    if (code === 200 && data?.url) {
      form.avatar = data.url;
      ElMessage.success("头像上传成功");
    } else {
      ElMessage.error(msg || "头像上传失败");
    }
  } catch (error) {
    console.error("上传头像失败:", error);
    ElMessage.error("上传头像失败，请稍后重试");
  }
};

// 提交表单
const submitForm = async () => {
  if (!formRef.value) return;

  await formRef.value.validate(async valid => {
    if (valid) {
      try {
        loading.value = true;

        // 构建要更新的数据
        const updateData: {
          nickname: string;
          sex: number;
          info: string;
          avatar?: string;
        } = {
          nickname: form.nickname,
          sex: form.sex,
          info: form.info
        };

        // 如果头像有更新
        if (form.avatar) {
          updateData.avatar = form.avatar;
        }

  const { code, msg } = await updateFrontendUserInfo(updateData);

        if (code === 200) {
          // 前端模拟保存邮箱
            extraInfo.email = form.email || "";
            extraInfo.bannerUrl = form.bannerUrl || "";
            persistExtra();
            ElMessage.success("资料修改成功");
            dialogVisible.value = false;
            fetchUserDetail(); // 重新获取用户信息
        } else {
          ElMessage.error(msg || "资料修改失败");
        }
      } catch (error) {
        console.error("更新个人资料失败:", error);
        ElMessage.error("系统错误，请稍后重试");
      } finally {
        loading.value = false;
      }
    }
  });
};

// 打开修改密码对话框
const openPasswordDialog = () => {
  passwordForm.oldPassword = "";
  passwordForm.newPassword = "";
  passwordForm.confirmPassword = "";
  passwordDialogVisible.value = true;
};

// 提交密码修改表单
const submitPasswordForm = async () => {
  if (!passwordFormRef.value) return;

  await passwordFormRef.value.validate(async valid => {
    if (valid) {
      try {
        passwordLoading.value = true;

        const { code, msg } = await updateFrontendUserPassword({
          oldPassword: passwordForm.oldPassword,
          newPassword: passwordForm.newPassword
        });

        if (code === 200) {
          ElMessage.success("密码修改成功，即将退出登录");
          passwordDialogVisible.value = false;

          // 延迟1.5秒后退出登录，让用户看到成功提示
          setTimeout(() => {
            // 清除登录信息
            removeToken();
            // 跳转到首页
            router.push("/home");
          }, 1500);
        } else {
          // 处理特定错误码
          if (code === 100001) {
            ElMessage.error("原密码错误，请重新输入");
            // 清空原密码输入框，便于用户重新输入
            passwordForm.oldPassword = "";
          } else {
            ElMessage.error(msg || "密码修改失败，请稍后重试");
          }
        }
      } catch (error) {
        console.error("修改密码失败:", error);
        // 检查是否包含特定错误信息
        if (
          error.response?.data?.code === 100001 ||
          (typeof error === "object" &&
            error.toString().includes("原密码新信息错误"))
        ) {
          ElMessage.error("原密码错误，请重新输入");
          passwordForm.oldPassword = "";
        } else {
          ElMessage.error("系统错误，请稍后重试");
        }
      } finally {
        passwordLoading.value = false;
      }
    }
  });
};

// 组件挂载时获取最新用户信息
// 时间与展示格式化
const formattedRegisterTime = computed(() =>
  extraInfo.registrationTime ? dayjs(extraInfo.registrationTime).format("YYYY-MM-DD HH:mm:ss") : "-"
);
const formattedLastLoginTime = computed(() =>
  extraInfo.lastLoginTime ? dayjs(extraInfo.lastLoginTime).format("YYYY-MM-DD HH:mm:ss") : "-"
);

// 横幅默认图片与样式
const defaultBanner = '/src/assets/course/cover-default.jpg';
const bannerStyle = computed(() => {
  const url = extraInfo.bannerUrl || defaultBanner;
  return { backgroundImage: `url(${url})` };
});

onMounted(() => {
  loadExtraInfo();
  fetchUserDetail();
});
</script>

<style lang="scss" scoped>
.user-profile {
  .profile-banner {
    position: relative;
    width: 100%;
    height: 180px;
    margin: 0 0 24px;
    background-size: cover;
    background-position: center center;
    background-repeat: no-repeat;
    border-radius: 16px;
    overflow: hidden;
    box-shadow: 0 6px 18px -4px rgba(0,0,0,0.12);
    display: flex;
    align-items: flex-end;
    .banner-overlay {
      position: absolute;
      inset: 0;
      background: linear-gradient(to bottom, rgba(0,0,0,0.15), rgba(0,0,0,0.55));
      display: flex;
      align-items: flex-end;
      padding: 18px 24px;
    }
    .banner-text { color: #fff; }
    .banner-title { font-size: 20px; font-weight: 600; letter-spacing: .5px; }
    .banner-sub { font-size: 12px; opacity: .85; margin-top: 4px; }
  }
  .profile-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 24px;

    h3 {
      margin: 0;
      font-size: 18px;
      font-weight: 600;
      color: #333;
    }

    .action-buttons {
      display: flex;
      gap: 12px;

      .btn-elevated {
        display: inline-flex;
        align-items: center;
        gap: 4px;
        padding: 6px 14px;
        font-weight: 500;
        border: none;
        position: relative;
        overflow: hidden;
        border-radius: 6px;
        background: linear-gradient(135deg, #6366f1, #8b5cf6);
        color: #fff;
        box-shadow: 0 4px 12px rgba(99, 102, 241, 0.35);
        transition: transform 0.2s, box-shadow 0.2s;

        &.warn {
          background: linear-gradient(135deg, #f59e0b, #f97316);
          box-shadow: 0 4px 12px rgba(251, 146, 60, 0.35);
        }
        &.info {
          background: linear-gradient(135deg, #3b82f6, #6366f1);
        }
        &:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 16px rgba(99, 102, 241, 0.45);
          &.warn {
            box-shadow: 0 6px 16px rgba(251, 146, 60, 0.45);
          }
        }
        &:active {
          transform: translateY(0);
        }
      }
    }
  }

  .profile-content {
    display: flex;
    gap: 40px;

    @media (max-width: 768px) {
      flex-direction: column;
      gap: 20px;
    }
  }

  .profile-avatar {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 24px;
    text-align: center;
    background-color: #f9f9f9;
    border-radius: 8px;

    .el-avatar {
      margin-bottom: 16px;
      box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
    }

    .user-name {
      margin-bottom: 4px;
      font-size: 18px;
      font-weight: 600;
      color: #333;
    }

    .user-role {
      padding: 2px 8px;
      font-size: 12px;
      color: #fff;
      background-color: #6b46c1;
      border-radius: 12px;
    }
  }

  .profile-info {
    flex: 1;
    display: flex;
    gap: 32px;
    flex-wrap: wrap;

    .info-group {
      flex: 1 1 320px;
      background: linear-gradient(145deg, #ffffff, #f3f4f6);
      border: 1px solid #eef0f4;
      border-radius: 12px;
      padding: 18px 22px 8px;
      position: relative;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.04);
      backdrop-filter: blur(4px);
      transition: box-shadow .25s, transform .25s;

      &:hover {
        box-shadow: 0 8px 22px -4px rgba(0,0,0,0.08);
        transform: translateY(-2px);
      }

      &.timeline {
        background: linear-gradient(135deg,#fdfbfb,#ebedee);
      }

      .group-title {
        font-size: 15px;
        font-weight: 600;
        color: #374151;
        margin-bottom: 14px;
        position: relative;
        padding-left: 10px;
        &::before {
          content: '';
          position: absolute;
          left: 0;
          top: 3px;
          width: 4px;
          height: 14px;
          border-radius: 2px;
          background: linear-gradient(180deg,#6366f1,#8b5cf6);
        }
      }

      .info-item {
        display: flex;
        margin-bottom: 14px;
        line-height: 20px;
        font-size: 13px;
        align-items: flex-start;
        .label {
          width: 72px;
          color: #6b7280;
          font-weight: 500;
        }
        .value {
          flex: 1;
          color: #1f2937;
          display: flex;
          align-items: center;
          gap: 6px;
          word-break: break-all;
        }
        &.signature .value {
          line-height: 1.4;
          white-space: pre-wrap;
        }
        .time-value {
          .el-icon { color: #6366f1; }
        }
        .email-value {
          .el-icon { color: #10b981; }
        }
      }
    }
  }
}

.avatar-uploader {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100%;
  text-align: center;

  .avatar-container {
    position: relative;
    cursor: pointer;

    .avatar-uploader-icon {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 100px;
      height: 100px;
      font-size: 28px;
      color: #8c939d;
      background: #f5f7fa;
      border: 1px dashed #d9d9d9;
      border-radius: 50%;
    }

    .edit-icon {
      position: absolute;
      right: 0;
      bottom: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      width: 24px;
      height: 24px;
      color: #fff;
      background-color: #409eff;
      border-radius: 50%;
      box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15);

      .el-icon {
        font-size: 14px;
      }
    }
  }
}

.banner-preview {
  width: 100%;
  max-height: 120px;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 4px 10px -2px rgba(0,0,0,0.06);
  img { width: 100%; height: 100%; object-fit: cover; display: block; }
}

@media (max-width: 768px) {
  .user-profile {
    .profile-info { flex-direction: column; }
  }
}
</style>
