<template>
  <div class="user-profile">
    <div class="profile-header">
      <h3>个人资料</h3>
      <div class="action-buttons">
        <el-button type="primary" size="small" @click="openEditDialog">
          <el-icon><Edit /></el-icon>
          修改资料
        </el-button>
        <el-button type="warning" size="small" @click="openPasswordDialog">
          <el-icon><Lock /></el-icon>
          修改密码
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
        <div class="info-item">
          <div class="label">用户名</div>
          <div class="value">{{ userInfo?.username }}</div>
        </div>
        <div class="info-item">
          <div class="label">昵称</div>
          <div class="value">{{ userInfo?.nickname || "未设置" }}</div>
        </div>
        <div class="info-item">
          <div class="label">性别</div>
          <div class="value">{{ getSexLabel }}</div>
        </div>
        <div class="info-item">
          <div class="label">个性签名</div>
          <div class="value">
            {{ userInfo?.info || "这个人很懒，什么都没留下" }}
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
import { Edit, Plus, Lock } from "@element-plus/icons-vue";
import type { FormInstance } from "element-plus";
import { ElMessage } from "element-plus";
import { storageLocal } from "@pureadmin/utils";
import { userKey, removeToken } from "@/utils/auth";
import type { DataInfo } from "@/utils/auth";
import { updateFrontendUserInfo, updateFrontendUserPassword } from "@/api/frontend/user";
import { uploadFile } from "@/api/user";

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
  info: ""
});

// 表单验证规则
const rules = {
  nickname: [{ max: 20, message: "昵称长度不能超过20个字符", trigger: "blur" }],
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
  if (!userInfo.value?.roles) return "普通用户";

  if (userInfo.value.roles.includes("admin")) {
    return "管理员";
  } else if (userInfo.value.roles.includes("teacher")) {
    return "教师";
  } else if (userInfo.value.roles.includes("student")) {
    return "学生";
  }

  return "普通用户";
});

// 计算属性：性别显示
const getSexLabel = computed(() => {
  const sex = userInfo.value?.sex || 0;
  return sex === 1 ? "男" : sex === 2 ? "女" : "保密";
});

// 打开编辑对话框
const openEditDialog = () => {
  avatarUrl.value = userInfo.value?.avatar;
  form.nickname = userInfo.value?.nickname || "";
  form.sex = userInfo.value?.sex || 0;
  form.info = userInfo.value?.info || "";
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
          ElMessage.success("个人资料更新成功");
          dialogVisible.value = false;

          // 更新本地存储的用户信息
          const currentUserInfo = storageLocal().getItem(userKey);
          if (currentUserInfo && typeof currentUserInfo === "object") {
            const updatedInfo = {
              ...(currentUserInfo as Record<string, any>),
              nickname: form.nickname,
              avatar: form.avatar || (currentUserInfo as any).avatar,
              sex: form.sex,
              info: form.info
            };
            storageLocal().setItem(userKey, updatedInfo);
            userInfo.value = updatedInfo;

            // 更新全局状态，使头部和侧边栏的用户信息也能更新
            window.dispatchEvent(
              new CustomEvent("userInfoUpdated", {
                detail: updatedInfo
              })
            );
          }
        } else {
          ElMessage.error(msg || "更新失败，请稍后重试");
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
        if (error.response?.data?.code === 100001 || 
            (typeof error === 'object' && error.toString().includes("原密码新信息错误"))) {
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
onMounted(() => {
  // 可以在这里添加获取用户详情的接口调用
  userInfo.value = storageLocal().getItem(userKey);
});
</script>

<style lang="scss" scoped>
.user-profile {
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
      gap: 10px;
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

    .info-item {
      display: flex;
      margin-bottom: 16px;
      line-height: 24px;

      .label {
        width: 80px;
        font-size: 14px;
        color: #909399;
      }

      .value {
        flex: 1;
        font-size: 14px;
        color: #333;
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
</style>
