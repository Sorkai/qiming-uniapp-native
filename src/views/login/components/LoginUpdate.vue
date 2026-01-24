<script setup lang="ts">
import { useI18n } from "vue-i18n";
import { ref, reactive } from "vue";
import Motion from "../utils/motion";
import { message } from "@/utils/message";
import { updateRules } from "../utils/rule";
import type { FormInstance } from "element-plus";
import { useVerifyCode } from "../utils/verifyCode";
import { $t, transformI18n } from "@/plugins/i18n";
import { useUserStoreHook } from "@/store/modules/user";
import ReInvisibleInk from "@/components/ReInvisibleInk/index.vue";
import { useRenderIcon } from "@/components/ReIcon/src/hooks";
import Lock from "~icons/ri/lock-fill";
import Eye from "~icons/ri/eye-line";
import EyeOff from "~icons/ri/eye-off-line";
import Iphone from "~icons/ep/iphone";
import Keyhole from "~icons/ri/shield-keyhole-line";

const { t } = useI18n();
const loading = ref(false);
const isPhoneFocused = ref(false);
const isVerifyCodeFocused = ref(false);
const isPasswordFocused = ref(false);
const isRepeatPasswordFocused = ref(false);
const passwordVisible = ref(false);
const repeatPasswordVisible = ref(false);
const ruleForm = reactive({
  phone: "",
  verifyCode: "",
  password: "",
  repeatPassword: ""
});
const ruleFormRef = ref<FormInstance>();
const { isDisabled, text } = useVerifyCode();
const repeatPasswordRule = [
  {
    validator: (rule, value, callback) => {
      if (value === "") {
        callback(new Error(transformI18n($t("login.purePassWordSureReg"))));
      } else if (ruleForm.password !== value) {
        callback(
          new Error(transformI18n($t("login.purePassWordDifferentReg")))
        );
      } else {
        callback();
      }
    },
    trigger: "blur"
  }
];

// 根据错误码获取友好的错误提示
const getPasswordErrorMessage = (code: number, msg?: string): string => {
  const errorMessages: Record<number, string> = {
    400: msg || "请求参数错误，请检查输入",
    401: "登录已过期，请重新登录后再试",
    429: "操作过于频繁，请稍后再试",
    500: "服务器繁忙，请稍后重试"
  };

  // 优先使用后端返回的具体错误信息
  if (msg && msg !== "系统错误" && msg !== "error" && msg.length > 0) {
    return msg;
  }

  return errorMessages[code] || msg || "密码修改失败，请稍后重试";
};

const onUpdate = async (formEl: FormInstance | undefined) => {
  if (!formEl) return;
  await formEl.validate(async valid => {
    if (valid) {
      loading.value = true;
      try {
        // 模拟请求，需根据实际开发进行修改
        await new Promise(resolve => setTimeout(resolve, 2000));
        message(transformI18n($t("login.purePassWordUpdateReg")), {
          type: "success"
        });
      } catch (error: any) {
        console.error("修改密码失败:", error);
        // 优先从响应中获取错误信息
        const responseData = error.response?.data;
        const code = responseData?.code || error.code || 500;
        const msg = responseData?.msg || error.msg || error.message;

        // 网络错误特殊处理
        if (
          error.message?.includes("Network Error") ||
          error.message?.includes("timeout")
        ) {
          message("网络连接失败，请检查网络后重试", { type: "error" });
        } else {
          const errorMsg = getPasswordErrorMessage(code, msg);
          message(errorMsg, { type: "error" });
        }
      } finally {
        loading.value = false;
      }
    }
  });
};

function onBack() {
  useVerifyCode().end();
  useUserStoreHook().SET_CURRENTPAGE(0);
}
</script>

