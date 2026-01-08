<template>
  <div class="ai-animation-container p-4 h-[calc(100vh-100px)] flex gap-4 overflow-hidden bg-[var(--el-bg-color)] font-sans">
    <!-- 左侧课程选择 -->
    <div class="w-80 bg-[var(--el-bg-color-overlay)] rounded-2xl shadow-sm border border-[var(--el-border-color-light)] flex flex-col shrink-0 overflow-hidden transition-all duration-300 hover:shadow-md">
      <div class="p-6 border-b border-[var(--el-border-color-light)] bg-gradient-to-br from-[var(--el-color-primary-light-9)] to-[var(--el-bg-color-overlay)] text-[var(--el-text-color-primary)]">
        <h3 class="font-bold flex items-center text-lg">
          <div class="p-2 bg-[var(--el-color-primary)] rounded-lg mr-3 shadow-lg shadow-[var(--el-color-primary-light-8)]">
            <el-icon class="text-white"><VideoPlay /></el-icon>
          </div>
          智能动画中心
        </h3>
        <p class="text-xs text-[var(--el-text-color-placeholder)] mt-2">AI 辅助生成教学动画与演示</p>
      </div>

      <div class="p-6 space-y-6 flex-1 overflow-auto custom-scrollbar">
        <div class="space-y-2">
          <label class="text-xs font-bold text-[var(--el-text-color-placeholder)] uppercase tracking-wider flex items-center">
            <el-icon class="mr-1 text-[var(--el-color-primary)]"><Reading /></el-icon> 目标课程
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
          <label class="text-xs font-bold text-[var(--el-text-color-placeholder)] uppercase tracking-wider flex items-center">
            <el-icon class="mr-1 text-[var(--el-color-primary)]"><Management /></el-icon> 对应章节
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

        <div v-if="selectedChapterId" class="mt-8 transition-all duration-500 animate-[fadeIn_0.5s]">
          <div class="p-5 bg-gradient-to-br from-[var(--el-color-primary)] to-[var(--el-color-primary-light-3)] rounded-2xl shadow-xl shadow-[var(--el-color-primary-light-8)] text-white relative overflow-hidden">
            <el-icon class="absolute -right-4 -bottom-4 text-7xl opacity-10 pointer-events-none rotate-12"><Cpu /></el-icon>
            <div class="relative z-10">
              <div class="text-[10px] text-white/60 font-bold mb-3 uppercase tracking-widest">Engine Summary</div>
              <div class="grid grid-cols-2 gap-4">
                <div class="bg-black/10 rounded-xl p-3 backdrop-blur-sm">
                  <div class="text-[10px] text-white/50 mb-1">已就绪</div>
                  <div class="text-xl font-black">{{ stats.completed }}</div>
                </div>
                <div class="bg-black/10 rounded-xl p-3 backdrop-blur-sm group cursor-help">
                  <div class="text-[10px] text-white/50 mb-1 font-bold">处理中</div>
                  <div class="text-xl font-black text-orange-300">{{ stats.processing }}</div>
                </div>
              </div>
              <div class="mt-4 flex items-center justify-between text-[11px] text-white/70 bg-white/5 p-2 rounded-lg">
                <span>失败记录</span>
                <span class="font-bold text-red-300">{{ stats.failed }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 右侧内容区域 -->
    <div class="flex-1 flex flex-col min-w-0">
      <!-- 顶部操作栏 -->
      <div class="bg-[var(--el-bg-color-overlay)] p-5 rounded-2xl shadow-sm border border-[var(--el-border-color-light)] mb-4 flex justify-between items-center transition-all hover:shadow-md">
        <div class="flex items-center space-x-8">
          <div v-if="displayVersionResolved" class="flex flex-col">
            <span class="text-[10px] text-[var(--el-text-color-placeholder)] font-bold uppercase tracking-widest mb-1">Active Version</span>
            <div class="flex items-center">
              <div class="w-1.5 h-1.5 bg-[var(--el-color-success)] rounded-full mr-2 shadow-lg shadow-[var(--el-color-success-light-5)] animate-pulse" />
              <el-tag type="success" effect="plain" class="!border-[var(--el-color-success-light-5)] !bg-[var(--el-color-success-light-9)] !text-[var(--el-color-success)] !font-bold">v{{ displayVersionResolved }}</el-tag>
            </div>
          </div>
          <el-divider direction="vertical" v-if="displayVersionResolved" />
          <div v-if="polling" class="flex flex-col">
            <span class="text-[10px] text-[var(--el-color-primary)] font-bold uppercase tracking-widest mb-1">Hub Health</span>
            <div class="flex items-center text-[var(--el-color-primary)] text-xs font-bold">
              <el-icon class="mr-1.5 animate-spin"><Loading /></el-icon>
              自动化监听中...
            </div>
          </div>
        </div>

        <div class="flex gap-3">
          <el-button
            type="primary"
            :disabled="!canGenerate"
            :loading="generateLoading"
            class="!rounded-xl !h-11 shadow-lg shadow-[var(--el-color-primary-light-8)] !px-6"
            @click="onGenerate"
          >
            <template #icon><el-icon><Cpu /></el-icon></template>
            AI 增量生成
          </el-button>
          <el-button
            circle
            :disabled="!selectedChapterId"
            class="!h-11 !w-11 !rounded-xl border-[var(--el-border-color-light)] hover:text-[var(--el-color-primary)] bg-transparent"
            @click="refreshList"
            :icon="Refresh"
          />
          <el-divider direction="vertical" class="!h-11 mx-1" />
          <el-button
            type="success"
            plain
            :loading="syncLoading"
            class="!rounded-xl !h-11 !border-[var(--el-color-success-light-5)] !text-[var(--el-color-success)] hover:!bg-[var(--el-color-success-light-9)] shadow-sm bg-transparent"
            @click="onForceSync"
            :icon="Upload"
          >
            同步结果
          </el-button>
        </div>
      </div>

      <div class="flex-1 bg-[var(--el-bg-color-overlay)] rounded-2xl shadow-sm border border-[var(--el-border-color-light)] p-5 overflow-hidden flex flex-col">
        <div v-if="!selectedChapterId" class="flex-1 flex flex-col items-center justify-center">
          <el-empty description="请选择课程与章节以查看动画任务" />
        </div>
        <div v-else class="flex-1 flex flex-col overflow-hidden">
          <div class="flex justify-between items-center mb-6">
            <el-radio-group v-model="statusFilter" size="large" @change="applyFilter" class="!rounded-xl overflow-hidden">
              <el-radio-button label="all">全部</el-radio-button>
              <el-radio-button label="completed">成功</el-radio-button>
              <el-radio-button label="processing">进行中</el-radio-button>
              <el-radio-button label="failed">失败</el-radio-button>
            </el-radio-group>
            <el-input v-model="keyword" placeholder="搜索文件名..." clearable size="large" class="!w-72 !rounded-xl shadow-sm" @input="applyFilter">
              <template #prefix><el-icon><Search /></el-icon></template>
            </el-input>
          </div>
          
          <div class="flex-1 overflow-auto">
            <el-table :data="filteredTasks" v-loading="listLoading" class="!bg-transparent" :row-class-name="rowClassName" header-cell-class-name="!bg-[var(--el-fill-color-light)] !text-[var(--el-text-color-primary)] font-bold py-4">
              <el-table-column prop="version" label="版本" width="100">
                <template #default="{ row }">
                  <div class="flex items-center">
                    <el-icon v-if="isDisplayVersion(row)" class="text-[var(--el-color-success)] mr-2 font-bold"><StarFilled /></el-icon>
                    <el-tag v-if="row.status==='completed'" type="success" size="small" effect="plain" class="!bg-[var(--el-color-success-light-9)] !font-bold">v{{ row.version }}</el-tag>
                    <el-tag v-else size="small" type="info" effect="plain" class="!bg-[var(--el-fill-color-light)]">--</el-tag>
                  </div>
                </template>
              </el-table-column>
              <el-table-column prop="status" label="状态" width="120">
                <template #default="{ row }">
                  <el-tag v-if="row.status==='completed'" type="success" size="small" effect="plain" class="!bg-[var(--el-color-success-light-9)] !font-bold">完成</el-tag>
                  <el-tag v-else-if="row.status==='processing'" type="warning" size="small" effect="plain" class="!bg-[var(--el-color-warning-light-9)] !font-bold">进行中</el-tag>
                  <el-tag v-else-if="row.status==='failed'" type="danger" size="small" effect="plain" class="!bg-[var(--el-color-danger-light-9)] !font-bold">失败</el-tag>
                  <el-tag v-else size="small" effect="plain" class="!bg-[var(--el-fill-color-light)]">{{ row.status }}</el-tag>
                </template>
              </el-table-column>
              <el-table-column prop="fileName" label="文件名" min-width="200" show-overflow-tooltip />
              <el-table-column prop="fileSize" label="大小" width="100">
                <template #default="{ row }">{{ formatSize(row.fileSize) }}</template>
              </el-table-column>
              <el-table-column prop="createdAt" label="创建时间" width="170" />
              <el-table-column label="操作" width="280" fixed="right">
                <template #default="{ row }">
                  <div class="flex gap-2">
                    <el-button size="small" type="primary" plain class="!rounded-lg" :disabled="row.status!=='completed'" @click="openPreview(row)">预览</el-button>
                    <el-button size="small" type="success" plain class="!rounded-lg" :disabled="row.status!=='completed' || isDisplayVersion(row)" @click="setDisplay(row)">设为展示</el-button>
                    <el-button size="small" type="info" plain class="!rounded-lg" :disabled="row.status!=='completed'" @click="copyUrl(row)">复制URL</el-button>
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

    <el-dialog v-model="previewVisible" title="动画预览" width="80%" top="5vh">
      <div v-if="previewUrl" class="preview-wrapper">
        <iframe :src="previewUrl" frameborder="0" class="preview-iframe" />
      </div>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="openInNewWindow" :disabled="!previewUrl">新窗口打开</el-button>
          <el-button type="primary" @click="previewVisible=false">关闭</el-button>
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
  FullScreen
} from "@element-plus/icons-vue";

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
:deep(.row-display) { background: var(--el-color-success-light-9) !important; }
:deep(.row-failed) { background: var(--el-color-danger-light-9) !important; }
</style>
