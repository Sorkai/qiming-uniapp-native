<template>
  <el-dialog
    :model-value="visible"
    :title="null"
    width="400px"
    top="85px"
    :show-close="true"
    :close-on-click-modal="false"
    :lock-scroll="true"
    :modal-class="'login-dialog-modal'"
    custom-class="zhs-login-dialog"
    @update:model-value="emit('update:visible', $event)"
  >
    <div class="login-container">
      <div class="login-header">
        <div class="login-logo">
          <img src="@/assets/logo.png" alt="Logo" />
        </div>
        <!-- <div class="login-title">账号登录</div> -->
      </div>

      <!-- 登录表单 -->
      <div v-if="!isRegister">
        <div class="login-tabs">
          <div
            class="tab-item"
            :class="{ active: activeTab === 'account' }"
            @click="activeTab = 'account'"
          >
            密码登录
          </div>
          <div
            class="tab-item"
            :class="{ active: activeTab === 'phone' }"
            @click="activeTab = 'phone'"
          >
            验证码登录
          </div>
        </div>

        <!-- 账号密码登录 -->
        <div v-show="activeTab === 'account'" class="login-form">
          <div class="form-item">
            <el-input
              v-model="loginForm.username"
              placeholder="请输入手机号/邮箱"
              :class="{ 'is-error': errors.username }"
            >
              <template #prefix>
                <Icon icon="mdi:account" />
              </template>
            </el-input>
            <div v-if="errors.username" class="error-message">
              {{ errors.username }}
            </div>
          </div>
          <div class="form-item">
            <el-input
              v-model="loginForm.password"
              type="password"
              placeholder="请输入密码"
              :class="{ 'is-error': errors.password }"
              show-password
            >
              <template #prefix>
                <Icon icon="mdi:lock" />
              </template>
            </el-input>
            <div v-if="errors.password" class="error-message">
              {{ errors.password }}
            </div>
          </div>
        </div>

        <!-- 手机验证码登录 -->
        <div v-show="activeTab === 'phone'" class="login-form">
          <div class="form-item">
            <el-input
              v-model="phoneForm.phone"
              placeholder="请输入手机号"
              :class="{ 'is-error': errors.phone }"
            >
              <template #prefix>
                <Icon icon="mdi:cellphone" />
              </template>
            </el-input>
            <div v-if="errors.phone" class="error-message">
              {{ errors.phone }}
            </div>
          </div>
          <div class="form-item verification-code">
            <el-input
              v-model="phoneForm.code"
              placeholder="请输入验证码"
              :class="{ 'is-error': errors.code }"
            >
              <template #prefix>
                <Icon icon="mdi:shield-key-outline" />
              </template>
            </el-input>
            <button
              class="code-button"
              :class="{ disabled: countdown > 0 }"
              @click="sendCode"
            >
              {{ countdown > 0 ? `${countdown}s` : "获取验证码" }}
            </button>
            <div v-if="errors.code" class="error-message">
              {{ errors.code }}
            </div>
          </div>
        </div>

        <div class="login-options">
          <el-checkbox v-model="rememberMe">记住密码</el-checkbox>
          <a href="javascript:;" class="forget-password">忘记密码？</a>
        </div>

        <el-button
          type="primary"
          class="login-button"
          :loading="loading"
          @click="handleLogin"
        >
          登录
        </el-button>

        <!-- <div class="other-login">
          <div class="divider">
            <span>其他登录方式</span>
          </div>
          <div class="social-login">
            <div class="social-item">
              <Icon icon="mdi:wechat" />
            </div>
            <div class="social-item">
              <Icon icon="mdi:qqchat" />
            </div>
          </div>
        </div> -->

        <div class="register-link">
          还没有账号？<a href="javascript:;" @click="isRegister = true"
            >立即注册</a
          >
        </div>
      </div>

      <!-- 注册表单 -->
      <div v-else class="register-form">
        <div class="form-header">
          <h3>注册账号</h3>
          <a
            href="javascript:;"
            class="back-to-login"
            @click="isRegister = false"
          >
            返回登录
          </a>
        </div>

        <div class="login-form">
          <div class="form-item">
            <el-input
              v-model="registerForm.phone"
              placeholder="请输入手机号"
              :class="{ 'is-error': errors.registerPhone }"
            >
              <template #prefix>
                <Icon icon="mdi:cellphone" />
              </template>
            </el-input>
            <div v-if="errors.registerPhone" class="error-message">
              {{ errors.registerPhone }}
            </div>
          </div>

          <div class="form-item">
            <el-input
              v-model="registerForm.password"
              type="password"
              placeholder="请设置密码"
              :class="{ 'is-error': errors.registerPassword }"
              show-password
            >
              <template #prefix>
                <Icon icon="mdi:lock" />
              </template>
            </el-input>
            <div v-if="errors.registerPassword" class="error-message">
              {{ errors.registerPassword }}
            </div>
          </div>

          <div class="form-item">
            <el-input
              v-model="registerForm.confirmPassword"
              type="password"
              placeholder="请确认密码"
              :class="{ 'is-error': errors.confirmPassword }"
              show-password
            >
              <template #prefix>
                <Icon icon="mdi:lock-check" />
              </template>
            </el-input>
            <div v-if="errors.confirmPassword" class="error-message">
              {{ errors.confirmPassword }}
            </div>
          </div>
        </div>

        <el-button
          type="primary"
          class="login-button"
          :loading="registerLoading"
          @click="handleRegister"
        >
          注册
        </el-button>
      </div>
    </div>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, reactive } from "vue";
