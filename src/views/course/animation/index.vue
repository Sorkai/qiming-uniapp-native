<template>
  <div class="ai-animation-container h-[calc(100vh-140px)] m-3 flex gap-3 overflow-hidden font-sans">
    <!-- 左侧课程选择 -->
    <div class="sidebar-card w-72 bg-[var(--el-bg-color-overlay)] rounded-2xl shadow-sm border border-[var(--el-border-color-light)] flex flex-col shrink-0 overflow-hidden transition-all duration-300 hover:shadow-lg">
      <div class="header-section p-5 border-b border-[var(--el-border-color-light)] bg-[var(--el-fill-color-light)]/30">
        <h3 class="font-bold flex items-center text-lg">
          <div class="icon-box w-10 h-10 bg-gradient-to-br from-[var(--el-color-primary)] to-[var(--el-color-primary-dark-2)] rounded-xl mr-3 shadow-lg flex items-center justify-center transition-transform duration-300">
            <img :src="htmlIconSvg" class="w-6 h-6 brightness-0 invert" alt="智能动画中心" />
          </div>
          智能动画中心
        </h3>
        <p class="text-xs text-[var(--el-text-color-placeholder)] mt-2 ml-[52px]">AI 辅助生成教学动画与演示</p>
      </div>

      <div class="p-5 space-y-5 flex-1 overflow-auto custom-scrollbar">
        <div class="space-y-2">
          <label class="text-sm font-semibold text-[var(--el-text-color-secondary)] flex items-center">
            <el-icon class="mr-1.5 text-[var(--el-color-primary)]"><Reading /></el-icon> 目标课程
          </label>
          <el-select
            v-model="selectedCourseId"
            filterable
            remote
            clearable
            placeholder="搜索或选择课程..."
            :remote-method="searchCourses"
            :loading="courseLoading"
            class="w-full !rounded-xl"
            size="large"
            @change="handleCourseChange"
          >
            <el-option
              v-for="c in courseOptions"
              :key="c.courseId"
              :label="c.title"
              :value="c.courseId"
            />
          </el-select>
        </div>

        <div class="space-y-2">
          <label class="text-sm font-semibold text-[var(--el-text-color-secondary)] flex items-center">
            <el-icon class="mr-1.5 text-[var(--el-color-primary)]"><Management /></el-icon> 对应章节
          </label>
          <el-select
            v-model="selectedChapterId"
            :disabled="!selectedCourseId"
            placeholder="请选择课程内的章节..."
            clearable
            filterable
            class="w-full !rounded-xl"
            size="large"
            @change="handleChapterChange"
          >
            <el-option
              v-for="ch in chapterOptions"
              :key="ch.chapterId"
              :label="ch.name"
              :value="ch.chapterId"
            />
          </el-select>
        </div>

        <!-- 状态面板 - 始终显示 -->
        <div class="status-panel mt-6 p-4 bg-[var(--el-fill-color-light)] rounded-xl border border-[var(--el-border-color-lighter)] transition-all duration-300 hover:shadow-md">
          <div class="flex items-center justify-between mb-3">
            <span class="text-sm font-semibold text-[var(--el-text-color-primary)]">任务状态</span>
            <el-icon class="text-[var(--el-text-color-placeholder)] transition-transform duration-300 hover:rotate-180"><DataAnalysis /></el-icon>
          </div>
          <div class="space-y-2">
            <div class="status-item flex items-center justify-between py-2.5 px-3 bg-[var(--el-bg-color)] rounded-lg cursor-pointer transition-all duration-200 hover:bg-[var(--el-color-success-light-9)] hover:translate-x-1 hover:shadow-sm">
              <div class="flex items-center">
                <span class="w-2.5 h-2.5 rounded-full bg-[var(--el-color-success)] mr-2.5 transition-transform duration-200"></span>
                <span class="text-sm text-[var(--el-text-color-secondary)]">已完成</span>
              </div>
              <span class="text-lg font-bold text-[var(--el-color-success)] transition-transform duration-200">{{ stats.completed }}</span>
            </div>
            <div class="status-item flex items-center justify-between py-2.5 px-3 bg-[var(--el-bg-color)] rounded-lg cursor-pointer transition-all duration-200 hover:bg-[var(--el-color-warning-light-9)] hover:translate-x-1 hover:shadow-sm">
              <div class="flex items-center">
                <span class="w-2.5 h-2.5 rounded-full bg-[var(--el-color-warning)] mr-2.5 animate-pulse"></span>
                <span class="text-sm text-[var(--el-text-color-secondary)]">处理中</span>
              </div>
              <span class="text-lg font-bold text-[var(--el-color-warning)] transition-transform duration-200">{{ stats.processing }}</span>
            </div>
            <div class="status-item flex items-center justify-between py-2.5 px-3 bg-[var(--el-bg-color)] rounded-lg cursor-pointer transition-all duration-200 hover:bg-[var(--el-color-danger-light-9)] hover:translate-x-1 hover:shadow-sm">
              <div class="flex items-center">
                <span class="w-2.5 h-2.5 rounded-full bg-[var(--el-color-danger)] mr-2.5"></span>
                <span class="text-sm text-[var(--el-text-color-secondary)]">失败</span>
              </div>
              <span class="text-lg font-bold text-[var(--el-color-danger)] transition-transform duration-200">{{ stats.failed }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 右侧内容区域 -->
    <div class="flex-1 flex flex-col min-w-0">
      <!-- 顶部操作栏 -->
      <div class="bg-[var(--el-bg-color-overlay)] p-4 rounded-2xl shadow-sm border border-[var(--el-border-color-light)] mb-3 flex justify-between items-center transition-all hover:shadow-md">
        <div class="flex items-center space-x-6">
          <div v-if="displayVersionResolved" class="flex items-center gap-3 px-4 py-2 bg-[var(--el-color-success-light-9)] rounded-xl border border-[var(--el-color-success-light-5)]">
            <div class="flex items-center">
              <div class="w-2 h-2 bg-[var(--el-color-success)] rounded-full mr-2 shadow-lg shadow-[var(--el-color-success-light-5)] animate-pulse" />
              <span class="text-xs text-[var(--el-color-success)] font-bold uppercase tracking-wide">Active</span>
            </div>
            <span class="text-[var(--el-color-success)] font-bold">v{{ displayVersionResolved }}</span>
          </div>
          <div v-if="polling" class="flex items-center text-[var(--el-color-primary)] text-xs font-semibold px-3 py-1.5 bg-[var(--el-color-primary-light-9)] rounded-lg">
            <el-icon class="mr-1.5 animate-spin"><Loading /></el-icon>
            监听中...
          </div>
        </div>

        <div class="flex gap-2">
          <el-button
            type="primary"
            :disabled="!canGenerate"
            :loading="generateLoading"
            class="!rounded-xl !h-10 shadow-lg shadow-[var(--el-color-primary-light-8)] !px-5 !font-semibold"
            @click="onGenerate"
          >
            AI 生成
          </el-button>
          <el-button
            :disabled="!selectedChapterId"
            class="!h-10 !w-10 !rounded-xl !p-0 border-[var(--el-border-color-light)] hover:text-[var(--el-color-primary)] bg-[var(--el-bg-color)]"
            @click="refreshList"
            :icon="Refresh"
          />
          <el-button
            type="success"
            plain
            :loading="syncLoading"
            class="!rounded-xl !h-10 !border-[var(--el-color-success-light-5)] !text-[var(--el-color-success)] hover:!bg-[var(--el-color-success-light-9)] bg-[var(--el-bg-color)] !font-semibold"
            @click="onForceSync"
            :icon="Upload"
          >
            同步
          </el-button>
        </div>
      </div>

      <div class="flex-1 bg-[var(--el-bg-color-overlay)] rounded-2xl shadow-sm border border-[var(--el-border-color-light)] p-5 overflow-hidden flex flex-col">
        <div v-if="!selectedChapterId" class="flex-1 flex flex-col items-center justify-center">
          <div class="text-center">
            <el-icon class="text-5xl text-[var(--el-text-color-placeholder)]/50 mb-4"><Film /></el-icon>
            <p class="text-[var(--el-text-color-secondary)] font-medium">请选择课程与章节</p>
            <p class="text-[var(--el-text-color-placeholder)] text-sm mt-1">以查看和管理 AI 动画任务</p>
          </div>
        </div>
        <div v-else class="flex-1 flex flex-col overflow-hidden">
          <div class="flex justify-between items-center mb-4 pb-4 border-b border-[var(--el-border-color-lighter)]">
            <el-radio-group v-model="statusFilter" size="default" @change="applyFilter" class="animation-filter-group">
              <el-radio-button label="all">
                <span class="flex items-center gap-1.5 text-sm">
                  <span class="w-2 h-2 rounded-full bg-[var(--el-text-color-placeholder)]"></span>
                  全部
                </span>
              </el-radio-button>
              <el-radio-button label="completed">
                <span class="flex items-center gap-1.5 text-sm">
                  <span class="w-2 h-2 rounded-full bg-[var(--el-color-success)]"></span>
                  成功
                </span>
              </el-radio-button>
              <el-radio-button label="processing">
                <span class="flex items-center gap-1.5 text-sm">
                  <span class="w-2 h-2 rounded-full bg-[var(--el-color-warning)] animate-pulse"></span>
                  进行中
                </span>
              </el-radio-button>
              <el-radio-button label="failed">
                <span class="flex items-center gap-1.5 text-sm">
                  <span class="w-2 h-2 rounded-full bg-[var(--el-color-danger)]"></span>
                  失败
                </span>
              </el-radio-button>
            </el-radio-group>
            <el-input v-model="keyword" placeholder="搜索文件名..." clearable size="default" class="!w-64 !rounded-xl" @input="applyFilter">
              <template #prefix><el-icon class="text-[var(--el-text-color-placeholder)]"><Search /></el-icon></template>
            </el-input>
          </div>
          
          <div class="flex-1 overflow-auto custom-scrollbar">
            <el-table :data="filteredTasks" v-loading="listLoading" class="animation-table" :row-class-name="rowClassName" header-cell-class-name="!bg-[var(--el-fill-color-light)] !text-[var(--el-text-color-primary)] !font-semibold !text-sm !py-3">
              <el-table-column prop="version" label="版本" width="100" align="center">
                <template #default="{ row }">
                  <div class="flex items-center justify-center">
                    <el-icon v-if="isDisplayVersion(row)" class="text-[var(--el-color-success)] mr-1.5"><StarFilled /></el-icon>
                    <el-tag v-if="row.status==='completed'" type="success" size="default" effect="plain" class="!bg-[var(--el-color-success-light-9)] !font-bold !rounded-lg">v{{ row.version }}</el-tag>
                    <span v-else class="text-[var(--el-text-color-placeholder)]">--</span>
                  </div>
                </template>
              </el-table-column>
              <el-table-column prop="status" label="状态" width="120" align="center">
                <template #default="{ row }">
                  <div class="inline-flex items-center px-3 py-1.5 rounded-lg text-sm font-semibold"
                       :class="{
                         'bg-[var(--el-color-success-light-9)] text-[var(--el-color-success)]': row.status==='completed',
                         'bg-[var(--el-color-warning-light-9)] text-[var(--el-color-warning)]': row.status==='processing',
                         'bg-[var(--el-color-danger-light-9)] text-[var(--el-color-danger)]': row.status==='failed',
                         'bg-[var(--el-fill-color-light)] text-[var(--el-text-color-secondary)]': !['completed','processing','failed'].includes(row.status)
                       }">
                    <span class="w-2 h-2 rounded-full mr-2"
                          :class="{
                            'bg-[var(--el-color-success)]': row.status==='completed',
                            'bg-[var(--el-color-warning)] animate-pulse': row.status==='processing',
                            'bg-[var(--el-color-danger)]': row.status==='failed',
                            'bg-[var(--el-text-color-placeholder)]': !['completed','processing','failed'].includes(row.status)
                          }"></span>
                    {{ row.status==='completed'? '完成': row.status==='processing'? '处理中': row.status==='failed'? '失败': row.status }}
                  </div>
                </template>
              </el-table-column>
              <el-table-column prop="fileName" label="文件名" min-width="200" show-overflow-tooltip>
                <template #default="{ row }">
                  <span class="text-[var(--el-text-color-primary)] font-medium text-sm">{{ row.fileName }}</span>
                </template>
              </el-table-column>
              <el-table-column prop="fileSize" label="大小" width="100" align="center">
                <template #default="{ row }">
                  <span class="text-[var(--el-text-color-secondary)] text-sm font-mono">{{ formatSize(row.fileSize) }}</span>
                </template>
              </el-table-column>
              <el-table-column prop="createdAt" label="创建时间" width="170" align="center">
                <template #default="{ row }">
                  <span class="text-[var(--el-text-color-secondary)] text-sm">{{ row.createdAt }}</span>
                </template>
              </el-table-column>
              <el-table-column label="操作" width="280" fixed="right" align="center">
                <template #default="{ row }">
                  <div class="flex gap-2 justify-center">
                    <el-button size="default" type="primary" plain class="!rounded-lg" :disabled="row.status!=='completed'" @click="openPreview(row)">
                      <el-icon class="mr-1"><View /></el-icon>预览
                    </el-button>
                    <el-button size="default" type="success" plain class="!rounded-lg" :disabled="row.status!=='completed' || isDisplayVersion(row)" @click="setDisplay(row)">
                      <el-icon class="mr-1"><StarFilled /></el-icon>展示
                    </el-button>
                    <el-button size="default" type="info" plain class="!rounded-lg" :disabled="row.status!=='completed'" @click="copyUrl(row)">
                      <el-icon class="mr-1"><DocumentCopy /></el-icon>URL
                    </el-button>
                  </div>
                </template>
              </el-table-column>
            </el-table>
          </div>
        </div>
      </div>
    </div>

    <!-- 预览弹窗 -->
    <el-dialog v-model="previewVisible" title="动画渲染预览" width="85%" top="4vh" class="!rounded-2xl overflow-hidden shadow-2xl">
      <div v-if="previewUrl" class="h-[75vh] bg-black rounded-xl overflow-hidden border border-[var(--el-border-color-light)]">
        <iframe :src="previewUrl" frameborder="0" class="w-full h-full" />
      </div>
      <template #footer>
        <div class="flex justify-between items-center px-4 py-2">
           <span class="text-xs text-[var(--el-text-color-placeholder)] font-mono">DEBUG MODE</span>
          <div class="space-x-4">
            <el-button @click="openInNewWindow" :icon="FullScreen" class="!rounded-xl">全屏查看</el-button>
            <el-button type="primary" @click="previewVisible=false" class="!rounded-xl px-8">完成</el-button>
          </div>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script lang="ts" setup>
