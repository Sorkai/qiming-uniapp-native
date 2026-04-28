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
import { useRenderIcon } from "@/components/ReIcon/src/hooks";
import Lock from "~icons/ri/lock-fill";
import Eye from "~icons/ri/eye-line";
import EyeOff from "~icons/ri/eye-off-line";
import Iphone from "~icons/ep/iphone";
import User from "~icons/ri/user-3-fill";
import Keyhole from "~icons/ri/shield-keyhole-line";

const { t } = useI18n();
const checked = ref(false);
const loading = ref(false);
const isUsernameFocused = ref(false);
const isPhoneFocused = ref(false);
const isVerifyCodeFocused = ref(false);
const isPasswordFocused = ref(false);
const isRepeatPasswordFocused = ref(false);
const passwordVisible = ref(false);
const repeatPasswordVisible = ref(false);
const ruleForm = reactive({
  username: "",
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

const onUpdate = async (formEl: FormInstance | undefined) => {
  loading.value = true;
  if (!formEl) return;
  await formEl.validate(valid => {
    if (valid) {
      if (checked.value) {
        // 模拟请求，需根据实际开发进行修改
        setTimeout(() => {
          message(transformI18n($t("login.pureRegisterSuccess")), {
            type: "success"
          });
          loading.value = false;
        }, 2000);
      } else {
        loading.value = false;
        message(transformI18n($t("login.pureTickPrivacy")), {
          type: "warning"
        });
      }
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
  <el-form
    ref="ruleFormRef"
    :model="ruleForm"
    :rules="updateRules"
    size="large"
  >
    <Motion>
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
        :class="{
          'has-value': !!ruleForm.username,
          'is-focused': isUsernameFocused
        }"
      >
        <el-input
          v-model="ruleForm.username"
          clearable
          placeholder=""
          :prefix-icon="useRenderIcon(User)"
          @focus="isUsernameFocused = true"
          @blur="isUsernameFocused = false"
        />
        <label class="floating-label">{{ t("login.pureUsername") }}</label>
      </el-form-item>
    </Motion>

    <Motion :delay="100">
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

    <Motion :delay="150">
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
        <label class="floating-label">{{ t("login.pureSmsVerifyCode") }}</label>
      </el-form-item>
    </Motion>

    <Motion :delay="200">
      <el-form-item
        prop="password"
        class="floating-label-item"
        :class="{
          'has-value': !!ruleForm.password,
          'is-focused': isPasswordFocused
        }"
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
        <label class="floating-label">{{ t("login.purePassword") }}</label>
      </el-form-item>
    </Motion>

    <Motion :delay="250">
      <el-form-item
        :rules="repeatPasswordRule"
        prop="repeatPassword"
        class="floating-label-item"
        :class="{
          'has-value': !!ruleForm.repeatPassword,
          'is-focused': isRepeatPasswordFocused
        }"
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
        <label class="floating-label">{{ t("login.pureSure") }}</label>
      </el-form-item>
    </Motion>

    <Motion :delay="300">
      <el-form-item>
        <el-checkbox v-model="checked">
          {{ t("login.pureReadAccept") }}
        </el-checkbox>
        <el-button link type="primary">
          {{ t("login.purePrivacyPolicy") }}
        </el-button>
      </el-form-item>
    </Motion>

    <Motion :delay="350">
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

    <Motion :delay="400">
      <el-form-item>
        <el-button class="w-full" size="default" @click="onBack">
          {{ t("login.pureBack") }}
        </el-button>
      </el-form-item>
    </Motion>
  </el-form>
</template>
