<script setup lang="ts">
import { useI18n } from "vue-i18n";
import Motion from "./utils/motion";
import { useRouter } from "vue-router";
import { message } from "@/utils/message";
import { loginRules } from "./utils/rule";
import TypeIt from "@/components/ReTypeit";
import { debounce } from "@pureadmin/utils";
import { useNav } from "@/layout/hooks/useNav";
import { useEventListener } from "@vueuse/core";
import type { FormInstance } from "element-plus";
import { $t, transformI18n } from "@/plugins/i18n";
import { operates, thirdParty } from "./utils/enums";
import { useLayout } from "@/layout/hooks/useLayout";
import LoginPhone from "./components/LoginPhone.vue";
import LoginRegist from "./components/LoginRegist.vue";
import LoginUpdate from "./components/LoginUpdate.vue";
import LoginQrCode from "./components/LoginQrCode.vue";
import ParticlesBg from "./components/ParticlesBg.vue";
import { useUserStoreHook } from "@/store/modules/user";
import ReInvisibleInk from "@/components/ReInvisibleInk/index.vue";
import { initRouter, getTopMenu } from "@/router/utils";
import { bg, avatar, illustration } from "./utils/static";
import { ReImageVerify } from "@/components/ReImageVerify";
import { ref, toRaw, reactive, watch, computed, onMounted } from "vue";
import { useRenderIcon } from "@/components/ReIcon/src/hooks";
import { useTranslationLang } from "@/layout/hooks/useTranslationLang";
import { useDataThemeChange } from "@/layout/hooks/useDataThemeChange";

import dayIcon from "@/assets/svg/day.svg?component";
import darkIcon from "@/assets/svg/dark.svg?component";
import globalization from "@/assets/svg/globalization.svg?component";
import Lock from "~icons/ri/lock-fill";
import Eye from "~icons/ri/eye-line";
import EyeOff from "~icons/ri/eye-off-line";
import Check from "~icons/ep/check";
import User from "~icons/ri/user-3-fill";
import Info from "~icons/ri/information-line";
import Keyhole from "~icons/ri/shield-keyhole-line";
import Tenant from "~icons/ri/home-gear-line";

defineOptions({
  name: "Login"
});

const imgCode = ref("");
const loginDay = ref(7);
const router = useRouter();
const loading = ref(false);
const checked = ref(false);
const disabled = ref(false);
const ruleFormRef = ref<FormInstance>();
const isTenantFocused = ref(false);
const isUsernameFocused = ref(false);
const isPasswordFocused = ref(false);
const isVerifyCodeFocused = ref(false);
const passwordVisible = ref(false);
const currentPage = computed(() => {
  return useUserStoreHook().currentPage;
});

// 动画状态
const isLoaded = ref(false);

onMounted(() => {
  setTimeout(() => {
    isLoaded.value = true;
  }, 100);
});

const { t } = useI18n();
const { initStorage } = useLayout();
initStorage();
const { dataTheme, overallStyle, dataThemeChange } = useDataThemeChange();
dataThemeChange(overallStyle.value);
const { title, getDropdownItemStyle, getDropdownItemClass } = useNav();
const {
  locale,
  translationCh,
  translationTw,
  translationEn,
  translationJa,
  translationKo
} = useTranslationLang();
const { VITE_ENABLE_TENANT } = import.meta.env;

const ruleForm = reactive({
  tenant: "pure-admin",
  username: "admin",
  password: "admin123",
  verifyCode: ""
});

// 特性列表
const features = [
  {
    icon: "🚀",
    title: "高性能",
    desc: "基于 Vue3 + Vite 构建，极速体验"
  },
  {
    icon: "🎨",
    title: "优雅设计",
    desc: "现代化 UI 设计，响应式布局"
  },
  {
    icon: "🔐",
    title: "安全可靠",
    desc: "完善的权限管理和安全机制"
  },
  {
    icon: "⚡",
    title: "开箱即用",
    desc: "丰富的组件和功能模块"
  }
];

// 统计数据
const statistics = [
  { number: "10K+", label: "活跃用户" },
  { number: "500+", label: "企业客户" },
  { number: "99.9%", label: "系统稳定性" },
  { number: "24/7", label: "技术支持" }
];