import type { PropType } from "vue";
import { ElMessage } from "element-plus";
import { Icon } from "@iconify/vue";
import { useUserStoreHook } from "@/store/modules/user";
import { message } from "@/utils/message";
import { useI18n } from "vue-i18n";
import { userRegister, userLogin, getUserDetail } from "@/api/user";
import { setToken, getToken } from "@/utils/auth";

interface LoginForm {
  username: string;
  password: string;
}

interface PhoneForm {
  phone: string;
  code: string;
}

interface Errors {
  username: string;
  password: string;
  phone: string;
  code: string;
}

interface RegisterForm {
  phone: string;
  password: string;
  confirmPassword: string;
}

interface RegisterErrors {
  registerPhone: string;
  registerPassword: string;
  confirmPassword: string;
}

const props = defineProps({
  visible: {
    type: Boolean as PropType<boolean>,
    required: true
  }
});

const emit = defineEmits<{
  (e: "update:visible", value: boolean): void;
  (e: "login-success"): void;
}>();

const { t } = useI18n();
const activeTab = ref<"account" | "phone">("account");
const loading = ref(false);
const rememberMe = ref(false);
const countdown = ref(0);

const loginForm = reactive<LoginForm>({
  username: "",
  password: ""
});

const phoneForm = reactive<PhoneForm>({
  phone: "",
  code: ""
});

const isRegister = ref(false);
const registerLoading = ref(false);

const registerForm = reactive<RegisterForm>({
  phone: "",
  password: "",
  confirmPassword: ""
});

// 合并错误对象
const errors = reactive<Errors & RegisterErrors>({
  username: "",
  password: "",
  phone: "",
  code: "",
  registerPhone: "",
  registerPassword: "",
  confirmPassword: ""
});

// 发送验证码
const sendCode = async () => {
  if (countdown.value > 0) return;
  if (!phoneForm.phone) {
    errors.phone = "请输入手机号";
    return;
  }
  if (!/^1[3-9]\d{9}$/.test(phoneForm.phone)) {
    errors.phone = "请输入正确的手机号";
    return;
  }

  countdown.value = 60;
  const timer = setInterval(() => {
    countdown.value--;
    if (countdown.value <= 0) {
      clearInterval(timer);
    }
  }, 1000);

  // TODO: 调用发送验证码接口
  ElMessage.success("验证码已发送");
};

// 获取用户详细信息
const fetchUserDetail = async () => {
  try {
    const res = await getUserDetail();
    console.log("用户详细信息:", res);

    if (res && res.data && res.data.userInfo) {
      const userInfo = res.data.userInfo;

      // 更新用户信息到存储，但保持admin角色不变
      const userStore = useUserStoreHook();
      userStore.SET_NICKNAME(userInfo.nickname || "");
      userStore.SET_AVATAR(userInfo.avatar || "");

      // 更新本地存储中的用户信息，保持角色和权限不变
      setToken({
        // 使用当前token，不变更token相关信息
        accessToken: getToken()?.accessToken || "",
        refreshToken: getToken()?.refreshToken || "",
        expires: getToken()?.expires
          ? new Date(getToken().expires)
          : new Date(),
        // 更新用户详细信息
        username: userInfo.mobile,
        nickname: userInfo.nickname,
        avatar: userInfo.avatar,
        // 重要：保持 admin 角色以确保菜单正常显示
        roles: ["admin"],
        // 添加一些常用权限
        permissions: ["*:*:*"],
        // 添加角色类型 1:学生 2:教师 3:管理员
        roleType: userInfo.roleType
      });

      // 存储用户ID和其他信息到localStorage
      localStorage.setItem("userId", userInfo.id.toString());
      localStorage.setItem("userMobile", userInfo.mobile);
      localStorage.setItem("userSex", userInfo.sex.toString());
      localStorage.setItem("userInfo", userInfo.info || "");
      localStorage.setItem("userRoleType", userInfo.roleType.toString());

      console.log("用户信息更新成功", userInfo);
    } else {
      console.warn("获取用户详细信息失败或信息为空");
    }

    return res;
  } catch (error) {
    console.error("获取用户详细信息出错:", error);
    return null;
  }
};

