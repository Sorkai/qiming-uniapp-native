<template>
  <div class="user-profile" :class="currentTheme">
    <!-- 顶部自定义横幅图片区域 -->
    <div
      v-if="extraInfo.bannerUrl || defaultBanner"
      class="profile-banner"
      :style="bannerStyle"
    >
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
        <el-button
          class="btn-elevated info"
          size="small"
          @click="openEditDialog"
        >
          <el-icon><Edit /></el-icon>
          <span>修改资料</span>
        </el-button>
        <el-button
          class="btn-elevated warn"
          size="small"
          @click="openPasswordDialog"
        >
          <el-icon><Lock /></el-icon>
          <span>修改密码</span>
        </el-button>
      </div>
    </div>

    <div class="profile-content">
      <div class="profile-avatar">
        <el-avatar :size="100" :src="formatAvatar(userInfo?.avatar)" />
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
            <div class="value">
              {{ userInfo?.username || userInfo?.mobile || "-" }}
            </div>
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
              <el-tag
                v-if="!extraInfo.email"
                size="small"
                type="info"
                effect="plain"
                >建议尽快完善</el-tag
              >
            </div>
          </div>
          <div class="info-item">
            <div class="label">性别</div>
            <div class="value">{{ getSexLabel }}</div>
          </div>
          <div class="info-item signature">
            <div class="label">个性签名</div>
            <div class="value">
              {{ displaySignature }}
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
        <div v-show="showStats" class="info-group stats">
          <div class="group-title">学习统计</div>
          <div
            :class="[
              'stats-content',
              {
                'is-loading-effect':
                  isFetchingStats && studyStats.totalHours === null
              }
            ]"
          >
            <div class="info-item">
              <div class="label">入驻日期</div>
              <div class="value">
                <el-icon><Calendar /></el-icon>
                <span>{{ studyStats.joinDate }}</span>
              </div>
            </div>
            <div class="info-item">
              <div class="label">作业均分</div>
              <div class="value">
                <el-icon><Check /></el-icon>
                <span class="score-value">{{ studyStats.avgScore }}</span>
              </div>
            </div>
            <div class="info-item">
              <div class="label">累计学时</div>
              <div class="value">
                <el-icon><Clock /></el-icon>
                <template v-if="studyStats.totalHours !== null">
                  <span class="number-solid">{{ studyStats.totalHours }}</span>
                  小时
                </template>
                <span v-else class="loading-placeholder">计算中...</span>
              </div>
            </div>
            <div class="info-item">
              <div class="label">总体进度</div>
              <div class="value progress-value">
                <template v-if="studyStats.totalProgress !== null">
                  <el-progress
                    :percentage="sanitizeProgress(studyStats.totalProgress)"
                    :format="val => val + '%'"
                    :stroke-width="10"
                    striped
                    striped-flow
                  />
                </template>
                <div
                  v-else
                  class="loading-placeholder"
                  style="
                    width: 100%;
                    height: 10px;
                    background: #eee;
                    border-radius: 5px;
                  "
                />
              </div>
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
            placeholder="请输入地址或点击右侧箭头选择"
            clearable
            @input="val => (bannerPreviewUrl = val)"
          >
            <template #suffix>
              <el-dropdown trigger="click" @command="handleBannerCommand">
                <el-icon
                  class="el-input__icon cursor-pointer"
                  style="margin-right: 8px"
                >
                  <ArrowDown />
                </el-icon>
                <template #dropdown>
                  <el-dropdown-menu>
                    <el-dropdown-item command="preset"
                      >选择预设图片</el-dropdown-item
                    >
                    <el-dropdown-item command="upload"
                      >上传自定义图片</el-dropdown-item
                    >
                  </el-dropdown-menu>
                </template>
              </el-dropdown>
            </template>
          </el-input>
          <input
            ref="bannerInputRef"
            type="file"
            hidden
            accept="image/*"
            @change="handleBannerFileChange"
          />
        </el-form-item>
        <el-form-item v-if="bannerPreviewUrl" label="预览">
          <div class="banner-preview">
            <img :src="bannerPreviewUrl" alt="banner" crossorigin="anonymous" />
          </div>
        </el-form-item>
        <el-form-item label="性别">
          <el-radio-group v-model="form.sex">
            <el-radio :value="1">男</el-radio>
            <el-radio :value="2">女</el-radio>
            <el-radio :value="0">保密</el-radio>
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

    <!-- 预设背景图选择弹窗 -->
    <el-dialog
      v-model="presetDialogVisible"
      title="选择预设背景图"
      width="600px"
      append-to-body
    >
      <div class="preset-banners-grid">
        <div
          v-for="url in presetBanners"
          :key="url"
          class="preset-item"
          @click="handleSelectPreset(url)"
        >
          <img :src="url" alt="preset" />
          <div class="preset-overlay">
            <el-icon><Plus /></el-icon>
            <span>点击裁剪</span>
          </div>
        </div>
      </div>
    </el-dialog>

    <!-- 图片裁剪弹窗 -->
    <el-dialog
      v-model="cropperDialogVisible"
      :title="currentCroppingType === 'avatar' ? '裁剪头像' : '裁剪横幅图'"
      width="800px"
      append-to-body
      destroy-on-close
    >
      <div v-if="cropperDialogVisible" class="cropper-container">
        <ReCropper
          ref="cropperRef"
          :src="croppingImage"
          :realTimePreview="false"
          crossorigin="anonymous"
          :options="{
            aspectRatio: currentCroppingType === 'avatar' ? 1 : 5,
            viewMode: 1,
            guides: true,
            checkCrossOrigin: true
          }"
          height="400px"
          @cropper="handleCropperResult"
          @error="handleCropperError"
        />
      </div>
      <template #footer>
        <el-button @click="cropperDialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="loading" @click="handleConfirmCrop">
          确认裁剪
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
import { ref, computed, onMounted, reactive, watch } from "vue";
import { useRouter } from "vue-router";
import {
  Edit,
  Plus,
  Lock,
  Calendar,
  Message,
  Check,
  ArrowDown,
  Clock
} from "@element-plus/icons-vue";
import type { FormInstance } from "element-plus";
import { ElMessage } from "element-plus";
import ReCropper from "@/components/ReCropper";
import { storageLocal } from "@pureadmin/utils";
import { formatAvatar } from "@/utils/avatar";
import { userKey, removeToken, getToken, setToken } from "@/utils/auth";
import type { DataInfo } from "@/utils/auth";
import {
  updateFrontendUserInfo,
  updateFrontendUserPassword,
  type UpdateUserInfoParams
} from "@/api/frontend/user";
import {
  uploadFile,
  getUserDetail,
  getStudentStats,
  type StudentStatsResult,
  type UserStatusResult
} from "@/api/user";
import { getFrontendCourseList } from "@/api/frontend/course";
import dayjs from "dayjs";