import { ref, computed, onMounted, onBeforeUnmount } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
import { getCourseList, getCourseHoursList } from "@/api/course";
import {
  generateHtmlAnimation,
  getHtmlAnimationList,
  setHtmlAnimationDisplay,
  forceSyncHtmlAnimation,
  getHtmlAnimationDisplay,
  type HtmlAnimationTask
} from "@/api/htmlAnimation";
import {
  VideoPlay,
  Loading,
  Cpu,
  Refresh,
  Upload,
  Search,
  Document,
  Promotion,
  View,
  More,
  Download,
  Delete,
  Reading,
  Management,
  Calendar,
  DocumentCopy,
  FullScreen,
  StarFilled,
  Film,
  Setting,
  DataAnalysis
} from "@element-plus/icons-vue";
import htmlIconSvg from "@/assets/new-release/html-file-type-svgrepo-com.svg?url";

defineOptions({
  name: "CourseAnimation"
});

const selectedCourseId = ref<number | null>(null);
const selectedChapterId = ref<number | null>(null);
const courseOptions = ref<any[]>([]);
const chapterOptions = ref<any[]>([]);
const courseLoading = ref(false);
const listLoading = ref(false);
const generateLoading = ref(false);
const syncLoading = ref(false);
const polling = ref(false);
let pollTimer: any = null;