// 登录处理
const handleLogin = async () => {
  // 账号密码登录处理
  if (activeTab.value === "account") {
    // 清除错误信息
    errors.username = "";
    errors.password = "";

    // 表单验证
    if (!loginForm.username) {
      errors.username = "请输入手机号";
      return;
    }
    if (!loginForm.password) {
      errors.password = "请输入密码";
      return;
    }

    loading.value = true;
    try {
      // 调用登录API
      const res = await userLogin({
        mobile: loginForm.username,
        password: loginForm.password
      });

      console.log("登录结果:", res);

      // 存储token信息
      if (res && res.data && res.data.accessToken) {
        setToken({
          accessToken: res.data.accessToken,
          expires: new Date(res.data.accessExpire * 1000), // 转换为日期对象
          refreshToken: res.data.accessToken, // 后端没有提供refreshToken，暂时使用accessToken代替
          username: loginForm.username,
          nickname: loginForm.username,
          // 重要：保持 admin 角色以确保菜单正常显示
          roles: ["admin"],
          // 添加一些常用权限
          permissions: ["*:*:*"]
        });

        // 获取用户详细信息
        await fetchUserDetail();

        message(t("login.pureLoginSuccess"), { type: "success" });

        // 刷新页面以确保菜单重新加载
        // window.location.reload();

        emit("login-success");
        emit("update:visible", false);
      } else {
        message(t("login.pureLoginFail"), { type: "error" });
      }
    } catch (error) {
      console.error("登录失败:", error);
      message(t("login.pureLoginFail"), { type: "error" });
    } finally {
      loading.value = false;
    }
  } else {
    // 手机验证码登录处理
    errors.phone = "";
    errors.code = "";

    if (!phoneForm.phone) {
      errors.phone = "请输入手机号";
      return;
    }
    if (!phoneForm.code) {
      errors.code = "请输入验证码";
      return;
    }

    loading.value = true;
    try {
      // TODO: 实现手机验证码登录
      await new Promise(resolve => setTimeout(resolve, 1000));
      ElMessage.success("登录成功");
      emit("login-success");
      emit("update:visible", false);
    } catch (error) {
      ElMessage.error("登录失败");
    } finally {
      loading.value = false;
    }
  }
};

// 注册处理
const handleRegister = async () => {
  // 清除错误提示
  Object.keys(errors).forEach(key => {
    if (key.startsWith("register")) {
      errors[key as keyof RegisterErrors] = "";
    }
  });

  // 表单验证
  if (!registerForm.phone) {
    errors.registerPhone = "请输入手机号";
    return;
  }
  if (!registerForm.password) {
    errors.registerPassword = "请设置密码";
    return;
  }
  if (!registerForm.confirmPassword) {
    errors.confirmPassword = "请确认密码";
    return;
  }
  if (registerForm.password !== registerForm.confirmPassword) {
    errors.confirmPassword = "两次输入的密码不一致";
    return;
  }

  registerLoading.value = true;
  try {
    // 调用注册API
    const res = await userRegister({
      mobile: registerForm.phone,
      password: registerForm.password
    });

    console.log("注册结果:", res);

    // 存储token信息
    if (res && res.data && res.data.accessToken) {
      setToken({
        accessToken: res.data.accessToken,
        expires: new Date(res.data.accessExpire * 1000), // 转换为日期对象
        refreshToken: res.data.accessToken, // 后端没有提供refreshToken，暂时使用accessToken代替
        username: registerForm.phone,
        nickname: registerForm.phone,
        // 重要：保持 admin 角色以确保菜单正常显示
        roles: ["admin"],
        // 添加一些常用权限
        permissions: ["*:*:*"]
      });

      // 获取用户详细信息
      await fetchUserDetail();

      // 清空注册表单
      Object.keys(registerForm).forEach(key => {
        registerForm[key as keyof RegisterForm] = "";
      });

      // 直接关闭登录弹窗
      emit("login-success");
      emit("update:visible", false);

      ElMessage.success("注册成功，已自动登录");
    } else {
      ElMessage.error("注册成功但未返回token信息");
    }
  } catch (error) {
    console.error("注册失败:", error);
    ElMessage.error("注册失败，请稍后重试");
  } finally {
    registerLoading.value = false;
  }
};
</script>