const props = defineProps<{
  currentTheme?: string;
}>();

const router = useRouter();
const defaultAvatar = "/src/assets/user.jpg";
const dialogVisible = ref(false);
const loading = ref(false);
const userInfo = ref<DataInfo<number> | any>(storageLocal().getItem(userKey));

// 动态加载预设背景图
const presetImages = import.meta.glob<string>(
  "@/assets/publicbackgroundpreset/*.{jpg,jpeg,png,heif,heic,HEIC,HEIF}",
  { eager: true, query: "?url", import: "default" }
);
const presetBanners = Object.values(presetImages) as string[];

// 弹窗与加载状态
const presetDialogVisible = ref(false);
const cropperDialogVisible = ref(false);
const currentCroppingType = ref<"avatar" | "banner">("avatar");
const croppingImage = ref("");
const cropperRef = ref();
const bannerInputRef = ref<HTMLInputElement>();

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
const bannerPreviewUrl = ref("");

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

const everBeenStudent = ref(false);

// 签名兜底：优先展示用户详情里的 info，缺失时尝试从其他接口补齐
const signatureFallback = ref("");
const displaySignature = computed(
  () =>
    userInfo.value?.info ||
    signatureFallback.value ||
    "这个人很懒，什么都没留下"
);

// 学习统计数据：入驻/均分取自 /user/study，学时/进度取自 /user/status，失败时回落到课程列表计算
// 学习统计持久化 Key
const STATS_STORAGE_KEY = "userStudyStatsCache";

