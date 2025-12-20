<template>
  <el-dialog
    :model-value="visible"
    :title="null"
    width="400px"
    top="100px"
    :show-close="true"
    :close-on-click-modal="false"
    :lock-scroll="true"
    :modal-class="'tg-login-modal'"
    custom-class="tg-login-dialog"
    @update:model-value="emit('update:visible', $event)"
  >
    <div class="tg-login-container" :class="{ 'shake': shakeForm }">
      <!-- 书本 Logo 区域 -->
      <div class="tg-logo-area">
        <div class="book-3d" :class="{ 'is-closed': isHiding }">
          <div class="book-inner">
            <!-- 封底 -->
            <div class="book-back"></div>
            <!-- 书页堆 -->
            <div class="book-page"></div>
            <div class="book-page"></div>
            <div class="book-page"></div>
            <!-- 封面 -->
            <div class="book-front">
              <div class="book-title">启明</div>
            </div>
          </div>
        </div>
      </div>

      <!-- 标题 -->
      <div class="tg-header">
        <h2 class="tg-title">{{ isRegister ? '创建账号' : '启明智教' }}</h2>
        <p class="tg-subtitle">{{ isRegister ? '注册您的账号以开始使用' : '请登录您的账号' }}</p>
      </div>

      <!-- 登录表单 -->
      <div v-if="!isRegister" class="tg-form">
        <!-- Tab 切换 -->
        <div class="tg-tabs">
          <div 
            class="tab" 
            :class="{ 'active': activeTab === 'account' }"
            @click="activeTab = 'account'"
          >
            密码登录
          </div>
          <div 
            class="tab" 
            :class="{ 'active': activeTab === 'phone' }"
            @click="activeTab = 'phone'"
          >
            验证码登录
          </div>
          <div class="tab-indicator" :style="{ transform: `translateX(${activeTab === 'account' ? 0 : 100}%)` }"></div>
        </div>

        <!-- 账号密码登录 -->
        <div v-show="activeTab === 'account'" class="form-fields" @keyup.enter="handleLogin">
          <div class="tg-input-group" :class="{ 'focused': focusedField === 'username', 'has-value': loginForm.username }">
            <input
              v-model="loginForm.username"
              type="text"
              class="tg-input"
              @focus="onFieldFocus('username')"
              @blur="onFieldBlur"
            />
            <label class="tg-label">手机号 / 邮箱</label>
            <div class="tg-input-line"></div>
          </div>
          <transition name="error-fade">
            <span v-if="errors.username" class="tg-error">{{ errors.username }}</span>
          </transition>

          <div class="tg-input-group" :class="{ 'focused': focusedField === 'password', 'has-value': loginForm.password }">
            <input
              v-model="loginForm.password"
              :type="showPassword ? 'text' : 'password'"
              class="tg-input"
              @focus="onFieldFocus('password')"
              @blur="onFieldBlur"
            />
            <label class="tg-label">密码</label>
            <div class="tg-input-line"></div>
            <button type="button" class="password-toggle" @click="togglePassword">
              <svg v-if="!showPassword" viewBox="0 0 24 24" width="20" height="20">
                <path fill="currentColor" d="M12,9A3,3 0 0,0 9,12A3,3 0 0,0 12,15A3,3 0 0,0 15,12A3,3 0 0,0 12,9M12,17A5,5 0 0,1 7,12A5,5 0 0,1 12,7A5,5 0 0,1 17,12A5,5 0 0,1 12,17M12,4.5C7,4.5 2.73,7.61 1,12C2.73,16.39 7,19.5 12,19.5C17,19.5 21.27,16.39 23,12C21.27,7.61 17,4.5 12,4.5Z"/>
              </svg>
              <svg v-else viewBox="0 0 24 24" width="20" height="20">
                <path fill="currentColor" d="M11.83,9L15,12.16C15,12.11 15,12.05 15,12A3,3 0 0,0 12,9C11.94,9 11.89,9 11.83,9M7.53,9.8L9.08,11.35C9.03,11.56 9,11.77 9,12A3,3 0 0,0 12,15C12.22,15 12.44,14.97 12.65,14.92L14.2,16.47C13.53,16.8 12.79,17 12,17A5,5 0 0,1 7,12C7,11.21 7.2,10.47 7.53,9.8M2,4.27L4.28,6.55L4.73,7C3.08,8.3 1.78,10 1,12C2.73,16.39 7,19.5 12,19.5C13.55,19.5 15.03,19.2 16.38,18.66L16.81,19.08L19.73,22L21,20.73L3.27,3M12,7A5,5 0 0,1 17,12C17,12.64 16.87,13.26 16.64,13.82L19.57,16.75C21.07,15.5 22.27,13.86 23,12C21.27,7.61 17,4.5 12,4.5C10.6,4.5 9.26,4.75 8,5.2L10.17,7.35C10.74,7.13 11.35,7 12,7Z"/>
              </svg>
            </button>
          </div>
          <transition name="error-fade">
            <span v-if="errors.password" class="tg-error">{{ errors.password }}</span>
          </transition>
        </div>

        <!-- 手机验证码登录 -->
        <div v-show="activeTab === 'phone'" class="form-fields" @keyup.enter="handleLogin">
          <div class="tg-input-group" :class="{ 'focused': focusedField === 'phone', 'has-value': phoneForm.phone }">
            <input
              v-model="phoneForm.phone"
              type="text"
              class="tg-input"
              @focus="onFieldFocus('phone')"
              @blur="onFieldBlur"
            />
            <label class="tg-label">手机号</label>
            <div class="tg-input-line"></div>
          </div>
          <transition name="error-fade">
            <span v-if="errors.phone" class="tg-error">{{ errors.phone }}</span>
          </transition>

          <div class="tg-input-group code-group" :class="{ 'focused': focusedField === 'code', 'has-value': phoneForm.code }">
            <input
              v-model="phoneForm.code"
              type="text"
              class="tg-input"
              @focus="onFieldFocus('code')"
              @blur="onFieldBlur"
            />
            <label class="tg-label">验证码</label>
            <div class="tg-input-line"></div>
            <button 
              type="button" 
              class="code-btn"
              :disabled="countdown > 0"
              @click="sendCode"
            >
              {{ countdown > 0 ? `${countdown}s` : '获取' }}
            </button>
          </div>
          <transition name="error-fade">
            <span v-if="errors.code" class="tg-error">{{ errors.code }}</span>
          </transition>
        </div>

        <!-- 记住密码 & 忘记密码 -->
        <div class="tg-options">
          <label class="tg-checkbox">
            <input type="checkbox" v-model="rememberMe" />
            <span class="checkmark"></span>
            记住密码
          </label>
          <a href="javascript:;" class="forget-link">忘记密码？</a>
        </div>

        <!-- 登录按钮 -->
        <button 
          class="tg-button" 
          :class="{ 'loading': loading, 'success': loginSuccess }"
          :disabled="loading"
          @click="handleLogin"
        >
          <span class="btn-content">
            <svg v-if="loading" class="spinner" viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="3" fill="none" stroke-dasharray="32" stroke-linecap="round"/>
            </svg>
            <svg v-else-if="loginSuccess" class="check-icon" viewBox="0 0 24 24">
              <path fill="currentColor" d="M9,20.42L2.79,14.21L5.62,11.38L9,14.77L18.88,4.88L21.71,7.71L9,20.42Z"/>
            </svg>
            <span v-else>登 录</span>
          </span>
        </button>

        <!-- 注册链接 -->
        <div class="tg-register-link">
          还没有账号？<a href="javascript:;" @click="isRegister = true">立即注册</a>
        </div>
      </div>

      <!-- 注册表单 -->
      <div v-else class="tg-form">
        <button class="back-btn" @click="isRegister = false">
          <svg viewBox="0 0 24 24" width="20" height="20">
            <path fill="currentColor" d="M20,11V13H8L13.5,18.5L12.08,19.92L4.16,12L12.08,4.08L13.5,5.5L8,11H20Z"/>
          </svg>
          返回登录
        </button>

        <div class="form-fields" @keyup.enter="handleRegister">
          <div class="tg-input-group" :class="{ 'focused': focusedField === 'registerPhone', 'has-value': registerForm.phone }">
            <input
              v-model="registerForm.phone"
              type="text"
              class="tg-input"
              @focus="onFieldFocus('registerPhone')"
              @blur="onFieldBlur"
            />
            <label class="tg-label">手机号</label>
            <div class="tg-input-line"></div>
          </div>
          <transition name="error-fade">
            <span v-if="errors.registerPhone" class="tg-error">{{ errors.registerPhone }}</span>
          </transition>

          <div class="tg-input-group" :class="{ 'focused': focusedField === 'registerPassword', 'has-value': registerForm.password }">
            <input
              v-model="registerForm.password"
              :type="showPassword ? 'text' : 'password'"
              class="tg-input"
              @focus="onFieldFocus('registerPassword')"
              @blur="onFieldBlur"
            />
            <label class="tg-label">设置密码</label>
            <div class="tg-input-line"></div>
          </div>
          <transition name="error-fade">
            <span v-if="errors.registerPassword" class="tg-error">{{ errors.registerPassword }}</span>
          </transition>

          <div class="tg-input-group" :class="{ 'focused': focusedField === 'confirmPassword', 'has-value': registerForm.confirmPassword }">
            <input
              v-model="registerForm.confirmPassword"
              :type="showPassword ? 'text' : 'password'"
              class="tg-input"
              @focus="onFieldFocus('confirmPassword')"
              @blur="onFieldBlur"
            />
            <label class="tg-label">确认密码</label>
            <div class="tg-input-line"></div>
          </div>
          <transition name="error-fade">
            <span v-if="errors.confirmPassword" class="tg-error">{{ errors.confirmPassword }}</span>
          </transition>
        </div>

        <button 
          class="tg-button" 
          :class="{ 'loading': registerLoading }"
          :disabled="registerLoading"
          @click="handleRegister"
        >
          <span class="btn-content">
            <svg v-if="registerLoading" class="spinner" viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="3" fill="none" stroke-dasharray="32" stroke-linecap="round"/>
            </svg>
            <span v-else>注 册</span>
          </span>
        </button>
      </div>
    </div>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, reactive, watch } from "vue";