const onLogin = async (formEl: FormInstance | undefined) => {
  if (!formEl) return;
  await formEl.validate(valid => {
    if (valid) {
      loading.value = true;
      useUserStoreHook()
        .loginByUsername({
          username: ruleForm.username,
          password: ruleForm.password
        })
        .then(res => {
          if (res.success) {
            // 获取后端路由
            return initRouter().then(() => {
              disabled.value = true;
              router
                .push(getTopMenu(true).path)
                .then(() => {
                  message(t("login.pureLoginSuccess"), { type: "success" });
                })
                .finally(() => (disabled.value = false));
            });
          } else {
            message(t("login.pureLoginFail"), { type: "error" });
          }
        })
        .finally(() => (loading.value = false));
    }
  });
};

const immediateDebounce: any = debounce(
  formRef => onLogin(formRef),
  1000,
  true
);

useEventListener(document, "keydown", ({ code }) => {
  if (
    ["Enter", "NumpadEnter"].includes(code) &&
    !disabled.value &&
    !loading.value
  )
    immediateDebounce(ruleFormRef.value);
});

watch(imgCode, value => {
  useUserStoreHook().SET_VERIFYCODE(value);
});
watch(checked, bool => {
  useUserStoreHook().SET_ISREMEMBERED(bool);
});
watch(loginDay, value => {
  useUserStoreHook().SET_LOGINDAY(value);
});
</script>

