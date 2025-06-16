<template>
  <el-form
    ref="formRef"
    v-loading="loading"
    :model="formData"
    :rules="formRules"
    label-width="100px"
  >
    <el-form-item label="课程标题" prop="title">
      <el-input v-model="formData.title" placeholder="请输入课程标题" />
    </el-form-item>

    <el-form-item label="课程简介" prop="shortDesc">
      <el-input
        v-model="formData.shortDesc"
        type="textarea"
        :rows="4"
        placeholder="请输入课程简介"
      />
    </el-form-item>

    <el-row :gutter="20">
      <el-col :span="12">
        <el-form-item label="是否必修" prop="isRequired">
          <el-radio-group v-model="formData.isRequired">
            <el-radio :label="1">必修</el-radio>
            <el-radio :label="0">选修</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-col>
      <el-col :span="12">
        <el-form-item label="是否章节" prop="isChapter">
          <el-radio-group v-model="formData.isChapter">
            <el-radio :label="1">是</el-radio>
            <el-radio :label="0">否</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-col>
    </el-row>

    <el-form-item label="课程封面" prop="thumb">
      <div class="upload-box">
        <div v-if="formData.thumbUrl" class="upload-preview">
          <el-image
            style="width: 200px; height: 120px"
            :src="formData.thumbUrl"
            fit="cover"
          />
          <div class="upload-actions">
            <el-button type="danger" size="small" @click="removeCover"
              >移除</el-button
            >
          </div>
        </div>
        <el-upload
          v-else
          class="upload-trigger"
          action="#"
          :auto-upload="false"
          :show-file-list="false"
          :on-change="handleCoverUpload"
        >
          <div class="upload-icon-container">
            <el-icon><Plus /></el-icon>
          </div>
        </el-upload>
      </div>
    </el-form-item>

    <el-form-item label="课程分类" prop="categoryIds">
      <el-checkbox-group v-model="formData.categoryIds">
        <el-checkbox
          v-for="category in categoryOptions"
          :key="category.categoryId"
          :label="category.categoryId"
        >
          {{ category.name }}
        </el-checkbox>
      </el-checkbox-group>
    </el-form-item>

    <el-form-item label="结束时间" prop="endingTime">
      <el-date-picker
        v-model="formData.endingTime"
        type="datetime"
        placeholder="选择结束时间"
        value-format="YYYY-MM-DD HH:mm:ss"
      />
    </el-form-item>

    <!-- 章节和课时 -->
    <div class="form-section">
      <div class="section-header">
        <h3>章节与课时</h3>
        <div>
          <el-button
            v-if="formData.isChapter === 1"
            type="primary"
            @click="addChapter"
            >添加章节</el-button
          >
          <el-button
            v-if="formData.isChapter === 0"
            type="primary"
            @click="addHour"
            >添加课时</el-button
          >
        </div>
      </div>

      <!-- 章节模式 -->
      <template v-if="formData.isChapter === 1">
        <div v-if="formData.chapterList.length === 0" class="empty-placeholder">
          尚未添加章节，请点击"添加章节"按钮添加
        </div>
        <el-collapse v-else v-model="activeChapters">
          <el-collapse-item
            v-for="(chapter, chapterIndex) in formData.chapterList"
            :key="'chapter-' + chapterIndex"
            :name="chapterIndex"
          >
            <template #title>
              <div class="chapter-header">
                <span
                  >{{ chapter.name || "未命名章节" }}
                  <span class="required-mark">*</span></span
                >
                <div class="chapter-actions">
                  <el-button
                    type="danger"
                    size="small"
                    @click.stop="removeChapter(chapterIndex)"
                    >删除章节</el-button
                  >
                </div>
              </div>
            </template>
            <div class="chapter-content">
              <el-form-item
                :label="'章节名称'"
                :prop="'chapterList.' + chapterIndex + '.name'"
                :rules="[
                  { required: true, message: '请输入章节名称', trigger: 'blur' }
                ]"
              >
                <div class="input-with-actions">
                  <el-input
                    v-model="chapter.name"
                    placeholder="请输入章节名称"
                  />
                </div>
              </el-form-item>

              <div class="hour-list-header">
                <h4>课时列表</h4>
                <el-button
                  type="primary"
                  size="small"
                  @click="addHourToChapter(chapterIndex)"
                  >添加课时</el-button
                >
              </div>

              <div
                v-if="chapter.hourList.length === 0"
                class="empty-placeholder"
              >
                尚未添加课时，点击"添加课时"按钮添加<span class="required-hint"
                  >（课时标题为必填项）</span
                >
              </div>
              <div v-else class="hour-list">
                <el-collapse v-model="activeHours[chapterIndex]">
                  <el-collapse-item
                    v-for="(hour, hourIndex) in chapter.hourList"
                    :key="'hour-' + chapterIndex + '-' + hourIndex"
                    :name="hourIndex"
                  >
                    <template #title>
                      <div class="hour-header">
                        <span
                          >{{ hour.title || "未命名课时" }}
                          <span class="required-mark">*</span></span
                        >
                        <div class="hour-title-actions">
                          <el-button
                            type="danger"
                            size="small"
                            @click.stop="
                              removeHourFromChapter(chapterIndex, hourIndex)
                            "
                            >删除课时</el-button
                          >
                        </div>
                      </div>
                    </template>
                    <div class="hour-content">
                      <div class="hour-card">
                        <el-row :gutter="20">
                          <el-col :span="24">
                            <el-form-item
                              :label="'课时标题'"
                              :prop="
                                'chapterList.' +
                                chapterIndex +
                                '.hourList.' +
                                hourIndex +
                                '.title'
                              "
                              :rules="[
                                {
                                  required: true,
                                  message: '请输入课时标题',
                                  trigger: 'blur'
                                }
                              ]"
                            >
                              <el-input
                                v-model="hour.title"
                                placeholder="请输入课时标题"
                              />
                            </el-form-item>
                          </el-col>
                        </el-row>

                        <el-row :gutter="20">
                          <el-col :span="12">
                            <el-form-item
                              :label="'时长(秒)'"
                              :prop="
                                'chapterList.' +
                                chapterIndex +
                                '.hourList.' +
                                hourIndex +
                                '.duration'
                              "
                            >
                              <el-input-number
                                v-model="hour.duration"
                                :min="0"
                                :step="1"
                              />
                            </el-form-item>
                          </el-col>
                          <el-col :span="12">
                            <el-form-item
                              :label="'资源类型'"
                              :prop="
                                'chapterList.' +
                                chapterIndex +
                                '.hourList.' +
                                hourIndex +
                                '.rType'
                              "
                            >
                              <el-select
                                v-model="hour.rType"
                                placeholder="请选择资源类型"
                              >
                                <el-option label="视频" value="video" />
                                <el-option label="音频" value="audio" />
                                <el-option label="文档" value="document" />
                              </el-select>
                            </el-form-item>
                          </el-col>
                        </el-row>

                        <el-form-item
                          :label="'课时资源'"
                          :prop="
                            'chapterList.' +
                            chapterIndex +
                            '.hourList.' +
                            hourIndex +
                            '.resourceId'
                          "
                        >
                          <div class="upload-with-preview">
                            <div v-if="hour.fileUrl" class="resource-preview">
                              <div class="resource-info">
                                <i class="el-icon-document" />
                                <span class="resource-name">{{
                                  getFileName(hour.fileUrl)
                                }}</span>
                              </div>
                              <div class="resource-actions">
                                <el-button
                                  size="small"
                                  @click="previewResource(hour.fileUrl)"
                                  >预览</el-button
                                >
                                <el-button
                                  size="small"
                                  type="danger"
                                  @click="
                                    removeResource(chapter.hourList, hourIndex)
                                  "
                                  >移除</el-button
                                >
                              </div>
                            </div>
                            <el-upload
                              v-else
                              class="resource-upload"
                              action="#"
                              :auto-upload="false"
                              :show-file-list="false"
                              :on-change="
                                file =>
                                  handleResourceUpload(
                                    file,
                                    chapter.hourList,
                                    hourIndex
                                  )
                              "
                            >
                              <div class="upload-icon-container">
                                <el-icon><Plus /></el-icon>
                              </div>
                            </el-upload>
                          </div>
                        </el-form-item>
                      </div>
                    </div>
                  </el-collapse-item>
                </el-collapse>
              </div>
            </div>
          </el-collapse-item>
        </el-collapse>
      </template>

      <!-- 非章节模式 -->
      <template v-else>
        <div v-if="formData.hourList.length === 0" class="empty-placeholder">
          尚未添加课时，点击"添加课时"按钮添加<span class="required-hint"
            >（课时标题为必填项）</span
          >
        </div>
        <div v-else class="hour-list">
          <el-collapse v-model="activeHours.standalone">
            <el-collapse-item
              v-for="(hour, hourIndex) in formData.hourList"
              :key="'hour-' + hourIndex"
              :name="hourIndex"
            >
              <template #title>
                <div class="hour-header">
                  <span
                    >{{ hour.title || "未命名课时" }}
                    <span class="required-mark">*</span></span
                  >
                  <div class="hour-title-actions">
                    <el-button
                      type="danger"
                      size="small"
                      @click.stop="removeHour(hourIndex)"
                      >删除课时</el-button
                    >
                  </div>
                </div>
              </template>
              <div class="hour-content">
                <div class="hour-card">
                  <el-row :gutter="20">
                    <el-col :span="24">
                      <el-form-item
                        :label="'课时标题'"
                        :prop="'hourList.' + hourIndex + '.title'"
                        :rules="[
                          {
                            required: true,
                            message: '请输入课时标题',
                            trigger: 'blur'
                          }
                        ]"
                      >
                        <el-input
                          v-model="hour.title"
                          placeholder="请输入课时标题"
                        />
                      </el-form-item>
                    </el-col>
                  </el-row>

                  <el-row :gutter="20">
                    <el-col :span="12">
                      <el-form-item
                        :label="'时长(秒)'"
                        :prop="'hourList.' + hourIndex + '.duration'"
                      >
                        <el-input-number
                          v-model="hour.duration"
                          :min="0"
                          :step="1"
                        />
                      </el-form-item>
                    </el-col>
                    <el-col :span="12">
                      <el-form-item
                        :label="'资源类型'"
                        :prop="'hourList.' + hourIndex + '.rType'"
                      >
                        <el-select
                          v-model="hour.rType"
                          placeholder="请选择资源类型"
                        >
                          <el-option label="视频" value="video" />
                          <el-option label="音频" value="audio" />
                          <el-option label="文档" value="document" />
                        </el-select>
                      </el-form-item>
                    </el-col>
                  </el-row>

                  <el-form-item
                    :label="'课时资源'"
                    :prop="'hourList.' + hourIndex + '.resourceId'"
                  >
                    <div class="upload-with-preview">
                      <div v-if="hour.fileUrl" class="resource-preview">
                        <div class="resource-info">
                          <i class="el-icon-document" />
                          <span class="resource-name">{{
                            getFileName(hour.fileUrl)
                          }}</span>
                        </div>
                        <div class="resource-actions">
                          <el-button
                            size="small"
                            @click="previewResource(hour.fileUrl)"
                            >预览</el-button
                          >
                          <el-button
                            size="small"
                            type="danger"
                            @click="
                              removeResource(formData.hourList, hourIndex)
                            "
                            >移除</el-button
                          >
                        </div>
                      </div>
                      <el-upload
                        v-else
                        class="resource-upload"
                        action="#"
                        :auto-upload="false"
                        :show-file-list="false"
                        :on-change="
                          file =>
                            handleResourceUpload(
                              file,
                              formData.hourList,
                              hourIndex
                            )
                        "
                      >
                        <div class="upload-icon-container">
                          <el-icon><Plus /></el-icon>
                        </div>
                      </el-upload>
                    </div>
                  </el-form-item>
                </div>
              </div>
            </el-collapse-item>
          </el-collapse>
        </div>
      </template>
    </div>

    <!-- 附件资源 -->
    <div class="form-section">
      <div class="section-header">
        <h3>附件资源</h3>
        <el-button type="primary" @click="addAttr">添加附件</el-button>
      </div>

      <div v-if="formData.attrList.length === 0" class="empty-placeholder">
        尚未添加附件，请点击"添加附件"按钮添加
      </div>
      <div v-else class="attr-list">
        <div
          v-for="(attr, attrIndex) in formData.attrList"
          :key="'attr-' + attrIndex"
          class="attr-item"
        >
          <div class="attr-card">
            <el-row :gutter="20">
              <el-col :span="24">
                <el-form-item
                  :label="'附件标题'"
                  :prop="'attrList.' + attrIndex + '.title'"
                >
                  <el-input v-model="attr.title" placeholder="请输入附件标题" />
                </el-form-item>
              </el-col>
            </el-row>

            <el-row :gutter="20">
              <el-col :span="24">
                <el-form-item
                  :label="'资源类型'"
                  :prop="'attrList.' + attrIndex + '.rType'"
                >
                  <el-select v-model="attr.rType" placeholder="请选择资源类型">
                    <el-option label="文档" value="document" />
                    <el-option label="图片" value="image" />
                    <el-option label="其他" value="other" />
                  </el-select>
                </el-form-item>
              </el-col>
            </el-row>

            <el-form-item
              :label="'附件资源'"
              :prop="'attrList.' + attrIndex + '.resourceId'"
            >
              <div class="upload-with-preview">
                <div v-if="attr.fileUrl" class="resource-preview">
                  <div class="resource-info">
                    <i class="el-icon-document" />
                    <span class="resource-name">{{
                      getFileName(attr.fileUrl)
                    }}</span>
                  </div>
                  <div class="resource-actions">
                    <el-button
                      size="small"
                      @click="previewResource(attr.fileUrl)"
                      >预览</el-button
                    >
                    <el-button
                      size="small"
                      type="danger"
                      @click="removeAttrResource(attrIndex)"
                      >移除</el-button
                    >
                  </div>
                </div>
                <el-upload
                  v-else
                  class="resource-upload"
                  action="#"
                  :auto-upload="false"
                  :show-file-list="false"
                  :on-change="file => handleAttrUpload(file, attrIndex)"
                >
                  <div class="upload-icon-container">
                    <el-icon><Plus /></el-icon>
                  </div>
                </el-upload>
              </div>
            </el-form-item>

            <div class="attr-actions">
              <el-button
                type="danger"
                size="small"
                @click="removeAttr(attrIndex)"
                >删除附件</el-button
              >
            </div>
          </div>
        </div>
      </div>
    </div>
  </el-form>
