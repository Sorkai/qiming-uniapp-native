<script setup lang="ts">
import { useI18n } from "vue-i18n";
import { ref, reactive } from "vue";
import Motion from "../utils/motion";
import { message } from "@/utils/message";
import { phoneRules } from "../utils/rule";
import type { FormInstance } from "element-plus";
import { $t, transformI18n } from "@/plugins/i18n";
import { useVerifyCode } from "../utils/verifyCode";
import { useUserStoreHook } from "@/store/modules/user";
import { useRenderIcon } from "@/components/ReIcon/src/hooks";
import Iphone from "~icons/ep/iphone";
import Keyhole from "~icons/ri/shield-keyhole-line";

const { t } = useI18n();
const loading = ref(false);
const isPhoneFocused = ref(false);
const isVerifyCodeFocused = ref(false);
const ruleForm = reactive({
  phone: "",
  verifyCode: ""
});
const ruleFormRef = ref<FormInstance>();
const { isDisabled, text } = useVerifyCode();

const onLogin = async (formEl: FormInstance | undefined) => {
  loading.value = true;
  if (!formEl) return;
  await formEl.validate(valid => {
    if (valid) {
      // 模拟登录请求，需根据实际开发进行修改
      setTimeout(() => {
        message(transformI18n($t("login.pureLoginSuccess")), {
          type: "success"
        });
        loading.value = false;
      }, 2000);
    } else {
      loading.value = false;
    }
  });
};

function onBack() {
  useVerifyCode().end();
  useUserStoreHook().SET_CURRENTPAGE(0);
}
</script>

<template>
  <el-form ref="ruleFormRef" :model="ruleForm" :rules="phoneRules" size="large">
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
      <el-form-item>
        <el-button
          class="w-full"
          size="default"
          type="primary"
          :loading="loading"
          @click="onLogin(ruleFormRef)"
        >
          {{ t("login.pureLogin") }}
        </el-button>
      </el-form-item>
    </Motion>

    <Motion :delay="200">
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