<template>
  <div class="login-page select-none">
    <!-- 粒子背景 -->
    <ParticlesBg />

    <!-- 渐变背景 -->
    <div class="gradient-bg"></div>

    <!-- 顶部工具栏 -->
    <div class="top-toolbar">
      <div class="brand">
        <avatar class="brand-logo" />
        <span class="brand-name">Pure Admin</span>
      </div>
      <div class="toolbar-actions">
        <!-- 主题切换 -->
        <el-switch
          v-model="dataTheme"
          inline-prompt
          :active-icon="dayIcon"
          :inactive-icon="darkIcon"
          @change="dataThemeChange"
        />
        <!-- 国际化 -->
        <el-dropdown trigger="click">
          <globalization
            class="hover:text-primary hover:bg-[transparent]! w-[20px] h-[20px] ml-3 cursor-pointer outline-hidden duration-300"
          />
          <template #dropdown>
            <el-dropdown-menu class="translation">
              <el-dropdown-item
                :style="getDropdownItemStyle(locale, 'zh')"
                :class="['dark:text-white!', getDropdownItemClass(locale, 'zh')]"
                @click="translationCh"
              >
                <IconifyIconOffline
                  v-show="locale === 'zh'"
                  class="check-btn"
                  :icon="Check"
                />
                简体中文
              </el-dropdown-item>
              <el-dropdown-item
                :style="getDropdownItemStyle(locale, 'tw')"
                :class="['dark:text-white!', getDropdownItemClass(locale, 'tw')]"
                @click="translationTw"
              >
                <IconifyIconOffline
                  v-show="locale === 'tw'"
                  class="check-btn"
                  :icon="Check"
                />
                繁體中文
              </el-dropdown-item>
              <el-dropdown-item
                :style="getDropdownItemStyle(locale, 'en')"
                :class="['dark:text-white!', getDropdownItemClass(locale, 'en')]"
                @click="translationEn"
              >
                <span v-show="locale === 'en'" class="check-btn">
                  <IconifyIconOffline :icon="Check" />
                </span>
                English
              </el-dropdown-item>
              <el-dropdown-item
                :style="getDropdownItemStyle(locale, 'ja')"
                :class="['dark:text-white!', getDropdownItemClass(locale, 'ja')]"
                @click="translationJa"
              >
                <span v-show="locale === 'ja'" class="check-btn">
                  <IconifyIconOffline :icon="Check" />
                </span>
                日本語
              </el-dropdown-item>
              <el-dropdown-item
                :style="getDropdownItemStyle(locale, 'ko')"
                :class="['dark:text-white!', getDropdownItemClass(locale, 'ko')]"
                @click="translationKo"
              >
                <span v-show="locale === 'ko'" class="check-btn">
                  <IconifyIconOffline :icon="Check" />
                </span>
                한국어
              </el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </div>
    </div>

    <!-- 主内容区 -->
    <div class="main-content">
      <!-- 左侧展示区 -->
      <div class="showcase-section" :class="{ loaded: isLoaded }">
        <!-- 主标题 -->
        <div class="hero-section">
          <h1 class="hero-title">
            <span class="gradient-text">智慧管理</span>
            <br />
            <span class="sub-title">新一代企业级管理平台</span>
          </h1>
          <p class="hero-desc">
            基于 Vue 3.0 + TypeScript + Vite + Element Plus 构建的企业级后台管理系统，
            提供丰富的组件和功能模块，助力企业数字化转型。
          </p>
        </div>

        <!-- 特性展示 -->
        <div class="features-grid">
          <div
            v-for="(feature, index) in features"
            :key="index"
            class="feature-card"
            :style="{ animationDelay: `${index * 0.1}s` }"
          >
            <div class="feature-icon">{{ feature.icon }}</div>
            <div class="feature-content">
              <h3>{{ feature.title }}</h3>
              <p>{{ feature.desc }}</p>
            </div>
          </div>
        </div>

        <!-- 统计数据 -->
        <div class="statistics-bar">
          <div
            v-for="(stat, index) in statistics"
            :key="index"
            class="stat-item"
          >
            <div class="stat-number">{{ stat.number }}</div>
            <div class="stat-label">{{ stat.label }}</div>
          </div>
        </div>

        <!-- 插图 -->
        <div class="illustration-wrapper">
          <component :is="toRaw(illustration)" class="main-illustration" />
        </div>
      </div>

      <!-- 右侧登录区 -->
      <div class="login-section" :class="{ loaded: isLoaded }">
        <div class="login-card">
          <div class="login-header">
            <avatar class="login-avatar" />
            <Motion>
              <h2 class="login-title">
                <TypeIt
                  :options="{ strings: [title], cursor: false, speed: 100 }"
                />
              </h2>
            </Motion>
            <p class="login-subtitle">欢迎回来，请登录您的账户</p>
          </div>

          <el-form
            v-if="currentPage === 0"
            ref="ruleFormRef"
            :model="ruleForm"
            :rules="loginRules"
            size="large"
            class="login-form"
          >
            <Motion v-if="VITE_ENABLE_TENANT === 'true'">
              <el-form-item
                :rules="[
                  {
                    required: true,
                    message: transformI18n($t('login.pureTenantReg')),
                    trigger: 'blur'
                  }
                ]"
                prop="tenant"
                class="floating-label-item"
                :class="{ 'has-value': !!ruleForm.tenant, 'is-focused': isTenantFocused }"
              >
                <el-input
                  v-model="ruleForm.tenant"
                  clearable
                  placeholder=""
                  :prefix-icon="useRenderIcon(Tenant)"
                  @focus="isTenantFocused = true"
                  @blur="isTenantFocused = false"
                />
                <label class="floating-label">{{ t('login.pureTenant') }}</label>
              </el-form-item>
            </Motion>

            <Motion :delay="100">
              <el-form-item
                :rules="[
                  {
                    required: true,
                    message: transformI18n($t('login.pureUsernameReg')),
                    trigger: 'blur'
                  }
                ]"
                prop="username"
                class="floating-label-item"
                :class="{ 'has-value': !!ruleForm.username, 'is-focused': isUsernameFocused }"
              >
                <el-input
                  v-model="ruleForm.username"
                  clearable
                  placeholder=""
                  :prefix-icon="useRenderIcon(User)"
                  @focus="isUsernameFocused = true"
                  @blur="isUsernameFocused = false"
                />
                <label class="floating-label">{{ t('login.pureUsername') }}</label>
              </el-form-item>
            </Motion>

            <Motion :delay="150">
              <el-form-item 
                prop="password"
                class="floating-label-item"
                :class="{ 'has-value': !!ruleForm.password, 'is-focused': isPasswordFocused }"
              >
                <ReInvisibleInk
                  :active="!passwordVisible && !!ruleForm.password"
                  class="flex-1"
                >
                  <el-input
                    v-model="ruleForm.password"
                    clearable
                    :type="passwordVisible ? 'text' : 'password'"
                    placeholder=""
                    :prefix-icon="useRenderIcon(Lock)"
                    @focus="isPasswordFocused = true"
                    @blur="isPasswordFocused = false"
                  >
                    <template #suffix>
                      <IconifyIconOffline
                        :icon="passwordVisible ? Eye : EyeOff"
                        class="cursor-pointer"
                        @click="passwordVisible = !passwordVisible"
                      />
                    </template>
                  </el-input>
                </ReInvisibleInk>
                <label class="floating-label">{{ t('login.purePassword') }}</label>
              </el-form-item>
            </Motion>

            <Motion :delay="200">
              <el-form-item 
                prop="verifyCode"
                class="floating-label-item"
                :class="{ 'has-value': !!ruleForm.verifyCode, 'is-focused': isVerifyCodeFocused }"
              >
                <el-input
                  v-model="ruleForm.verifyCode"
                  clearable
                  placeholder=""
                  :prefix-icon="useRenderIcon(Keyhole)"
                  @focus="isVerifyCodeFocused = true"
                  @blur="isVerifyCodeFocused = false"
                >
                  <template v-slot:append>
                    <ReImageVerify v-model:code="imgCode" />
                  </template>
                </el-input>
                <label class="floating-label">{{ t('login.pureVerifyCode') }}</label>
              </el-form-item>
            </Motion>

            <Motion :delay="250">
              <el-form-item>
                <div class="w-full h-[20px] flex justify-between items-center">
                  <el-checkbox v-model="checked">
                    <span class="flex">
                      <select
                        v-model="loginDay"
                        :style="{
                          width: loginDay < 10 ? '10px' : '16px',
                          outline: 'none',
                          background: 'none',
                          appearance: 'none',
                          border: 'none'
                        }"
                      >
                        <option value="1">1</option>
                        <option value="7">7</option>
                        <option value="30">30</option>
                      </select>
                      {{ t("login.pureRemember") }}
                      <IconifyIconOffline
                        v-tippy="{
                          content: t('login.pureRememberInfo'),
                          placement: 'top'
                        }"
                        :icon="Info"
                        class="ml-1"
                      />
                    </span>
                  </el-checkbox>
                  <el-button
                    link
                    type="primary"
                    @click="useUserStoreHook().SET_CURRENTPAGE(4)"
                  >
                    {{ t("login.pureForget") }}
                  </el-button>
                </div>
                <el-button
                  class="w-full mt-4! login-btn"
                  size="default"
                  type="primary"
                  :loading="loading"
                  :disabled="disabled"
                  @click="onLogin(ruleFormRef)"
                >
                  {{ t("login.pureLogin") }}
                </el-button>
              </el-form-item>
            </Motion>

            <Motion :delay="300">
              <el-form-item>
                <div class="w-full h-[20px] flex justify-between items-center">
                  <el-button
                    v-for="(item, index) in operates"
                    :key="index"
                    class="w-full mt-4!"
                    size="default"
                    @click="useUserStoreHook().SET_CURRENTPAGE(index + 1)"
                  >
                    {{ t(item.title) }}
                  </el-button>
                </div>
              </el-form-item>
            </Motion>
          </el-form>

          <Motion v-if="currentPage === 0" :delay="350">
            <el-form-item>
              <el-divider>
                <p class="text-gray-500 text-xs">
                  {{ t("login.pureThirdLogin") }}
                </p>
              </el-divider>
              <div class="w-full flex justify-evenly third-party-icons">
                <span
                  v-for="(item, index) in thirdParty"
                  :key="index"
                  :title="t(item.title)"
                  class="third-party-item"
                >
                  <IconifyIconOnline
                    :icon="`ri:${item.icon}-fill`"
                    width="24"
                    class="cursor-pointer"
                  />
                </span>
              </div>
            </el-form-item>
          </Motion>

          <!-- 手机号登录 -->
          <LoginPhone v-if="currentPage === 1" />
          <!-- 二维码登录 -->
          <LoginQrCode v-if="currentPage === 2" />
          <!-- 注册 -->
          <LoginRegist v-if="currentPage === 3" />
          <!-- 忘记密码 -->
          <LoginUpdate v-if="currentPage === 4" />
        </div>
      </div>
    </div>

    <!-- 底部信息 -->
    <div class="footer-info">
      <div class="footer-links">
        <a href="https://pure-admin.cn" target="_blank">官方文档</a>
        <span class="divider">|</span>
        <a href="https://github.com/pure-admin" target="_blank">GitHub</a>
        <span class="divider">|</span>
        <a href="#">技术支持</a>
        <span class="divider">|</span>
        <a href="#">隐私政策</a>
      </div>
      <p class="copyright">
        © {{ new Date().getFullYear() }} Pure Admin. All rights reserved.
      </p>
    </div>
  </div>