<template>
  <el-form
    ref="ruleFormRef"
    :model="ruleForm"
    :rules="updateRules"
    size="large"
  >
    <Motion>
      <el-form-item
        prop="phone"
        class="floating-label-item"
        :class="{ 'has-value': !!ruleForm.phone, 'is-focused': isPhoneFocused }"
      >
        <el-input
          v-model="ruleForm.phone"
          clearable
          placeholder=""
          :prefix-icon="useRenderIcon(Iphone)"
          @focus="isPhoneFocused = true"
          @blur="isPhoneFocused = false"
        />
        <label class="floating-label">{{ t("login.purePhone") }}</label>
      </el-form-item>
    </Motion>

    <Motion :delay="100">
      <el-form-item
        prop="verifyCode"
        class="floating-label-item"
        :class="{
          'has-value': !!ruleForm.verifyCode,
          'is-focused': isVerifyCodeFocused
        }"
      >
        <div class="w-full flex justify-between">
          <el-input
            v-model="ruleForm.verifyCode"
            clearable
            placeholder=""
            :prefix-icon="useRenderIcon(Keyhole)"
            @focus="isVerifyCodeFocused = true"
            @blur="isVerifyCodeFocused = false"
          />
          <label class="floating-label">{{
            t("login.pureSmsVerifyCode")
          }}</label>
          <el-button
            :disabled="isDisabled"
            class="ml-2"
            @click="useVerifyCode().start(ruleFormRef, 'phone')"
          >
            {{
              text.length > 0
                ? text + t("login.pureInfo")
                : t("login.pureGetVerifyCode")
            }}
          </el-button>
        </div>
      </el-form-item>
    </Motion>

    <Motion :delay="150">
      <el-form-item
        prop="password"
        class="floating-label-item"
        :class="{
          'has-value': !!ruleForm.password,
          'is-focused': isPasswordFocused
        }"
      >
        <ReInvisibleInk
          :active="!passwordVisible && !!ruleForm.password"
          class="w-full"
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
        <label class="floating-label">{{ t("login.purePassword") }}</label>
      </el-form-item>
    </Motion>

    <Motion :delay="200">
      <el-form-item
        :rules="repeatPasswordRule"
        prop="repeatPassword"
        class="floating-label-item"
        :class="{
          'has-value': !!ruleForm.repeatPassword,
          'is-focused': isRepeatPasswordFocused
        }"
      >
        <ReInvisibleInk
          :active="!repeatPasswordVisible && !!ruleForm.repeatPassword"
          class="w-full"
        >
          <el-input
            v-model="ruleForm.repeatPassword"
            clearable
            :type="repeatPasswordVisible ? 'text' : 'password'"
            placeholder=""
            :prefix-icon="useRenderIcon(Lock)"
            @focus="isRepeatPasswordFocused = true"
            @blur="isRepeatPasswordFocused = false"
          >
            <template #suffix>
              <IconifyIconOffline
                :icon="repeatPasswordVisible ? Eye : EyeOff"
                class="cursor-pointer"
                @click="repeatPasswordVisible = !repeatPasswordVisible"
              />
            </template>
          </el-input>
        </ReInvisibleInk>
        <label class="floating-label">{{ t("login.pureSure") }}</label>
      </el-form-item>
    </Motion>

    <Motion :delay="250">
      <el-form-item>
        <el-button
          class="w-full"
          size="default"
          type="primary"
          :loading="loading"
          @click="onUpdate(ruleFormRef)"
        >
          {{ t("login.pureDefinite") }}
        </el-button>
      </el-form-item>
    </Motion>

    <Motion :delay="300">
      <el-form-item>
        <el-button class="w-full" size="default" @click="onBack">
          {{ t("login.pureBack") }}
        </el-button>
      </el-form-item>
    </Motion>
  </el-form>
</template>

<style lang="scss" scoped>
.floating-label-item {
  position: relative;

  :deep(.el-input__wrapper) {
    height: 48px;
    border-radius: 12px;
    box-shadow: 0 2px 8px rgb(0 0 0 / 4%);
  }

  .floating-label {
    position: absolute;
    top: 50%;
    left: 40px;
    z-index: 10;
    font-size: 15px;
    color: #bfc3c7;
    pointer-events: none;
    transform: translateY(-50%);
    transition: all 0.2s ease;
  }

  &.is-focused .floating-label,
  &.has-value .floating-label {
    top: 0;
    left: 12px;
    z-index: 10;
    padding: 0 4px;
    font-size: 12px;
    color: #667eea;
    background: #fff;
  }
}
</style>