const tasks = ref<HtmlAnimationTask[]>([]);
const displayVersionRaw = ref("");
const displayVersionResolved = ref("");

const statusFilter = ref("all");
const keyword = ref("");

const previewVisible = ref(false);
const previewUrl = ref("");

// 统计
const stats = computed(() => {
  return {
    completed: tasks.value.filter(t => t.status === "completed").length,
    processing: tasks.value.filter(t => t.status === "processing").length,
    failed: tasks.value.filter(t => t.status === "failed").length
  };
});


const latestCompletedVersion = computed(()=>{
  const versions = tasks.value.filter(t=>t.status==='completed').map(t=>t.version).filter(v=>v>0);
  return versions.length? Math.max(...versions): null;
});

const latestSuccessTime = computed(()=>{
  const completed = tasks.value.filter(t=>t.status==='completed' && t.completedAt);
  if(!completed.length) return '';
  // 最新完成时间
  return completed.sort((a,b)=> (b.completedAt||'').localeCompare(a.completedAt||''))[0].completedAt;
});

const canGenerate = computed(()=> !!selectedCourseId.value && !!selectedChapterId.value && !tasks.value.some(t=>t.status==='processing'));

const filteredTasks = computed(()=>{
  let arr = tasks.value.slice().sort((a,b)=> b.version - a.version);
  if(statusFilter.value!=='all') arr = arr.filter(t=>t.status===statusFilter.value);
  if(keyword.value) arr = arr.filter(t=> t.fileName?.toLowerCase().includes(keyword.value.toLowerCase()));
  return arr;
});