// 必杀技 1：从缓存初始化，实现“秒开”不闪烁
const getInitialStats = () => {
  const cached = storageLocal().getItem(STATS_STORAGE_KEY) as any;
  // 核心改进：显式标记 null，区分“初始状态”和“数值为0”
  return {
    joinDate: cached?.joinDate || "--",
    avgScore: cached?.avgScore || "--",
    totalHours: cached?.totalHours !== undefined ? cached.totalHours : null,
    totalProgress:
      cached?.totalProgress !== undefined ? cached.totalProgress : null
  };
};

const studyStats = reactive(getInitialStats());

const sanitizeProgress = (val: any) => {
  const num = Number(val);
  return isNaN(num) || num < 0 ? 0 : Math.min(num, 100);
};

const normalizeProgress = (value?: number) => {
  const num = Number(value ?? 0);
  if (Number.isNaN(num)) return 0;
  if (num <= 1) return Math.round(num * 100);
  return Math.round(Math.min(num, 100));
};

// 已废弃 fillStatsFromCourses，统一由 fetchStudyStats 管理数据源

const isFetchingStats = ref(false);
const fetchStudyStats = async () => {
  // 严格锁：正在加载或角色不对直接退出
  if (userRole.value !== "学生" || isFetchingStats.value) return;

  isFetchingStats.value = true;

  try {
    // 【核心修复】直接从课程列表计算学时和进度，这是唯一可靠的数据源
    const courseRes = await getFrontendCourseList({
      pageNum: 1,
      pageSize: 100
    }).catch(() => null);

    if (courseRes?.code === 200 && courseRes.data?.list) {
      const list = courseRes.data.list;

      if (list.length > 0) {
        // 计算累计学时
        const totalHours = list.reduce(
          (acc, curr) => acc + (curr.finishedHours || 0),
          0
        );

        // 计算总体进度（百分比）
        const totalProg = list.reduce((acc, curr) => {
          const finished = curr.finishedHours || 0;
          const total = curr.totalHours || 0;
          return acc + (total > 0 ? finished / total : 0);
        }, 0);
        const totalProgress = Math.round((totalProg / list.length) * 100);

        // 直接更新，因为这是从可靠数据源计算出来的
        studyStats.totalHours = totalHours;
        studyStats.totalProgress = totalProgress;

        // 持久化缓存
        storageLocal().setItem(STATS_STORAGE_KEY, { ...studyStats });
      }
    }

    // 尝试获取入驻日期和均分（这些接口可能没有 mock）
    const statsRes = await getStudentStats().catch(() => null);
    if (statsRes?.code === 200 && statsRes.data) {
      const stats = statsRes.data;
      if (
        stats.avgScore &&
        stats.avgScore !== "暂无" &&
        stats.avgScore !== "--"
      ) {
        studyStats.avgScore = stats.avgScore;
      }
      if (stats.joinDate && stats.joinDate !== "--") {
        studyStats.joinDate = stats.joinDate;
      }
      const sig = stats.signature || stats.info || "";
      if (sig && !signatureFallback.value) {
        signatureFallback.value = sig;
      }
      // 更新缓存
      storageLocal().setItem(STATS_STORAGE_KEY, { ...studyStats });
    }
  } catch (error) {
    console.error("获取学习统计失败:", error);
  } finally {
    isFetchingStats.value = false;
  }
};