</template>

<style scoped>
@import url("@/style/login.css");
</style>

<style lang="scss" scoped>
.login-page {
  position: relative;
  min-height: 100vh;
  overflow: hidden;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%);
}

.gradient-bg {
  position: fixed;
  inset: 0;
  background: 
    radial-gradient(ellipse at 20% 50%, rgba(120, 119, 198, 0.3) 0%, transparent 50%),
    radial-gradient(ellipse at 80% 20%, rgba(255, 119, 198, 0.2) 0%, transparent 40%),
    radial-gradient(ellipse at 40% 80%, rgba(120, 200, 255, 0.2) 0%, transparent 40%);
  z-index: 0;
}

.top-toolbar {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 40px;
  z-index: 100;
  backdrop-filter: blur(10px);
  background: rgba(255, 255, 255, 0.1);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.brand {
  display: flex;
  align-items: center;
  gap: 12px;
}

.brand-logo {
  width: 40px;
  height: 40px;
}

.brand-name {
  font-size: 24px;
  font-weight: 700;
  color: #fff;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.toolbar-actions {
  display: flex;
  align-items: center;
  gap: 16px;
}

.main-content {
  position: relative;
  display: grid;
  grid-template-columns: 1fr 480px;
  min-height: 100vh;
  padding: 100px 60px 80px;
  gap: 60px;
  z-index: 1;
}

.showcase-section {
  display: flex;
  flex-direction: column;
  justify-content: center;
  opacity: 0;
  transform: translateX(-30px);
  transition: all 0.8s cubic-bezier(0.4, 0, 0.2, 1);

  &.loaded {
    opacity: 1;
    transform: translateX(0);
  }
}

.hero-section {
  margin-bottom: 40px;
}

.hero-title {
  font-size: 56px;
  font-weight: 800;
  line-height: 1.2;
  margin-bottom: 24px;
}

.gradient-text {
  background: linear-gradient(135deg, #fff 0%, #e0e7ff 100%);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
  text-shadow: none;
}

.sub-title {
  color: rgba(255, 255, 255, 0.9);
  font-size: 32px;
  font-weight: 600;
}

.hero-desc {
  font-size: 18px;
  line-height: 1.8;
  color: rgba(255, 255, 255, 0.8);
  max-width: 600px;
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;
  margin-bottom: 40px;
}

.feature-card {
  display: flex;
  align-items: flex-start;
  gap: 16px;
  padding: 20px;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border-radius: 16px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  transition: all 0.3s ease;
  animation: fadeInUp 0.6s ease forwards;
  opacity: 0;

  &:hover {
    background: rgba(255, 255, 255, 0.15);
    transform: translateY(-4px);
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
  }
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.feature-icon {
  font-size: 32px;
  width: 56px;
  height: 56px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 12px;
}

.feature-content {
  h3 {
    font-size: 18px;
    font-weight: 600;
    color: #fff;
    margin-bottom: 6px;
  }

  p {
    font-size: 14px;
    color: rgba(255, 255, 255, 0.7);
    margin: 0;
  }
}

.statistics-bar {
  display: flex;
  gap: 40px;
  padding: 30px 0;
  border-top: 1px solid rgba(255, 255, 255, 0.2);
  border-bottom: 1px solid rgba(255, 255, 255, 0.2);
  margin-bottom: 40px;
}

.stat-item {
  text-align: center;
}

.stat-number {
  font-size: 36px;
  font-weight: 800;
  color: #fff;
  line-height: 1;
  margin-bottom: 8px;
}

.stat-label {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.7);
}

.illustration-wrapper {
  display: flex;
  justify-content: center;
  
  .main-illustration {
    width: 100%;
    max-width: 500px;
    height: auto;
    filter: drop-shadow(0 20px 40px rgba(0, 0, 0, 0.2));
    animation: float 6s ease-in-out infinite;
  }
}

@keyframes float {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-20px);
  }
}