<style lang="scss" scoped>
.zhs-login-dialog {
  :deep(.el-dialog__header) {
    display: none;
  }

  :deep(.el-dialog__body) {
    padding: 0;
  }
}

.login-container {
  padding: 30px;
  background: #fff;
  border-radius: 8px;

  .login-header {
    margin-bottom: 30px;
    text-align: center;

    .login-logo {
      width: 60px;
      height: 60px;
      margin: 0 auto;

      img {
        width: 100%;
        height: 100%;
        object-fit: contain;
      }
    }

    .login-title {
      font-size: 24px;
      font-weight: 500;
      color: #333;
    }
  }

  .login-tabs {
    display: flex;
    justify-content: center;
    margin-bottom: 24px;
    border-bottom: 1px solid #eee;

    .tab-item {
      position: relative;
      padding: 0 20px 12px;
      font-size: 16px;
      color: #666;
      cursor: pointer;
      transition: all 0.3s;

      &:hover {
        color: #2d8cf0;
      }

      &.active {
        color: #2d8cf0;

        &::after {
          position: absolute;
          bottom: -1px;
          left: 0;
          width: 100%;
          height: 2px;
          content: "";
          background: #2d8cf0;
        }
      }
    }
  }

  .login-form {
    .form-item {
      position: relative;
      margin-bottom: 24px;

      :deep(.el-input) {
        .el-input__wrapper {
          padding-left: 15px;
        }

        .el-input__prefix {
          margin-right: 6px;

          .iconify {
            font-size: 20px;
            color: #999;
          }
        }
      }

      &.verification-code {
        display: flex;
        gap: 10px;
        align-items: center;

        .el-input {
          flex: 1;
        }

        .code-button {
          width: 110px;
          height: 30px;
          padding: 0;
          font-size: 14px;
          line-height: 28px;
          color: #2d8cf0;
          cursor: pointer;
          background: #fff;
          border: 1px solid #2d8cf0;
          border-radius: 4px;
          transition: all 0.3s;

          &:hover:not(.disabled) {
            background: #ecf5ff;
          }

          &.disabled {
            color: #999;
            cursor: not-allowed;
            border-color: #ddd;
          }
        }
      }
    }

    .error-message {
      position: absolute;
      bottom: -20px;
      left: 0;
      font-size: 12px;
      color: #f56c6c;
    }
  }

  .login-options {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 24px;

    .forget-password {
      color: #666;
      text-decoration: none;

      &:hover {
        color: #2d8cf0;
      }
    }
  }

  .login-button {
    width: 100%;
    height: 40px;
    margin-bottom: 24px;
    font-size: 16px;
  }

  .other-login {
    .divider {
      position: relative;
      margin-bottom: 20px;
      text-align: center;

      &::before,
      &::after {
        position: absolute;
        top: 50%;
        width: 80px;
        height: 1px;
        content: "";
        background: #eee;
      }

      &::before {
        left: 50px;
      }

      &::after {
        right: 50px;
      }

      span {
        padding: 0 15px;
        color: #999;
        background: #fff;
      }
    }

    .social-login {
      display: flex;
      gap: 30px;
      justify-content: center;

      .social-item {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 40px;
        height: 40px;
        cursor: pointer;
        border: 1px solid #eee;
        border-radius: 50%;
        transition: all 0.3s;

        .iconify {
          font-size: 24px;
          color: #666;
        }

        &:hover {
          border-color: #2d8cf0;

          .iconify {
            color: #2d8cf0;
          }
        }
      }
    }
  }

  .register-link {
    margin-top: 16px;
    font-size: 14px;
    color: #666;
    text-align: center;

    a {
      margin-left: 4px;
      color: #2d8cf0;
      text-decoration: none;

      &:hover {
        color: #57a3f3;
      }
    }
  }
}

.input-icon {
  font-size: 18px;
  color: #999;
}

.social-icon {
  font-size: 24px;
  color: #666;
}

.register-form {
  .form-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 24px;

    h3 {
      margin: 0;
      font-size: 20px;
      font-weight: 500;
      color: #333;
    }

    .back-to-login {
      font-size: 14px;
      color: #2d8cf0;
      text-decoration: none;

      &:hover {
        color: #57a3f3;
      }
    }
  }
}

:deep(.login-dialog-modal) {
  overflow: hidden;
}
</style>