function applyFilter(){ /* computed 已处理，此函数占位供事件触发刷新 */ }

async function searchCourses(query:string){
  courseLoading.value = true;
  try {
    const { data } = await getCourseList({ pageNum:1, pageSize:20, courseName: query|| undefined });
    courseOptions.value = data.courseList || [];
  } catch(e){
    ElMessage.error('课程搜索失败');
  } finally { courseLoading.value=false; }
}

async function preloadCourses(){
  await searchCourses('');
}

async function handleCourseChange(){
  selectedChapterId.value = null;
  chapterOptions.value = [];
  tasks.value = [];
  stopPolling();
  if(!selectedCourseId.value) return;
  // load chapters
  try {
    const { data } = await getCourseHoursList({ courseId: selectedCourseId.value });
    chapterOptions.value = (data.courseChapters||[]).map(ch=> ({ chapterId: ch.chapterId, name: ch.name }));
  } catch(e){
    ElMessage.error('章节加载失败');
  }
}

function handleChapterChange(){
  tasks.value = [];
  stopPolling();
  if(selectedChapterId.value) refreshList();
}

async function refreshList(){
  if(!selectedCourseId.value || !selectedChapterId.value) return;
  listLoading.value = true;
  try {
    const { data } = await getHtmlAnimationList({ courseId: selectedCourseId.value, chapterId: selectedChapterId.value });
    tasks.value = data.tasks || [];
    displayVersionRaw.value = data.displayVersionRaw;
    displayVersionResolved.value = data.displayVersionResolved;
    // 若存在 processing 且未轮询启动 -> 启动
    if(tasks.value.some(t=>t.status==='processing') && !polling.value){
      startPolling();
    } else if(!tasks.value.some(t=>t.status==='processing')){
      stopPolling();
    }
  } catch(e){
    ElMessage.error('动画列表获取失败');
  } finally { listLoading.value = false; }
}