</template>

<script lang="ts" setup>
import { ref, reactive, defineProps, defineEmits, watch, onMounted } from "vue";
import { ElMessage } from "element-plus";
import { uploadFile } from "@/api/user";
import { getCategoryList } from "@/api/category";
import { Plus } from "@element-plus/icons-vue";

const props = defineProps({
  modelValue: {
    type: Object,
    required: true
  },
  loading: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(["update:modelValue", "submit"]);

const formRef = ref();

// 定义课时折叠状态管理的类型
interface HoursActiveState {
  [key: string]: number[];
  standalone: number[];
}

const activeChapters = ref([0]); // 默认展开第一个章节
const activeHours = ref<HoursActiveState>({ standalone: [] }); // 课时折叠状态管理，初始化带有standalone属性
const formData = reactive({ ...props.modelValue });

// 表单验证规则
const formRules = {
  title: [{ required: true, message: "请输入课程标题", trigger: "blur" }],
  shortDesc: [{ required: true, message: "请输入课程简介", trigger: "blur" }],
  thumb: [
    {
      required: true,
      type: "number",
      min: 1,
      message: "请上传课程封面",
      trigger: "change"
    }
  ],
  categoryIds: [
    {
      required: true,
      type: "array",
      min: 1,
      message: "请选择课程分类",
      trigger: "change"
    }
  ],
  endingTime: [
    { required: true, message: "请选择结束时间", trigger: "change" }
  ],
  // 章节名称验证规则
  "chapterList.0.name": [
    { required: true, message: "请输入章节名称", trigger: "blur" }
  ],
  // 课时标题验证规则
  "hourList.0.title": [
    { required: true, message: "请输入课时标题", trigger: "blur" }
  ]
};

// 分类选项
const categoryOptions = ref([]);
const loadCategories = async () => {
  try {
    const res = await getCategoryList({ pageNum: 1, pageSize: 100 });
    console.log("分类数据:", res);

    // 根据API定义，响应直接包含total和categoryList
    if (res && res.categoryList) {
      categoryOptions.value = res.categoryList;
      console.log("成功加载分类数据:", categoryOptions.value);
    } else if (res && res.data && res.data.categoryList) {
      // 兼容可能的嵌套data结构
      categoryOptions.value = res.data.categoryList;
      console.log("从data中加载分类数据:", categoryOptions.value);
    } else {
      console.warn("无法从API响应中获取分类数据，使用默认数据");
      // 临时数据，确保有分类可选
      categoryOptions.value = [
        { categoryId: 1, name: "前端开发" },
        { categoryId: 2, name: "后端开发" },
        { categoryId: 3, name: "移动开发" },
        { categoryId: 4, name: "数据库" },
        { categoryId: 5, name: "运维/测试" },
        { categoryId: 6, name: "人工智能" }
      ];
    }
  } catch (error) {
    console.error("获取分类列表失败:", error);
    ElMessage.error("获取分类列表失败");
    // 异常情况下也提供临时数据
    categoryOptions.value = [
      { categoryId: 1, name: "前端开发" },
      { categoryId: 2, name: "后端开发" },
      { categoryId: 3, name: "移动开发" },
      { categoryId: 4, name: "数据库" },
      { categoryId: 5, name: "运维/测试" },
      { categoryId: 6, name: "人工智能" }
    ];
  }
};

// 监听属性变化
watch(
  () => props.modelValue,
  newVal => {
    Object.assign(formData, newVal);
  },
  { deep: true }
);

// 将表单数据同步回父组件
watch(
  formData,
  newVal => {
    emit("update:modelValue", newVal);
  },
  { deep: true }
);

// 处理封面上传
const handleCoverUpload = async file => {
  try {
    const uploadFormData = new FormData();
    uploadFormData.append("file", file.raw);

    const res = await uploadFile(uploadFormData);
    if (res && res.code === 200 && res.data) {
      // 更新表单数据
      formData.thumb = res.data.fileId;
      formData.thumbUrl = res.data.url;
      ElMessage.success("封面上传成功");
    } else {
      ElMessage.error("封面上传失败");
    }
  } catch (error) {
    console.error("封面上传失败:", error);
    ElMessage.error("封面上传失败");
  }
};

// 移除封面
const removeCover = () => {
  formData.thumb = 0;
  formData.thumbUrl = "";
};

// 从URL中获取文件名
const getFileName = url => {
  if (!url) return "未知文件";
  const parts = url.split("/");
  return parts[parts.length - 1];
};

// 预览资源
const previewResource = url => {
  if (url) {
    window.open(url);
  } else {
    ElMessage.warning("无效的资源链接");
  }
};

// 章节相关方法
const addChapter = () => {
  formData.chapterList.push({
    name: "", // 去除默认值
    hourList: []
  });
  // 自动展开新添加的章节
  activeChapters.value.push(formData.chapterList.length - 1);
};

const removeChapter = index => {
  formData.chapterList.splice(index, 1);
};

// 课时相关方法
const addHour = () => {
  formData.hourList.push({
    title: "", // 去除默认值
    duration: 0,
    rType: "video",
    resourceId: 0,
    fileUrl: ""
  });

  // 初始化独立课时的折叠状态数组
  if (!activeHours.value.standalone) {
    activeHours.value.standalone = [];
  }

  // 自动展开新添加的课时
  activeHours.value.standalone.push(formData.hourList.length - 1);
};

const removeHour = index => {
  formData.hourList.splice(index, 1);
};

const addHourToChapter = chapterIndex => {
  formData.chapterList[chapterIndex].hourList.push({
    title: "", // 去除默认值
    duration: 0,
    rType: "video",
    resourceId: 0,
    fileUrl: ""
  });

  // 初始化当前章节的课时折叠状态数组
  if (!activeHours.value[chapterIndex]) {
    activeHours.value[chapterIndex] = [];
  }

  // 自动展开新添加的课时
  activeHours.value[chapterIndex].push(
    formData.chapterList[chapterIndex].hourList.length - 1
  );
};

const removeHourFromChapter = (chapterIndex, hourIndex) => {
  formData.chapterList[chapterIndex].hourList.splice(hourIndex, 1);
};

// 处理资源上传
const handleResourceUpload = async (file, list, index) => {
  try {
    const formData = new FormData();
    formData.append("file", file.raw);

    const res = await uploadFile(formData);
    if (res && res.code === 200 && res.data) {
      // 更新表单数据
      list[index].resourceId = res.data.fileId;
      list[index].fileUrl = res.data.url;
      ElMessage.success("资源上传成功");
    } else {
      ElMessage.error("资源上传失败");
    }
  } catch (error) {
    console.error("资源上传失败:", error);
    ElMessage.error("资源上传失败");
  }
};

const removeResource = (list, index) => {
  list[index].resourceId = 0;
  list[index].fileUrl = "";
};

// 附件相关方法
const addAttr = () => {
  formData.attrList.push({
    title: "新附件",
    rType: "document",
    resourceId: 0,
    fileUrl: ""
  });
};

const removeAttr = index => {
  formData.attrList.splice(index, 1);
};

const handleAttrUpload = async (file, index) => {
  try {
    const uploadFormData = new FormData();
    uploadFormData.append("file", file.raw);

    const res = await uploadFile(uploadFormData);
    if (res && res.code === 200 && res.data) {
      // 更新表单数据
      formData.attrList[index].resourceId = res.data.fileId;
      formData.attrList[index].fileUrl = res.data.url;
      ElMessage.success("附件上传成功");
    } else {
      ElMessage.error("附件上传失败");
    }
  } catch (error) {
    console.error("附件上传失败:", error);
    ElMessage.error("附件上传失败");
  }
};

const removeAttrResource = index => {
  formData.attrList[index].resourceId = 0;
  formData.attrList[index].fileUrl = "";
};

// 表单验证方法
const validate = async () => {
  return await formRef.value.validate();
};

// 初始化
onMounted(() => {
  console.log("组件挂载，开始加载分类数据");
  loadCategories();
});

// 对外暴露方法
defineExpose({
  validate,
  formRef
});
</script>

<style lang="scss" scoped>
:deep(.el-collapse-item__content) {
  max-height: 450px;
  overflow-y: auto;
}

:deep(.el-form-item__label) {
  font-weight: 500;
}

.form-section {
  margin-top: 20px;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  padding: 16px;
  margin-bottom: 20px;

  .section-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;

    h3 {
      margin: 0;
      font-size: 16px;
      font-weight: bold;
    }
  }
}

.empty-placeholder {
  text-align: center;
  color: #909399;
  padding: 20px;
  border: 1px dashed #d9d9d9;
  border-radius: 4px;
  margin-bottom: 16px;
}

.chapter-header,
.hour-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;

  span {
    font-weight: 500;
  }

  .chapter-actions,
  .hour-title-actions {
    margin-right: 30px; /* 给折叠箭头留出空间 */
  }
}