const loadExtraInfo = () => {
  try {
    const cached = storageLocal().getItem(EXTRA_KEY) as ExtraInfo | null;
    if (cached && cached.registrationTime) {
      Object.assign(extraInfo, cached, {
        lastLoginTime: dayjs().toISOString()
      });
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
  const emailRegex =
    /^(?:[\w!#$%&'*+/=?`{|}~^-]+(?:\.[\w!#$%&'*+/=?`{|}~^-]+)*)@(?:[A-Z0-9-]+\.)+[A-Z]{2,}$/i;
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
  if (roleType === undefined || roleType === null) return "普通用户";
  const rt = Number(roleType);
  switch (rt) {
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

// 监听角色变化，一旦是学生就记住
watch(
  userRole,
  val => {
    if (val === "学生") {
      everBeenStudent.value = true;
    }
  },
  { immediate: true }
);

const showStats = computed(() => {
  return userRole.value === "学生" || everBeenStudent.value;
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
    // 兼容多种 Mock 响应格式
    const isSuccess = res && (res.code === 200 || (res as any).success);
    const detailData =
      res?.data?.userInfo || (res as any)?.userInfo || res?.data;

    if (isSuccess && detailData) {
      const newUserInfo = detailData;

      // 验证关键字段，防止被后端空值覆盖导致 UI 闪烁
      if (newUserInfo.roleType === undefined || newUserInfo.roleType === null) {
        newUserInfo.roleType = userInfo.value?.roleType;
      }

      // 增量更新用户信息，必须确保认证元数据（refreshToken, expires, accessToken）绝对不丢失
      const tokenData = getToken();
      const localData = (storageLocal().getItem(userKey) as any) || {};

      // 深度合并新老数据，确保不丢失已有的认证字段
      const mergedUserInfo: any = {
        ...localData,
        ...newUserInfo
      };

      // 强行恢复可能被覆盖的关键认证字段
      if (tokenData) {
        mergedUserInfo.accessToken =
          (tokenData as any).accessToken || localData.accessToken;
        mergedUserInfo.refreshToken =
          (tokenData as any).refreshToken || localData.refreshToken;
        mergedUserInfo.expires =
          (tokenData as any).expires || localData.expires;
      }

      // 补全必要的默认权限（Mock 环境常备）
      mergedUserInfo.permissions = mergedUserInfo.permissions || ["*:*:*"];
      mergedUserInfo.roles = mergedUserInfo.roles || ["admin"];

      // 更新响应式数据
      userInfo.value = mergedUserInfo;

      // 只要有 accessToken 就走 setToken 链路进行同步
      if (mergedUserInfo.accessToken) {
        setToken({
          ...mergedUserInfo,
          // 统一 expires 格式为 Date 供 setToken 内部使用
          expires: mergedUserInfo.expires
            ? new Date(mergedUserInfo.expires)
            : new Date(Date.now() + 86400000)
        } as any);
      } else {
        storageLocal().setItem(userKey, mergedUserInfo);
      }

      // 通知全局 UI 更新
      window.dispatchEvent(
        new CustomEvent("userInfoUpdated", { detail: mergedUserInfo })
      );
      return true;
    } else {
      console.warn("获取用户详情失败，响应无效:", res);
      return false;
    }
  } catch (error) {
    console.error("同步用户信息出错:", error);
    return false;
  }
};

// 打开编辑对话框
const openEditDialog = () => {
  if (userInfo.value) {
    form.nickname = userInfo.value.nickname || "";
    form.sex = userInfo.value.sex || 0;
    form.info = userInfo.value.info || "";
    form.email = extraInfo.email || "";
    form.bannerUrl = userInfo.value.bannerUrl || extraInfo.bannerUrl || "";
    bannerPreviewUrl.value = form.bannerUrl;
    avatarUrl.value = userInfo.value.avatar || defaultAvatar;
  }
  dialogVisible.value = true;
};

// 处理头像变更
const handleAvatarChange = file => {
  const isLt2M = file.size / 1024 / 1024 < 2;
  if (!isLt2M) {
    ElMessage.error("头像图片大小不能超过 2MB!");
    return false;
  }
  currentCroppingType.value = "avatar";
  croppingImage.value = URL.createObjectURL(file.raw);
  cropperDialogVisible.value = true;
};

// 处理横幅图操作指令
const handleBannerCommand = (command: string) => {
  if (command === "preset") {
    presetDialogVisible.value = true;
  } else if (command === "upload") {
    bannerInputRef.value?.click();
  }
};

// 处理自定义横幅图上传
const handleBannerFileChange = (e: Event) => {
  const file = (e.target as HTMLInputElement).files?.[0];
  if (file) {
    currentCroppingType.value = "banner";
    croppingImage.value = URL.createObjectURL(file);
    cropperDialogVisible.value = true;
    (e.target as HTMLInputElement).value = "";
  }
};

// 处理选择预设图
const handleSelectPreset = (url: string) => {
  currentCroppingType.value = "banner";
  croppingImage.value = url;
  cropperDialogVisible.value = true;
};

// 处理裁剪错误
const handleCropperError = (error: any) => {
  console.error("裁剪组件发生错误:", error);
  ElMessage.error(`图片处理失败: ${error.message || "未知错误"}`);
  loading.value = false;
  cropperDialogVisible.value = false;
};

// 确认裁剪
const handleConfirmCrop = () => {
  if (cropperRef.value) {
    loading.value = true;
    cropperRef.value.croppered();
  }
};

// 接收裁剪结果
const handleCropperResult = async ({ blob, base64 }) => {
  try {
    const formData = new FormData();
    formData.append("file", blob, `crop_${Date.now()}.png`);

    const res = await uploadFile(formData);

    if (res.code === 200 && res.data?.url) {
      // 在 Mock 环境下，由于上传接口返回的是随机图片地址，会导致裁切效果失效。
      // 为了演示效果，如果是 Mock 地址（包含 picsum.photos），我们优先使用裁切后的 base64。
      const finalUrl =
        res.data.url.includes("picsum.photos") ||
        res.data.url.includes("placeholder")
          ? base64
          : res.data.url;

      if (currentCroppingType.value === "avatar") {
        form.avatar = finalUrl;
        avatarUrl.value = base64;
      } else {
        form.bannerUrl = finalUrl;
        bannerPreviewUrl.value = base64;
      }
      cropperDialogVisible.value = false;
      presetDialogVisible.value = false;
      ElMessage.success("图片处理成功");
    } else {
      ElMessage.error(res.msg || "图片上传失败");
    }
  } catch (error: any) {
    console.error("处理裁剪图片失败:", error);
    ElMessage.error(`图片处理失败: ${error.message || "未知错误"}`);
  } finally {
    loading.value = false;
  }
};

// 提交表单
const submitForm = async () => {
  if (!formRef.value) return;

  await formRef.value.validate(async valid => {
    if (valid) {
      try {
        loading.value = true;

        const updateData: UpdateUserInfoParams = {
          nickname: form.nickname,
          sex: form.sex,
          info: form.info,
          bannerUrl: form.bannerUrl
        };

        if (form.avatar) {
          updateData.avatar = form.avatar;
        }

        const res = await updateFrontendUserInfo(updateData);
        // 兼容不同的响应格式 (code 200 或 success true)
        const isSuccess = res && (res.code === 200 || (res as any).success);

        if (isSuccess) {
          extraInfo.email = form.email || "";
          extraInfo.bannerUrl = form.bannerUrl || "";
          persistExtra();

          // 等待用户信息同步完成，确保本地存储和 UI 状态一致
          const syncSuccess = await fetchUserDetail();
          if (syncSuccess) {
            ElMessage.success("资料修改成功");
            dialogVisible.value = false;
          }
        } else {
          ElMessage.error(res?.msg || "资料修改失败");
        }
      } catch (error) {
        console.error("更新个人资料失败:", error);
        ElMessage.error("更新资料时发生错误，请检查网络后重试");
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

          setTimeout(() => {
            removeToken();
            router.push("/home");
          }, 1500);
        } else {
          const errorMsg = getPasswordErrorMessage(code, msg);
          ElMessage.error(errorMsg);

          // 如果是原密码错误，清空原密码输入框方便用户重新输入
          if ((code === 400 || code === 100001) && msg?.includes("原密码")) {
            passwordForm.oldPassword = "";
          }
          // 如果是登录过期，提示用户重新登录
          if (code === 401) {
            setTimeout(() => {
              removeToken();
              router.push("/home");
            }, 1500);
          }
        }
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
          ElMessage.error("网络连接失败，请检查网络后重试");
        } else {
          const errorMsg = getPasswordErrorMessage(code, msg);
          ElMessage.error(errorMsg);
        }
      } finally {
        passwordLoading.value = false;
      }
    }
  });
};

const formattedRegisterTime = computed(() =>
  extraInfo.registrationTime
    ? dayjs(extraInfo.registrationTime).format("YYYY-MM-DD HH:mm:ss")
    : "-"
);
const formattedLastLoginTime = computed(() =>
  extraInfo.lastLoginTime
    ? dayjs(extraInfo.lastLoginTime).format("YYYY-MM-DD HH:mm:ss")
    : "-"
);

const defaultBanner = "/src/assets/course/cover-default.jpg";
const bannerStyle = computed(() => {
  const url = userInfo.value?.bannerUrl || extraInfo.bannerUrl || defaultBanner;
  return { backgroundImage: `url(${url})` };
});

onMounted(async () => {
  loadExtraInfo();

  // 先同步用户信息
  await fetchUserDetail();

  // 确认是学生后，获取学习统计（只调用一次，避免竞态）
  if (userRole.value === "学生") {
    await fetchStudyStats();
  }
});
</script>

<style lang="scss" scoped>
.user-profile {
  .profile-banner {
    position: relative;
    display: flex;
    align-items: flex-end;
    width: 100%;
    height: 180px;
    margin: 0 0 24px;
    overflow: hidden;
    background-repeat: no-repeat;
    background-position: center center;
    background-size: cover;
    border-radius: 16px;
    box-shadow: 0 6px 18px -4px rgb(0 0 0 / 12%);

    .banner-overlay {
      position: absolute;
      inset: 0;
      display: flex;
      align-items: flex-end;
      padding: 18px 24px;
      background: linear-gradient(
        to bottom,
        rgb(0 0 0 / 15%),
        rgb(0 0 0 / 55%)
      );
    }

    .banner-text {
      color: #fff;
    }

    .banner-title {
      font-size: 20px;
      font-weight: 600;
      letter-spacing: 0.5px;
    }

    .banner-sub {
      margin-top: 4px;
      font-size: 12px;
      opacity: 0.85;
    }
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

      .dark & {
        color: #f1f5f9;
      }
    }

    .action-buttons {
      display: flex;
      gap: 12px;

      .btn-elevated {
        position: relative;
        display: inline-flex;
        gap: 4px;
        align-items: center;
        padding: 6px 14px;
        overflow: hidden;
        font-weight: 500;
        color: #fff;
        background: linear-gradient(135deg, #6366f1, #8b5cf6);
        border: none;
        border-radius: 6px;
        box-shadow: 0 4px 12px rgb(99 102 241 / 35%);
        transition:
          transform 0.2s,
          box-shadow 0.2s;

        &.warn {
          background: linear-gradient(135deg, #f59e0b, #f97316);
          box-shadow: 0 4px 12px rgb(251 146 60 / 35%);
        }

        &.info {
          background: linear-gradient(135deg, #3b82f6, #6366f1);
        }

        &:hover {
          box-shadow: 0 6px 16px rgb(99 102 241 / 45%);
          transform: translateY(-2px);

          &.warn {
            box-shadow: 0 6px 16px rgb(251 146 60 / 45%);
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

    @media (width <= 768px) {
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

    .dark & {
      background-color: #111b2d;
    }

    .el-avatar {
      margin-bottom: 16px;
      box-shadow: 0 0 10px rgb(0 0 0 / 10%);
    }

    .user-name {
      margin-bottom: 4px;
      font-size: 18px;
      font-weight: 600;
      color: #333;

      .dark & {
        color: #f1f5f9;
      }
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
    display: flex;
    flex: 1;
    flex-wrap: wrap;
    gap: 32px;

    .info-group {
      position: relative;
      flex: 1 1 320px;
      padding: 18px 22px 8px;
      background: linear-gradient(145deg, #fff, #f3f4f6);
      border: 1px solid #eef0f4;
      border-radius: 12px;
      box-shadow: 0 4px 12px rgb(0 0 0 / 4%);
      backdrop-filter: blur(4px);
      transition:
        box-shadow 0.25s,
        transform 0.25s;

      .dark & {
        background: linear-gradient(145deg, #111b2d, #1e293b);
        border-color: #1e293b;
        box-shadow: 0 4px 12px rgb(0 0 0 / 30%);
      }

      &:hover {
        box-shadow: 0 8px 22px -4px rgb(0 0 0 / 8%);
        transform: translateY(-2px);
      }

      &.timeline {
        background: linear-gradient(135deg, #fdfbfb, #ebedee);

        .dark & {
          background: linear-gradient(135deg, #0f172a, #111b2d);
        }
      }

      .group-title {
        position: relative;
        padding-left: 10px;
        margin-bottom: 14px;
        font-size: 15px;
        font-weight: 600;
        color: #374151;

        .dark & {
          color: #f1f5f9;
        }

        &::before {
          position: absolute;
          top: 3px;
          left: 0;
          width: 4px;
          height: 14px;
          content: "";
          background: linear-gradient(180deg, #6366f1, #8b5cf6);
          border-radius: 2px;
        }
      }

      .info-item {
        display: flex;
        align-items: flex-start;
        margin-bottom: 14px;
        font-size: 13px;
        line-height: 20px;

        .label {
          width: 72px;
          font-weight: 500;
          color: #6b7280;

          .dark & {
            color: #94a3b8;
          }
        }

        .value {
          display: flex;
          flex: 1;
          gap: 6px;
          align-items: center;
          color: #1f2937;
          word-break: break-all;

          .dark & {
            color: #e2e8f0;
          }
        }

        &.signature .value {
          line-height: 1.4;
          white-space: pre-wrap;
        }

        .time-value {
          .el-icon {
            color: #6366f1;
          }
        }

        .email-value {
          .el-icon {
            color: #10b981;
          }
        }

        .score-value {
          font-weight: 600;
          color: #f59e0b;
        }

        .progress-value {
          flex: 1;
          max-width: 180px;
          margin-left: 8px;
        }
      }
    }

    .info-group.stats {
      background: linear-gradient(145deg, #f0fdf4, #dcfce7);

      .dark & {
        background: linear-gradient(145deg, #064e3b, #022c22);
      }

      &::before {
        background: linear-gradient(180deg, #10b981, #059669);
      }
    }

    .stats-content {
      position: relative;

      &.is-loading-effect {
        &::after {
          position: absolute;
          inset: 0;
          z-index: 1;
          pointer-events: none;
          content: "";
          background: rgb(255 255 255 / 30%);
        }
      }

      .number-solid {
        display: inline-block;
        min-width: 12px;
        font-weight: bold;
      }

      .loading-placeholder {
        color: #999;
        animation: pulse 1.5s infinite;
      }
    }
  }
}

@keyframes pulse {
  0% {
    opacity: 0.6;
  }

  50% {
    opacity: 1;
  }

  100% {
    opacity: 0.6;
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
      background-color: #97b4f7;
      border-radius: 50%;
      box-shadow: 0 2px 6px rgb(0 0 0 / 15%);

      .el-icon {
        font-size: 14px;
      }
    }
  }
}

.banner-preview {
  width: 100%;
  max-height: 120px;
  overflow: hidden;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  box-shadow: 0 4px 10px -2px rgb(0 0 0 / 6%);

  img {
    display: block;
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
}

.preset-banners-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
  padding: 8px;

  .preset-item {
    position: relative;
    aspect-ratio: 16 / 9;
    overflow: hidden;
    cursor: pointer;
    border-radius: 8px;
    box-shadow: 0 2px 8px rgb(0 0 0 / 10%);
    transition: transform 0.3s;

    &:hover {
      transform: scale(1.02);

      .preset-overlay {
        opacity: 1;
      }
    }

    img {
      display: block;
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .preset-overlay {
      position: absolute;
      inset: 0;
      display: flex;
      flex-direction: column;
      gap: 8px;
      align-items: center;
      justify-content: center;
      color: #fff;
      background: rgb(0 0 0 / 40%);
      opacity: 0;
      transition: opacity 0.3s;

      .el-icon {
        font-size: 24px;
      }
    }
  }
}

.cropper-container {
  padding: 20px;
  background: #f8f9fa;
  border-radius: 8px;
}

@media (width <= 768px) {
  .user-profile {
    .profile-info {
      flex-direction: column;
    }
  }
}
</style>