.login-section {
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transform: translateX(30px);
  transition: all 0.8s cubic-bezier(0.4, 0, 0.2, 1);
  transition-delay: 0.2s;

  &.loaded {
    opacity: 1;
    transform: translateX(0);
  }
}

.login-card {
  width: 100%;
  max-width: 420px;
  padding: 40px;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border-radius: 24px;
  box-shadow: 
    0 25px 50px rgba(0, 0, 0, 0.15),
    0 0 0 1px rgba(255, 255, 255, 0.2);
}

.login-header {
  text-align: center;
  margin-bottom: 32px;
}

.login-avatar {
  width: 80px;
  height: 80px;
  margin-bottom: 16px;
}

.login-title {
  font-size: 28px;
  font-weight: 700;
  color: #1f2937;
  margin-bottom: 8px;
}

.login-subtitle {
  font-size: 14px;
  color: #6b7280;
}

.login-form {
  .floating-label-item {
    position: relative;
    
    :deep(.el-input__wrapper) {
      border-radius: 12px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
      height: 48px;
    }

    .floating-label {
      position: absolute;
      left: 40px;
      top: 50%;
      transform: translateY(-50%);
      color: #bfc3c7;
      font-size: 15px;
      pointer-events: none;
      transition: all 0.2s ease;
      z-index: 10;
    }

    &.is-focused .floating-label,
    &.has-value .floating-label {
      top: 0;
      font-size: 12px;
      color: #667eea;
      background: #fff;
      padding: 0 4px;
      left: 12px;
      z-index: 10;
    }
  }

  :deep(.el-button--primary) {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    border: none;
    border-radius: 12px;
    height: 48px;
    font-size: 16px;
    font-weight: 600;
    transition: all 0.3s ease;

    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 10px 30px rgba(102, 126, 234, 0.4);
    }
  }
}