import type { PropType } from "vue";
import { ElMessage } from "element-plus";
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
  registerPhone: string;
  registerPassword: string;
  confirmPassword: string;
}

interface RegisterForm {
  phone: string;
  password: string;
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

// 交互状态
const focusedField = ref<string>("");
const showPassword = ref(false);
const shakeForm = ref(false);
const loginSuccess = ref(false);

// Telegram 风格动画状态
const isPeeking = ref(false);  // 偷看状态（显示密码时）
const isHiding = ref(false);   // 遮住眼睛状态（输入密码时）

// 输入框焦点处理
const onFieldFocus = (field: string) => {
  focusedField.value = field;
  
  // 密码相关字段 - 遮眼
  if (field === 'password' || field === 'registerPassword' || field === 'confirmPassword') {
    isHiding.value = true;
    isPeeking.value = false;
  } else {
    isHiding.value = false;
    isPeeking.value = false;
  }
};

const onFieldBlur = () => {
  focusedField.value = "";
  isHiding.value = false;
  isPeeking.value = false;
};

// 切换密码显示
const togglePassword = () => {
  showPassword.value = !showPassword.value;
  if (showPassword.value && focusedField.value?.includes('password')) {
    isPeeking.value = true;
    isHiding.value = false;
  } else if (focusedField.value?.includes('password')) {
    isPeeking.value = false;
    isHiding.value = true;
  }
};

// 监听显示密码状态
watch(showPassword, (newVal) => {
  if (focusedField.value?.includes('password')) {
    isPeeking.value = newVal;
    isHiding.value = !newVal;
  }
});

// 触发摇晃动画
const triggerShake = () => {
  shakeForm.value = true;
  setTimeout(() => {
    shakeForm.value = false;
  }, 500);
};

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

const errors = reactive<Errors>({
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

  ElMessage.success("验证码已发送");
};

// 获取用户详细信息
const fetchUserDetail = async () => {
  try {
    const res = await getUserDetail();
    console.log("用户详细信息:", res);

    if (res && res.data && res.data.userInfo) {
      const userInfo = res.data.userInfo;
      const userStore = useUserStoreHook();
      userStore.SET_NICKNAME(userInfo.nickname || "");
      userStore.SET_AVATAR(userInfo.avatar || "");

      setToken({
        accessToken: getToken()?.accessToken || "",
        refreshToken: getToken()?.refreshToken || "",
        expires: getToken()?.expires ? new Date(getToken().expires) : new Date(),
        username: userInfo.mobile,
        nickname: userInfo.nickname,
        avatar: userInfo.avatar,
        roles: ["admin"],
        permissions: ["*:*:*"],
        roleType: userInfo.roleType
      });

      localStorage.setItem("userId", userInfo.id.toString());
      localStorage.setItem("userMobile", userInfo.mobile);
      localStorage.setItem("userSex", userInfo.sex.toString());
      localStorage.setItem("userInfo", userInfo.info || "");
      localStorage.setItem("userRoleType", userInfo.roleType.toString());

      console.log("用户信息更新成功", userInfo);
    }

    return res;
  } catch (error) {
    console.error("获取用户详细信息出错:", error);
    return null;
  }
};

// 登录处理
const handleLogin = async () => {
  if (activeTab.value === "account") {
    errors.username = "";
    errors.password = "";

    if (!loginForm.username) {
      errors.username = "请输入手机号";
      triggerShake();
      return;
    }
    if (!loginForm.password) {
      errors.password = "请输入密码";
      triggerShake();
      return;
    }

    loading.value = true;
    try {
      const res = await userLogin({
        mobile: loginForm.username,
        password: loginForm.password
      });

      if (res && res.data && res.data.accessToken) {
        setToken({
          accessToken: res.data.accessToken,
          expires: new Date(res.data.accessExpire * 1000),
          refreshToken: res.data.accessToken,
          username: loginForm.username,
          nickname: loginForm.username,
          roles: ["admin"],
          permissions: ["*:*:*"]
        });

        await fetchUserDetail();

        loginSuccess.value = true;
        message(t("login.pureLoginSuccess"), { type: "success" });

        setTimeout(() => {
          emit("login-success");
          emit("update:visible", false);
          loginSuccess.value = false;
        }, 800);
      } else {
        triggerShake();
        message(t("login.pureLoginFail"), { type: "error" });
      }
    } catch (error) {
      console.error("登录失败:", error);
      triggerShake();
      message(t("login.pureLoginFail"), { type: "error" });
    } finally {
      loading.value = false;
    }
  } else {
    errors.phone = "";
    errors.code = "";

    if (!phoneForm.phone) {
      errors.phone = "请输入手机号";
      triggerShake();
      return;
    }
    if (!phoneForm.code) {
      errors.code = "请输入验证码";
      triggerShake();
      return;
    }

    loading.value = true;
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      loginSuccess.value = true;
      ElMessage.success("登录成功");
      setTimeout(() => {
        loginSuccess.value = false;
        emit("login-success");
        emit("update:visible", false);
      }, 800);
    } catch (error) {
      triggerShake();
      ElMessage.error("登录失败");
    } finally {
      loading.value = false;
    }
  }
};

// 注册处理
const handleRegister = async () => {
  errors.registerPhone = "";
  errors.registerPassword = "";
  errors.confirmPassword = "";

  if (!registerForm.phone) {
    errors.registerPhone = "请输入手机号";
    triggerShake();
    return;
  }
  if (!registerForm.password) {
    errors.registerPassword = "请设置密码";
    triggerShake();
    return;
  }
  if (!registerForm.confirmPassword) {
    errors.confirmPassword = "请确认密码";
    triggerShake();
    return;
  }
  if (registerForm.password !== registerForm.confirmPassword) {
    errors.confirmPassword = "两次输入的密码不一致";
    triggerShake();
    return;
  }

  registerLoading.value = true;
  try {
    const res = await userRegister({
      mobile: registerForm.phone,
      password: registerForm.password
    });

    if (res && res.data && res.data.accessToken) {
      setToken({
        accessToken: res.data.accessToken,
        expires: new Date(res.data.accessExpire * 1000),
        refreshToken: res.data.accessToken,
        username: registerForm.phone,
        nickname: registerForm.phone,
        roles: ["admin"],
        permissions: ["*:*:*"]
      });

      await fetchUserDetail();

      Object.keys(registerForm).forEach(key => {
        registerForm[key as keyof RegisterForm] = "";
      });

      emit("login-success");
      emit("update:visible", false);

      ElMessage.success("注册成功，已自动登录");
    } else {
      ElMessage.error("注册成功但未返回token信息");
    }
  } catch (error) {
    console.error("注册失败:", error);
    triggerShake();
    ElMessage.error("注册失败，请稍后重试");
  } finally {
    registerLoading.value = false;
  }
};
</script>

<style lang="scss" scoped>
/* Telegram 风格登录框 */
.tg-login-container {
  padding: 30px 35px 35px;
  background: #fff;
  
  &.shake {
    animation: shake 0.5s ease-in-out;
  }
}

@keyframes shake {
  0%, 100% { transform: translateX(0); }
  20%, 60% { transform: translateX(-8px); }
  40%, 80% { transform: translateX(8px); }
}

/* Logo 区域 - 3D书本 */
.tg-logo-area {
  display: flex;
  justify-content: center;
  margin-bottom: 20px;
  perspective: 600px;
}

.book-3d {
  width: 80px;
  height: 100px;
  position: relative;
  transform-style: preserve-3d;
  transform: rotateY(-25deg);
  transition: transform 0.5s ease;
  
  &:hover {
    transform: rotateY(-35deg);
  }
  
  .book-inner {
    position: relative;
    width: 100%;
    height: 100%;
    transform-style: preserve-3d;
  }
  
  /* 封底 */
  .book-back {
    position: absolute;
    width: 100%;
    height: 100%;
    background: linear-gradient(135deg, #2980b9 0%, #1a5276 100%);
    border-radius: 0 3px 3px 0;
    transform: translateZ(-15px);
    box-shadow: inset 3px 0 10px rgba(0,0,0,0.2);
  }
  
  /* 书页 */
  .book-page {
    position: absolute;
    width: calc(100% - 6px);
    height: calc(100% - 6px);
    top: 3px;
    left: 3px;
    background: #f8f8f8;
    border-radius: 0 2px 2px 0;
    transform-origin: left center;
    
    &::after {
      content: '';
      position: absolute;
      right: 10px;
      top: 15px;
      width: 40px;
      height: 2px;
      background: #ddd;
      box-shadow: 
        0 8px 0 #ddd,
        0 16px 0 #ddd,
        0 24px 0 #ddd;
    }
    
    &:nth-child(2) {
      transform: translateZ(-3px);
      background: #f5f5f5;
    }
    
    &:nth-child(3) {
      transform: translateZ(-6px);
      background: #f0f0f0;
    }
    
    &:nth-child(4) {
      transform: translateZ(-9px);
      background: #eee;
    }
  }
  
  /* 封面 */
  .book-front {
    position: absolute;
    width: 100%;
    height: 100%;
    background: linear-gradient(135deg, #5dade2 0%, #3498db 100%);
    border-radius: 0 3px 3px 0;
    transform-origin: left center;
    transform: rotateY(0deg) translateZ(0);
    transition: transform 0.5s cubic-bezier(0.645, 0.045, 0.355, 1);
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 
      2px 0 5px rgba(0,0,0,0.1),
      inset -2px 0 10px rgba(255,255,255,0.1);
    
    /* 书脊效果 */
    &::before {
      content: '';
      position: absolute;
      left: 0;
      top: 0;
      bottom: 0;
      width: 8px;
      background: linear-gradient(90deg, 
        rgba(0,0,0,0.3) 0%,
        rgba(0,0,0,0.1) 50%,
        transparent 100%);
    }
    
    .book-title {
      color: rgba(255,255,255,0.9);
      font-size: 16px;
      font-weight: 600;
      letter-spacing: 4px;
      writing-mode: vertical-rl;
      text-shadow: 0 1px 2px rgba(0,0,0,0.2);
    }
  }
  
  /* 合上状态 */
  &.is-closed {
    .book-front {
      transform: rotateY(-150deg) translateZ(0);
    }
  }
}

/* 标题 */
.tg-header {
  text-align: center;
  margin-bottom: 28px;
  
  .tg-title {
    font-size: 24px;
    font-weight: 600;
    color: #222;
    margin: 0 0 8px;
    letter-spacing: 0.5px;
  }
  
  .tg-subtitle {
    font-size: 14px;
    color: #8e8e93;
    margin: 0;
  }
}

/* Tab 切换 */
.tg-tabs {
  display: flex;
  position: relative;
  margin-bottom: 24px;
  background: #f5f5f5;
  border-radius: 10px;
  padding: 4px;
  
  .tab {
    flex: 1;
    padding: 10px 0;
    text-align: center;
    font-size: 14px;
    font-weight: 500;
    color: #666;
    cursor: pointer;
    position: relative;
    z-index: 1;
    transition: color 0.3s ease;
    border-radius: 8px;
    
    &.active {
      color: #fff;
    }
  }
  
  .tab-indicator {
    position: absolute;
    top: 4px;
    left: 4px;
    width: calc(50% - 4px);
    height: calc(100% - 8px);
    background: linear-gradient(135deg, #54a0ff 0%, #2e86de 100%);
    border-radius: 8px;
    transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    box-shadow: 0 2px 8px rgba(84, 160, 255, 0.4);
  }
}

/* 表单字段 */
.form-fields {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

/* 输入框组 - Material Design 风格 */
.tg-input-group {
  position: relative;
  margin-bottom: 12px;
  
  .tg-input {
    width: 100%;
    height: 48px;
    padding: 20px 12px 8px;
    font-size: 16px;
    color: #222;
    background: transparent;
    border: none;
    border-bottom: 2px solid #e0e0e0;
    outline: none;
    transition: border-color 0.3s ease;
    box-sizing: border-box;
    
    &:focus {
      border-color: #54a0ff;
    }
  }
  
  .tg-label {
    position: absolute;
    left: 12px;
    top: 50%;
    transform: translateY(-50%);
    font-size: 16px;
    color: #8e8e93;
    pointer-events: none;
    transition: all 0.3s ease;
  }
  
  .tg-input-line {
    position: absolute;
    bottom: 0;
    left: 50%;
    width: 0;
    height: 2px;
    background: linear-gradient(90deg, #54a0ff 0%, #2e86de 100%);
    transition: all 0.3s ease;
  }
  
  &.focused, &.has-value {
    .tg-label {
      top: 8px;
      transform: translateY(0);
      font-size: 12px;
      color: #54a0ff;
    }
    
    .tg-input-line {
      left: 0;
      width: 100%;
    }
  }
  
  &.has-value:not(.focused) .tg-label {
    color: #8e8e93;
  }
  
  .password-toggle {
    position: absolute;
    right: 8px;
    top: 50%;
    transform: translateY(-50%);
    background: none;
    border: none;
    padding: 8px;
    cursor: pointer;
    color: #8e8e93;
    transition: color 0.2s;
    
    &:hover {
      color: #54a0ff;
    }
  }
  
  &.code-group {
    .code-btn {
      position: absolute;
      right: 0;
      top: 50%;
      transform: translateY(-50%);
      padding: 8px 16px;
      font-size: 13px;
      font-weight: 500;
      color: #54a0ff;
      background: none;
      border: none;
      cursor: pointer;
      transition: all 0.2s;
      
      &:hover:not(:disabled) {
        color: #2e86de;
      }
      
      &:disabled {
        color: #c8c8c8;
        cursor: not-allowed;
      }
    }
  }
}

/* 错误消息 */
.tg-error {
  display: block;
  font-size: 12px;
  color: #ff3b30;
  padding: 4px 12px;
  margin-top: -8px;
  margin-bottom: 8px;
}

.error-fade-enter-active,
.error-fade-leave-active {
  transition: all 0.3s ease;
}

.error-fade-enter-from,
.error-fade-leave-to {
  opacity: 0;
  transform: translateY(-5px);
}

/* 选项区域 */
.tg-options {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  
  .tg-checkbox {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 14px;
    color: #666;
    cursor: pointer;
    
    input[type="checkbox"] {
      display: none;
    }
    
    .checkmark {
      width: 18px;
      height: 18px;
      border: 2px solid #d1d1d6;
      border-radius: 4px;
      position: relative;
      transition: all 0.2s ease;
      
      &::after {
        content: '';
        position: absolute;
        left: 5px;
        top: 1px;
        width: 5px;
        height: 10px;
        border: solid #fff;
        border-width: 0 2px 2px 0;
        transform: rotate(45deg) scale(0);
        transition: transform 0.2s ease;
      }
    }
    
    input:checked + .checkmark {
      background: linear-gradient(135deg, #54a0ff 0%, #2e86de 100%);
      border-color: #54a0ff;
      
      &::after {
        transform: rotate(45deg) scale(1);
      }
    }
  }
  
  .forget-link {
    font-size: 14px;
    color: #54a0ff;
    text-decoration: none;
    transition: color 0.2s;
    
    &:hover {
      color: #2e86de;
    }
  }
}

/* 登录按钮 */
.tg-button {
  width: 100%;
  height: 48px;
  font-size: 16px;
  font-weight: 600;
  color: #fff;
  background: linear-gradient(135deg, #54a0ff 0%, #2e86de 100%);
  border: none;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(84, 160, 255, 0.4);
  position: relative;
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
    transition: left 0.5s ease;
  }
  
  &:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(84, 160, 255, 0.5);
    
    &::before {
      left: 100%;
    }
  }
  
  &:active:not(:disabled) {
    transform: translateY(0);
    box-shadow: 0 2px 10px rgba(84, 160, 255, 0.4);
  }
  
  &:disabled {
    cursor: not-allowed;
    opacity: 0.7;
  }
  
  .btn-content {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
  }
  
  .spinner {
    width: 24px;
    height: 24px;
    animation: spin 1s linear infinite;
    
    circle {
      stroke-dashoffset: 50;
    }
  }
  
  .check-icon {
    width: 24px;
    height: 24px;
    animation: scaleIn 0.3s ease;
  }
  
  &.success {
    background: linear-gradient(135deg, #2ecc71 0%, #27ae60 100%);
    box-shadow: 0 4px 15px rgba(46, 204, 113, 0.4);
  }
}

@keyframes spin {
  100% { transform: rotate(360deg); }
}

@keyframes scaleIn {
  0% { transform: scale(0); }
  50% { transform: scale(1.2); }
  100% { transform: scale(1); }
}

/* 注册链接 */
.tg-register-link {
  margin-top: 20px;
  text-align: center;
  font-size: 14px;
  color: #8e8e93;
  
  a {
    color: #54a0ff;
    text-decoration: none;
    font-weight: 500;
    transition: color 0.2s;
    
    &:hover {
      color: #2e86de;
    }
  }
}

/* 返回按钮 */
.back-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 0;
  margin-bottom: 20px;
  font-size: 14px;
  font-weight: 500;
  color: #54a0ff;
  background: none;
  border: none;
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    color: #2e86de;
    transform: translateX(-3px);
  }
  
  svg {
    transition: transform 0.2s;
  }
  
  &:hover svg {
    transform: translateX(-3px);
  }
}

/* Dialog 样式覆盖 */
:deep(.tg-login-modal) {
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
}

:deep(.tg-login-dialog) {
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  
  .el-dialog__header {
    display: none;
  }
  
  .el-dialog__body {
    padding: 0;
  }
  
  .el-dialog__headerbtn {
    top: 12px;
    right: 12px;
    width: 32px;
    height: 32px;
    font-size: 18px;
    z-index: 10;
    background: rgba(0, 0, 0, 0.05);
    border-radius: 50%;
    transition: all 0.2s;
    
    .el-dialog__close {
      color: #666;
    }
    
    &:hover {
      background: rgba(0, 0, 0, 0.1);
      
      .el-dialog__close {
        color: #333;
      }
    }
  }
}
</style>