async function onGenerate(){
  if(!canGenerate.value) return;
  generateLoading.value = true;
  try {
    await generateHtmlAnimation({ courseId: selectedCourseId.value!, chapterId: selectedChapterId.value! });
    ElMessage.success('生成任务已提交');
    await refreshList();
  } catch(e){
    ElMessage.error('生成任务提交失败');
  } finally { generateLoading.value=false; }
}

function startPolling(){
  polling.value = true;
  clearInterval(pollTimer);
  pollTimer = setInterval(async ()=>{
    await refreshList();
  }, 5000);
}

function stopPolling(){
  polling.value = false;
  clearInterval(pollTimer);
  pollTimer = null;
}

async function setDisplayLatest(){
  if(!latestCompletedVersion.value) return;
  try {
    await setHtmlAnimationDisplay({ courseId: selectedCourseId.value!, chapterId: selectedChapterId.value!, version: String(latestCompletedVersion.value) });
    ElMessage.success('展示版本已设置');
    await refreshList();
  } catch(e){
    ElMessage.error('设置展示版本失败');
  }
}

async function setDisplay(row: HtmlAnimationTask){
  if(row.status!=='completed') return;
  try {
    await setHtmlAnimationDisplay({ courseId: selectedCourseId.value!, chapterId: selectedChapterId.value!, version: String(row.version) });
    ElMessage.success('展示版本已设置');
    await refreshList();
  } catch(e){
    ElMessage.error('设置展示版本失败');
  }
}