.chapter-content {
  padding: 0 16px;
}

.hour-list-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin: 16px 0;

  h4 {
    margin: 0;
    font-size: 14px;
  }
}

.hour-item,
.attr-item {
  margin-bottom: 16px;
}

.hour-card,
.attr-card {
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  padding: 16px;
  position: relative;
}

.hour-actions,
.attr-actions {
  display: flex;
  justify-content: flex-end;
  margin-top: 16px;
}

.input-with-actions {
  display: flex;

  .el-input {
    flex: 1;
    margin-right: 10px;
  }
}

.upload-box {
  display: flex;
}

.upload-preview {
  position: relative;

  .upload-actions {
    position: absolute;
    bottom: 5px;
    right: 5px;
  }
}

.upload-trigger {
  height: 120px;
  width: 200px;
  border: 1px dashed #d9d9d9;
  border-radius: 6px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  cursor: pointer;

  &:hover {
    border-color: #409eff;
  }
}

.upload-icon-container {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;

  .el-icon {
    font-size: 28px;
    color: #8c939d;
  }
}

.upload-with-preview {
  width: 100%;
}

.resource-preview {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px;
  border: 1px solid #e0e0e0;
  border-radius: 4px;

  .resource-info {
    display: flex;
    align-items: center;

    .resource-name {
      margin-left: 8px;
      word-break: break-all;
    }
  }

  .resource-actions {
    display: flex;
    gap: 8px;
  }
}