.third-party-icons {
  margin-top: 16px;
}

.third-party-item {
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f3f4f6;
  border-radius: 12px;
  transition: all 0.3s ease;
  color: #6b7280;

  &:hover {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: #fff;
    transform: translateY(-4px);
    box-shadow: 0 10px 20px rgba(102, 126, 234, 0.3);
  }
}

.footer-info {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 20px;
  text-align: center;
  z-index: 10;
  backdrop-filter: blur(10px);
  background: rgba(0, 0, 0, 0.1);
}

.footer-links {
  display: flex;
  justify-content: center;
  gap: 16px;
  margin-bottom: 8px;

  a {
    color: rgba(255, 255, 255, 0.8);
    text-decoration: none;
    font-size: 14px;
    transition: color 0.3s;

    &:hover {
      color: #fff;
    }
  }

  .divider {
    color: rgba(255, 255, 255, 0.4);
  }
}

.copyright {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.6);
  margin: 0;
}

// 响应式设计
@media screen and (max-width: 1200px) {
  .main-content {
    grid-template-columns: 1fr;
    padding: 100px 40px 100px;
    gap: 40px;
  }

  .showcase-section {
    order: 2;
  }

  .login-section {
    order: 1;
  }

  .hero-title {
    font-size: 40px;
  }

  .sub-title {
    font-size: 24px;
  }

  .features-grid {
    grid-template-columns: 1fr;
  }

  .statistics-bar {
    flex-wrap: wrap;
    justify-content: center;
  }

  .illustration-wrapper {
    display: none;
  }
}

@media screen and (max-width: 768px) {
  .top-toolbar {
    padding: 16px 20px;
  }

  .brand-name {
    display: none;
  }

  .main-content {
    padding: 80px 20px 100px;
  }

  .hero-title {
    font-size: 32px;
  }

  .sub-title {
    font-size: 20px;
  }

  .hero-desc {
    font-size: 14px;
  }

  .login-card {
    padding: 24px;
    border-radius: 16px;
  }

  .feature-card {
    padding: 16px;
  }

  .statistics-bar {
    gap: 24px;
  }

  .stat-number {
    font-size: 28px;
  }
}

:deep(.el-input-group__append, .el-input-group__prepend) {
  padding: 0;
}

.translation {
  ::v-deep(.el-dropdown-menu__item) {
    padding: 5px 40px;
  }

  .check-btn {
    position: absolute;
    left: 20px;
  }
}
</style>