async function onForceSync(){
  syncLoading.value = true;
  try {
    const { data } = await forceSyncHtmlAnimation();
    ElMessage.success(`同步完成: ${data.successChapters}/${data.totalChapters}`);
    await refreshList();
  } catch(e){
    ElMessage.error('强制同步失败');
  } finally { syncLoading.value=false; }
}

function isDisplayVersion(row: HtmlAnimationTask){
  if(row.status!=='completed' || !row.version) return false;
  if(displayVersionRaw.value==='latest') return String(row.version)===displayVersionResolved.value;
  return String(row.version)===displayVersionRaw.value;
}

function openPreview(row: HtmlAnimationTask){
  if(row.status!=='completed') return;
  previewUrl.value = buildFileUrl(row);
  previewVisible.value = true;
}

function buildFileUrl(row: HtmlAnimationTask){
  // 优先使用后端直接返回的 fileUrl（完整URL）
  if((row as any).fileUrl) return (row as any).fileUrl as string;
  if(row.fileName && row.fileName.startsWith('http')) return row.fileName;
  if(row.objectName && row.objectName.startsWith('http')) return row.objectName;
  return row.fileName || row.objectName || '';
}

function openInNewWindow(){
  if(previewUrl.value) window.open(previewUrl.value,'_blank');
}

async function copyUrl(row: HtmlAnimationTask){
  const url = buildFileUrl(row);
  if(!url){ ElMessage.warning('无可复制URL'); return; }
  try {
    await navigator.clipboard.writeText(url);
    ElMessage.success('已复制');
  } catch(e){
    ElMessage.error('复制失败');
  }
}

function formatSize(size:number){
  if(!size) return '-';
  const units = ['B','KB','MB','GB'];
  let idx=0; let val=size;
  while(val>1024 && idx<units.length-1){ val/=1024; idx++; }
  return val.toFixed( (idx===0)?0:2 ) + units[idx];
}

function truncate(str:string, len:number){
  if(!str) return '';
  return str.length>len? str.slice(0,len)+'…': str;
}

function rowClassName({ row }: { row: HtmlAnimationTask }){
  if(isDisplayVersion(row)) return 'row-display';
  if(row.status==='failed') return 'row-failed';
  return '';
}

onMounted(()=>{
  preloadCourses();
});
</script>