.resource-upload {
  width: 100%;
  height: 60px;
  border: 1px dashed #d9d9d9;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover {
    border-color: #409eff;
  }

  .upload-icon-container {
    display: flex;
    flex-direction: column;
    align-items: center;

    .el-icon {
      font-size: 22px;
      margin-bottom: 8px;
      color: #8c939d;
    }

    span {
      font-size: 14px;
      color: #606266;
    }
  }
}

:deep(::-webkit-scrollbar) {
  width: 6px;
  height: 6px;
}

:deep(::-webkit-scrollbar-track) {
  background: #f1f1f1;
  border-radius: 3px;
}

:deep(::-webkit-scrollbar-thumb) {
  background: #c1c1c1;
  border-radius: 3px;
}

:deep(::-webkit-scrollbar-thumb:hover) {
  background: #a8a8a8;
}

.required-mark {
  color: #f56c6c;
  margin-left: 4px;
}

.required-hint {
  color: #f56c6c;
  font-size: 12px;
  margin-left: 5px;
}

.hour-content {
  padding: 0 16px;
}

:deep(.el-collapse-item__content) {
  padding-top: 16px;
}

:deep(.el-collapse-item__header) {
  padding: 0 16px;
  height: 40px;
  border-bottom: 1px solid #ebeef5;
  font-size: 14px;
}
</style>
