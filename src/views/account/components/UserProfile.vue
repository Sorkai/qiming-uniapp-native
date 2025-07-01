<template>
  <div class="user-profile">
    <div class="profile-header">
      <h3>个人资料</h3>
      <el-button type="primary" size="small" @click="openEditDialog">
        <el-icon><Edit /></el-icon>
        修改资料
      </el-button>
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
            <el-avatar v-if="avatarUrl" :src="avatarUrl" :size="100" />
            <el-icon v-else class="avatar-uploader-icon"><Plus /></el-icon>
            <div class="el-upload__text">点击上传头像</div>
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
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, reactive } from "vue";
import { Edit, Plus } from "@element-plus/icons-vue";
import type { FormInstance } from "element-plus";
import { ElMessage } from "element-plus";
import { storageLocal } from "@pureadmin/utils";
import { userKey } from "@/utils/auth";
import type { DataInfo } from "@/utils/auth";
import { updateFrontendUserInfo } from "@/api/frontend/user";

const defaultAvatar = "/src/assets/user.jpg";
const dialogVisible = ref(false);
const loading = ref(false);
const userInfo = ref<DataInfo<number> | any>(storageLocal().getItem(userKey));

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
const handleAvatarChange = file => {
  const isJPG = file.type === "image/jpeg";
  const isPNG = file.type === "image/png";
  const isLt2M = file.size / 1024 / 1024 < 2;

  if (!isLt2M) {
    ElMessage.error("头像图片大小不能超过 2MB!");
    return false;
  }

  // 这里只做本地预览，实际项目中应该上传到服务器并获取URL
  avatarUrl.value = URL.createObjectURL(file.raw);

  // 模拟上传，实际项目中应该使用上传接口
  // 示例: 使用FormData上传文件
  /*
  const formData = new FormData();
  formData.append('avatar', file.raw);
  // 上传头像的API调用
  uploadAvatar(formData).then(res => {
    if (res.code === 200) {
      form.avatar = res.data.url;
    }
  });
  */

  // 临时设置一个URL，实际项目中应该使用上传接口返回的URL
  form.avatar = avatarUrl.value;
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
    cursor: pointer;
  }

  .el-upload__text {
    margin-top: 10px;
    font-size: 12px;
    color: #606266;
  }
}
</style>