<style scoped lang="scss">
.ai-animation-page { margin:10px; }
.toolbar { display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:12px; }
.selectors { display:flex; align-items:center; }
.actions { display:flex; align-items:center; gap:8px; flex-wrap:wrap; }
.display-info { margin-top:6px; font-size:12px; color:#606266; display:flex; align-items:center; flex-wrap:wrap; gap:8px; }
.display-info .divider { width:1px; height:14px; background:#dcdfe6; display:inline-block; }
.polling-indicator { color:#409eff; }
.empty-block { padding:60px 0; }
.filter-row { display:flex; justify-content:space-between; align-items:center; margin:10px 0 14px; }
.preview-wrapper { height:70vh; }
.preview-iframe { width:100%; height:100%; border:1px solid var(--el-border-color-light); border-radius:var(--el-border-radius-base); }
.error-text { color:var(--el-color-danger); cursor:help; }

// 表格行样式
:deep(.row-display) { 
  background: var(--el-color-success-light-9) !important;
  &:hover > td { background: var(--el-color-success-light-8) !important; }
}
:deep(.row-failed) { 
  background: var(--el-color-danger-light-9) !important;
  &:hover > td { background: var(--el-color-danger-light-8) !important; }
}

// 表格美化
.animation-table {
  :deep(.el-table__inner-wrapper) {
    border-radius: 12px;
    overflow: hidden;
  }
  :deep(.el-table__header-wrapper) {
    th {
      border-bottom: none !important;
    }
  }
  :deep(.el-table__body-wrapper) {
    tr {
      transition: all 0.2s ease;
      td {
        border-bottom: 1px solid var(--el-border-color-lighter) !important;
        padding: 12px 0;
      }
      &:last-child td {
        border-bottom: none !important;
      }
    }
  }
}

// 筛选按钮组美化
.animation-filter-group {
  :deep(.el-radio-button__inner) {
    border-radius: 8px !important;
    border: 1px solid var(--el-border-color-light) !important;
    margin-right: 8px;
    padding: 8px 16px;
    font-weight: 500;
    transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
    &:hover {
      color: var(--el-color-primary);
      transform: translateY(-1px);
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
    }
    &:active {
      transform: translateY(0);
    }
  }
  :deep(.el-radio-button:first-child .el-radio-button__inner) {
    border-left: 1px solid var(--el-border-color-light) !important;
    border-radius: 8px !important;
  }
  :deep(.el-radio-button:last-child .el-radio-button__inner) {
    border-radius: 8px !important;
  }
  :deep(.el-radio-button__original-radio:checked + .el-radio-button__inner) {
    background: var(--el-color-primary-light-9) !important;
    border-color: var(--el-color-primary-light-5) !important;
    color: var(--el-color-primary) !important;
    box-shadow: 0 2px 8px var(--el-color-primary-light-8) !important;
    transform: translateY(-1px);
  }
}

// 状态面板动效
// 状态面板动效
.status-panel {
  .status-item {
    &:hover {
      span:first-child {
        transform: scale(1.3);
      }
      span:last-child {
        transform: scale(1.1);
      }
    }
  }
}

// 表格行动效增强
.animation-table {
  :deep(.el-table__body-wrapper) {
    tr {
      transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
      &:hover {
        transform: scale(1.005);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
        z-index: 1;
        position: relative;
      }
    }
  }
  :deep(.el-button) {
    transition: all 0.2s ease;
    &:hover:not(:disabled) {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    }
    &:active:not(:disabled) {
      transform: translateY(0);
    }
  }
}

// 侧边栏卡片动效
.sidebar-card {
  .header-section:hover .icon-box {
    transform: rotate(-5deg) scale(1.05);
  }
}

// 输入框聚焦动效
:deep(.el-select),
:deep(.el-input) {
  .el-input__wrapper {
    transition: all 0.25s ease;
    &:hover {
      box-shadow: 0 0 0 1px var(--el-color-primary-light-5) inset;
    }
    &.is-focus {
      box-shadow: 0 0 0 1px var(--el-color-primary) inset, 0 4px 12px var(--el-color-primary-light-8);
      transform: translateY(-1px);
    }
  }
}

// 自定义滚动条
.custom-scrollbar {
  &::-webkit-scrollbar {
    width: 6px;
    height: 6px;
  }
  &::-webkit-scrollbar-track {
    background: transparent;
  }
  &::-webkit-scrollbar-thumb {
    background: var(--el-border-color);
    border-radius: 3px;
    transition: background 0.2s ease;
    &:hover {
      background: var(--el-border-color-darker);
    }
  }
}

// 淡入动画
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.status-panel {
  animation: fadeInUp 0.4s ease-out;
}


</style>
