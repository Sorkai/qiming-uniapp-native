<template>
  <div class="nx">
    <!-- ============== NAV ============== -->
    <header class="nx-nav" :class="{ 'is-scrolled': isScrolled }">
      <div class="nx-nav__inner">
        <button class="nx-nav__brand" type="button" @click="router.push('/home')">
          <img :src="logo" alt="启明智教" />
          <span>启明智教</span>
        </button>

        <nav class="nx-nav__links" aria-label="首页导航">
          <a href="#agents">智能工作台</a>
          <a href="#features">能力</a>
          <a href="#workflow">工作流</a>
          <a href="#voice">用户声音</a>
        </nav>

        <div class="nx-nav__right">
          <template v-if="userInfo">
            <el-dropdown trigger="hover" @command="handleCommand">
              <button class="nx-nav__user" type="button">
                <el-avatar :size="26" :src="formatAvatar(userInfo.avatar)" />
                <span>{{ userInfo.nickname || userInfo.username }}</span>
              </button>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item v-if="hasAdminAccess" command="space">
                    <el-icon><User /></el-icon>进入空间
                  </el-dropdown-item>
                  <el-dropdown-item command="account">
                    <el-icon><Setting /></el-icon>账号管理
                  </el-dropdown-item>
                  <el-dropdown-item command="logout" divided>
                    <el-icon><SwitchButton /></el-icon>退出登录
                  </el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </template>
          <button v-else class="nx-link" type="button" @click="handleEntry">
            登录
          </button>
          <button class="nx-btn nx-btn--primary" type="button" @click="handleEntry">
            免费使用
          </button>
        </div>
      </div>
    </header>

    <main>
      <!-- ============== HERO ============== -->
      <section class="nx-hero">
        <!-- Notion-style line doodles peeking from edges -->
        <svg class="nx-doodle nx-doodle--left" viewBox="0 0 600 600" fill="none" aria-hidden="true">
          <path d="M-20 380 C 80 320, 150 360, 210 300 S 340 220, 420 260" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" />
          <path d="M40 460 C 120 420, 200 440, 260 400" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" />
          <circle cx="120" cy="180" r="3" fill="currentColor" />
          <circle cx="180" cy="240" r="2" fill="currentColor" />
          <circle cx="60" cy="260" r="2.5" fill="currentColor" />
          <!-- open book -->
          <g transform="translate(60 60)">
            <path d="M0 40 L 50 30 L 100 40 L 100 90 L 50 80 L 0 90 Z" stroke="currentColor" stroke-width="1.4" stroke-linejoin="round" />
            <path d="M50 30 L 50 80" stroke="currentColor" stroke-width="1.2" />
            <path d="M12 48 L 40 44 M12 60 L 40 56 M60 44 L 88 48 M60 56 L 88 60" stroke="currentColor" stroke-width="1" stroke-linecap="round" opacity="0.6" />
          </g>
          <!-- sparkle -->
          <g transform="translate(300 80)">
            <path d="M20 0 L 24 16 L 40 20 L 24 24 L 20 40 L 16 24 L 0 20 L 16 16 Z" stroke="currentColor" stroke-width="1.3" stroke-linejoin="round" fill="none" />
          </g>
          <!-- squiggle -->
          <path d="M250 520 q 12 -18 24 0 t 24 0 t 24 0 t 24 0" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" fill="none" />
        </svg>

        <svg class="nx-doodle nx-doodle--right" viewBox="0 0 600 600" fill="none" aria-hidden="true">
          <path d="M620 320 C 520 260, 440 320, 380 260 S 240 200, 160 240" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" />
          <path d="M560 420 C 480 380, 400 420, 320 380" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" />
          <circle cx="460" cy="160" r="3" fill="currentColor" />
          <circle cx="520" cy="220" r="2" fill="currentColor" />
          <circle cx="560" cy="180" r="2.5" fill="currentColor" />
          <!-- mini character with hard hat -->
          <g transform="translate(440 60)">
            <circle cx="40" cy="40" r="18" stroke="currentColor" stroke-width="1.4" fill="none" />
            <path d="M22 36 q 18 -22 36 0" stroke="currentColor" stroke-width="1.4" fill="none" stroke-linecap="round" />
            <path d="M16 36 L 64 36" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" />
            <circle cx="34" cy="42" r="1.6" fill="currentColor" />
            <circle cx="46" cy="42" r="1.6" fill="currentColor" />
            <path d="M34 52 q 6 6 12 0" stroke="currentColor" stroke-width="1.4" fill="none" stroke-linecap="round" />
            <path d="M40 58 L 40 90 M 28 70 L 52 70" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" />
          </g>
          <!-- arrow -->
          <g transform="translate(380 460)">
            <path d="M0 30 C 30 0, 70 0, 100 20" stroke="currentColor" stroke-width="1.4" fill="none" stroke-linecap="round" />
            <path d="M92 10 L 100 20 L 90 28" stroke="currentColor" stroke-width="1.4" fill="none" stroke-linecap="round" stroke-linejoin="round" />
          </g>
        </svg>

        <div class="nx-hero__inner">
          <h1 class="nx-hero__title">把教学、学习与反馈，放进一个空间。</h1>
          <p class="nx-hero__sub">
            启明智教让课程、试卷、作业、错题诊断和 AI 助教在同一处工作 —— 像
            Notion 的页面块一样自然连接。
          </p>
          <div class="nx-hero__cta">
            <button class="nx-btn nx-btn--primary nx-btn--lg" @click="handleEntry">
              免费使用
            </button>
            <button class="nx-btn nx-btn--ghost nx-btn--lg" @click="scrollToSection('agents')">
              查看演示
            </button>
          </div>

          <!-- Capability pills: every major platform highlight -->
          <ul class="nx-pills" aria-label="平台能力">
            <li v-for="p in capabilityPills" :key="p">{{ p }}</li>
          </ul>
        </div>

        <!-- Product preview composition: central window + satellite cards -->
        <div class="nx-hero__product">
          <!-- satellite: 数字人讲师 -->
          <aside class="nx-sat nx-sat--tl" aria-label="数字人讲师">
            <header>
              <span class="nx-sat__dot" style="background:#7B61FF" />
              <span>数字人讲师</span>
            </header>
            <div class="nx-sat__media">
              <video
                class="nx-sat__video"
                :src="avatarVideo"
                autoplay
                loop
                muted
                playsinline
                preload="metadata"
              />
              <aside class="nx-sat__chip" aria-hidden="true">
                <span class="nx-sat__chipLabel">现在讲解</span>
                <strong>数据结构 · 第 4 章</strong>
                <div class="nx-sat__chipMeta">
                  <i class="nx-pulse-sm" />
                  <span>实时口型同步</span>
                </div>
                <div class="nx-sat__wave nx-sat__wave--chip">
                  <span v-for="i in 10" :key="i" :style="{ animationDelay: i * 80 + 'ms' }" />
                </div>
              </aside>
            </div>
            <p>VRM 形象 + AI 语音，可以直接在课程里代老师讲课。</p>
          </aside>

          <!-- satellite: AI 助教对话 -->
          <aside class="nx-sat nx-sat--tr" aria-label="AI 助教">
            <header>
              <span class="nx-sat__dot" style="background:#26ce83" />
              <span>AI 助教 · 课程问答</span>
            </header>
            <div class="nx-bubble nx-bubble--in">第 3 章二叉树为什么不能用 BFS 直接判平衡？</div>
            <div class="nx-bubble nx-bubble--out">
              因为 BFS 不能在回溯时同步获取左右子树高度，建议用后序 DFS……
              <span class="nx-typing"><i /><i /><i /></span>
            </div>
          </aside>

          <!-- satellite: AI PPT 缩略图 -->
          <aside class="nx-sat nx-sat--bl" aria-label="AI PPT">
            <header>
              <span class="nx-sat__dot" style="background:#FFB547" />
              <span>AI 一键生成 PPT</span>
            </header>
            <div class="nx-slides">
              <div class="nx-slide">
                <strong>嵌入式 Linux</strong>
                <span /><span class="w70" /><span class="w50" />
              </div>
              <div class="nx-slide nx-slide--alt">
                <strong>进程与线程</strong>
                <span /><span class="w70" />
              </div>
              <div class="nx-slide">
                <strong>内存管理</strong>
                <span /><span class="w50" />
              </div>
            </div>
          </aside>

          <!-- satellite: OJ 判题 -->
          <aside class="nx-sat nx-sat--br" aria-label="OJ 在线判题">
            <header>
              <span class="nx-sat__dot" style="background:#4A90E2" />
              <span>OJ · 在线判题</span>
            </header>
            <pre class="nx-code"><span class="k">def</span> <span class="f">solve</span>(n):
  <span class="k">return</span> n * (n + 1) // 2</pre>
            <ul class="nx-cases">
              <li><i class="nx-ok" />Case 1 · 2 ms</li>
              <li><i class="nx-ok" />Case 2 · 3 ms</li>
              <li><i class="nx-ok" />Case 3 · 2 ms</li>
            </ul>
          </aside>

          <div class="nx-window">
            <div class="nx-window__bar">
              <span /><span /><span />
            </div>
            <div class="nx-window__body">
              <aside class="nx-side">
                <div class="nx-side__head">
                  <img :src="logo" alt="" />
                  <span>Qiming HQ</span>
                </div>
                <div class="nx-side__group">工作区</div>
                <button
                  v-for="(slide, idx) in showcaseSlides"
                  :key="slide.key"
                  type="button"
                  class="nx-side__item"
                  :class="{ 'is-active': activeShowcaseIndex === idx }"
                  @click="setShowcase(idx)"
                >
                  <component :is="slide.icon" />
                  <span>{{ slide.shortTitle }}</span>
                </button>
              </aside>

              <section class="nx-doc">
                <Transition name="nx-fade" mode="out-in">
                  <article :key="activeShowcase.key" class="nx-doc__inner">
                    <div class="nx-doc__crumbs">
                      <span>Qiming HQ</span>
                      <span>/</span>
                      <span>{{ activeShowcase.shortTitle }}</span>
                    </div>
                    <h2 class="nx-doc__title">
                      {{ activeShowcase.docTitle }}
                    </h2>
                    <p class="nx-doc__lede">{{ activeShowcase.summary }}</p>
                    <div class="nx-doc__props">
                      <div v-for="p in activeShowcase.props" :key="p.k">
                        <span>{{ p.k }}</span>
                        <strong>{{ p.v }}</strong>
                      </div>
                    </div>
                    <ul class="nx-doc__list">
                      <li v-for="task in activeShowcase.tasks" :key="task">
                        <i class="nx-check" />
                        {{ task }}
                      </li>
                    </ul>
                  </article>
                </Transition>
              </section>
            </div>
          </div>
        </div>
      </section>

      <!-- ============== SCRIPTED DEMO (AE-style) ============== -->
      <ScriptedDemo />

      <!-- ============== LOGO STRIP ============== -->
      <section class="nx-strip">
        <p class="nx-strip__lead">已服务的角色</p>
        <div class="nx-strip__items">
          <span v-for="item in logoStrip" :key="item">{{ item }}</span>
        </div>
      </section>

      <!-- ============== BENTO: FEATURES ============== -->
      <section id="features" class="nx-section nx-section--features">
        <header class="nx-shead">
          <p class="nx-eyebrow">能力 · Features</p>
          <h2 class="nx-stitle">教学场景，每个都有专属的工作面。</h2>
        </header>

        <!-- big bento card -->
        <article class="nx-bento nx-bento--wide" :style="{ '--bento-color': '#FFB547' }">
          <div class="nx-bento__head">
            <div>
              <p class="nx-bento__eyebrow">课程工作台</p>
              <h3 class="nx-bento__title">把课程、章节与学习计划，放在同一处。</h3>
            </div>
            <button class="nx-arrow" type="button" @click="handleEntry">
              <span aria-hidden="true">→</span>
            </button>
          </div>
          <div class="nx-bento__media">
            <div class="nx-bento__inset nx-bento__inset--carousel">
              <MiniBrowser :slides="bentoCourseSlides" />
            </div>
          </div>
        </article>

        <!-- 2-up bento -->
        <div class="nx-bento__grid">
          <article class="nx-bento" :style="{ '--bento-color': '#E85847' }">
            <div class="nx-bento__head">
              <div>
                <p class="nx-bento__eyebrow">错题诊断</p>
                <h3 class="nx-bento__title">不止记录答案，更追踪错因。</h3>
              </div>
              <button class="nx-arrow" type="button" @click="handleEntry">
                <span aria-hidden="true">→</span>
              </button>
            </div>
            <div class="nx-bento__media">
              <div class="nx-bento__inset nx-bento__inset--carousel">
                <MiniBrowser :slides="bentoWrongSlides" :interval="5200" />
              </div>
            </div>
          </article>

          <article class="nx-bento" :style="{ '--bento-color': '#4A90E2' }">
            <div class="nx-bento__head">
              <div>
                <p class="nx-bento__eyebrow">智能组卷</p>
                <h3 class="nx-bento__title">从命题到阅卷，一条线走完。</h3>
              </div>
              <button class="nx-arrow" type="button" @click="handleEntry">
                <span aria-hidden="true">→</span>
              </button>
            </div>
            <div class="nx-bento__media">
              <div class="nx-bento__inset nx-bento__inset--carousel">
                <MiniBrowser :slides="bentoExamSlides" :interval="5800" />
              </div>
            </div>
          </article>
        </div>

        <!-- 3-up rich bento cards (with carousels & live-demo) -->
        <div class="nx-bento__grid nx-bento__grid--3">
          <article class="nx-bento" :style="{ '--bento-color': '#10B981' }">
            <div class="nx-bento__head">
              <div>
                <p class="nx-bento__eyebrow">学情画像</p>
                <h3 class="nx-bento__title">能力雷达 · 教师 / 学生同步可见。</h3>
              </div>
              <button class="nx-arrow" type="button" @click="handleEntry">
                <span aria-hidden="true">→</span>
              </button>
            </div>
            <div class="nx-bento__media">
              <div class="nx-bento__inset nx-bento__inset--carousel">
                <MiniBrowser :slides="bentoPortraitSlides" :interval="5000" />
              </div>
            </div>
          </article>

          <article class="nx-bento" :style="{ '--bento-color': '#7B61FF' }">
            <div class="nx-bento__head">
              <div>
                <p class="nx-bento__eyebrow">学习路径</p>
                <h3 class="nx-bento__title">教研路径 · 个性化推荐。</h3>
              </div>
              <button class="nx-arrow" type="button" @click="handleEntry">
                <span aria-hidden="true">→</span>
              </button>
            </div>
            <div class="nx-bento__media">
              <div class="nx-bento__inset nx-bento__inset--carousel">
                <MiniBrowser :slides="bentoPathSlides" :interval="5400" />
              </div>
            </div>
          </article>

          <article class="nx-bento" :style="{ '--bento-color': '#F59E0B' }">
            <div class="nx-bento__head">
              <div>
                <p class="nx-bento__eyebrow">虚拟实验 · AI 课件</p>
                <h3 class="nx-bento__title">动画、PPT、视频分析。</h3>
              </div>
              <button class="nx-arrow" type="button" @click="handleEntry">
                <span aria-hidden="true">→</span>
              </button>
            </div>
            <div class="nx-bento__media">
              <div class="nx-bento__inset nx-bento__inset--carousel">
                <MiniBrowser :slides="bentoLabSlides" :interval="5800" />
              </div>
            </div>
          </article>
        </div>

        <!-- competition wide bento -->
        <article class="nx-bento nx-bento--wide" :style="{ '--bento-color': '#FF6B6B' }">
          <div class="nx-bento__head">
            <div>
              <p class="nx-bento__eyebrow">综合赛事</p>
              <h3 class="nx-bento__title">OJ 判题 · 作文比赛 · 赛事管理一站式。</h3>
            </div>
            <button class="nx-arrow" type="button" @click="handleEntry">
              <span aria-hidden="true">→</span>
            </button>
          </div>
          <div class="nx-bento__media">
            <div class="nx-bento__inset nx-bento__inset--carousel">
              <MiniBrowser :slides="bentoCompetitionSlides" :interval="5400" />
            </div>
          </div>
        </article>

        <!-- text-only conceptual cards -->
        <div class="nx-bento__grid nx-bento__grid--3">
          <article
            v-for="b in tripleBento"
            :key="b.title"
            class="nx-bento nx-bento--sm"
          >
            <div class="nx-bento__head">
              <div>
                <p class="nx-bento__eyebrow">{{ b.eyebrow }}</p>
                <h3 class="nx-bento__title">{{ b.title }}</h3>
              </div>
              <button class="nx-arrow nx-arrow--sm" type="button" @click="handleEntry">
                <span aria-hidden="true">→</span>
              </button>
            </div>
            <p class="nx-bento__copy">{{ b.copy }}</p>
          </article>
        </div>
      </section>

      <!-- ============== AGENTS SHOWCASE ============== -->
      <section id="agents" class="nx-section nx-section--gray">
        <header class="nx-shead nx-shead--center">
          <p class="nx-eyebrow">智能工作台 · Workspace</p>
          <h2 class="nx-stitle">一个空间，承载所有教学活动。</h2>
          <p class="nx-ssub">
            点击左侧切换不同模块，看看教师与学生在启明智教中的真实工作面。
          </p>
        </header>

        <div class="nx-tabbar">
          <button
            v-for="(slide, idx) in showcaseSlides"
            :key="slide.key"
            type="button"
            class="nx-tabbar__btn"
            :class="{ 'is-active': activeShowcaseIndex === idx }"
            @click="setShowcase(idx)"
          >
            {{ slide.shortTitle }}
          </button>
        </div>

        <div class="nx-tabpanel">
          <Transition name="nx-fade" mode="out-in">
            <div :key="activeShowcase.key" class="nx-tabpanel__inner">
              <div class="nx-tabpanel__copy">
                <h3>{{ activeShowcase.title }}</h3>
                <p>{{ activeShowcase.summary }}</p>
                <ul>
                  <li v-for="agent in activeShowcase.agents" :key="agent">
                    <i class="nx-check" />{{ agent }}
                  </li>
                </ul>
              </div>
              <div class="nx-tabpanel__media">
                <div
                  class="nx-bento__inset nx-bento__inset--lg nx-bento__inset--carousel"
                  :style="{ '--bento-color': activeShowcase.color }"
                >
                  <MiniBrowser :slides="activeShowcase.screens" :interval="5000" />
                </div>
              </div>
            </div>
          </Transition>
        </div>
      </section>

      <!-- ============== WORKFLOW ============== -->
      <section id="workflow" class="nx-section">
        <header class="nx-shead">
          <p class="nx-eyebrow">工作流 · Workflow</p>
          <h2 class="nx-stitle">从备课到诊断，一条线走完。</h2>
        </header>

        <ol class="nx-steps">
          <li v-for="(item, idx) in workflowItems" :key="item.title">
            <span class="nx-steps__num">{{ String(idx + 1).padStart(2, "0") }}</span>
            <h4>{{ item.title }}</h4>
            <p>{{ item.description }}</p>
          </li>
        </ol>
      </section>

      <!-- ============== TESTIMONIALS ============== -->
      <section id="voice" class="nx-section nx-section--gray">
        <header class="nx-shead">
          <p class="nx-eyebrow">用户声音 · Voices</p>
          <h2 class="nx-stitle">每个角色，都有清晰的入口。</h2>
        </header>

        <div class="nx-quotes">
          <article
            v-for="item in testimonials"
            :key="item.name"
            class="nx-quote"
          >
            <p class="nx-quote__brand">{{ item.tag }}</p>
            <p class="nx-quote__body">
              "{{ item.content }}"
              <span class="nx-quote__more" aria-hidden="true">→</span>
            </p>
            <div class="nx-quote__who">
              <strong>{{ item.name }}</strong>
              <small>{{ item.title }}</small>
            </div>
          </article>
        </div>

        <ul class="nx-stats">
          <li v-for="s in statsData" :key="s.label">
            <strong>{{ s.number }}</strong>
            <span>{{ s.label }}</span>
          </li>
        </ul>
      </section>

      <!-- ============== CTA ============== -->
      <section class="nx-cta">
        <div class="nx-cta__inner">
          <h2>把智能教育工作台打开看看。</h2>
          <p>用真实课程、试卷、错题和 AI 助教，呈现一个可以落地的平台。</p>
          <div class="nx-cta__btns">
            <button class="nx-btn nx-btn--primary nx-btn--lg" @click="handleEntry">
              免费使用
            </button>
            <button class="nx-btn nx-btn--ghost nx-btn--lg" @click="scrollToSection('agents')">
              回看演示
            </button>
          </div>
        </div>
      </section>
    </main>

    <LoginDialog
      v-model:visible="showLoginDialog"
      @login-success="handleLoginSuccess"
    />

    <footer class="nx-foot">
      <div class="nx-foot__inner">
        <div class="nx-foot__brand">
          <img :src="logo" alt="启明智教" />
          <div>
            <strong>启明智教 · Intelledu.com</strong>
            <p>长春工业大学计算机科学与工程学院 · 吉林省云创迅捷软件开发有限公司</p>
          </div>
        </div>
        <p class="nx-foot__legal">
          吉ICP备2025035820号-1 · 吉公网安备22017302000511号 · ©2024 Est.
        </p>
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { computed, markRaw, onMounted, onUnmounted, ref } from "vue";
import { useRouter } from "vue-router";
import { Setting, SwitchButton, User } from "@element-plus/icons-vue";
import { storageLocal } from "@pureadmin/utils";
import { ElMessage } from "element-plus";
import { useUserStoreHook } from "@/store/modules/user";
import { initRouter } from "@/router/utils";
import { formatAvatar } from "@/utils/avatar";
import { getToken, removeToken, userKey } from "@/utils/auth";
import type { DataInfo } from "@/utils/auth";
import LoginDialog from "@/components/LoginDialog.vue";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

import logo from "@/assets/logo.png";
import avatarVideo from "@/assets/生成数字人待机视频.mp4";
import MiniBrowser from "./MiniBrowser.vue";
import ScriptedDemo from "./ScriptedDemo.vue";

import shotStudentDashboard from "@/assets/home/screens/student-dashboard.jpg";
import shotStudentCourses from "@/assets/home/screens/student-courses.jpg";
import shotStudentExam from "@/assets/home/screens/student-exam.jpg";
import shotStudentDisk from "@/assets/home/screens/student-disk.jpg";
import shotStudentVlab from "@/assets/home/screens/student-virtual-lab.jpg";
import shotStudentAiapp from "@/assets/home/screens/student-aiapp.jpg";
import shotStudentCompetition from "@/assets/home/screens/student-competition.jpg";
import shotTeacherCategory from "@/assets/home/screens/teacher-course-category.jpg";
import shotTeacherTemplates from "@/assets/home/screens/teacher-templates.jpg";

// 新一批：真实页面截图（1600×1000）
import shotStudentWelcome from "@/assets/home/screens/student-welcome.jpg";
import shotStudentAccount from "@/assets/home/screens/student-account.jpg";
import shotStudentWrongBook from "@/assets/home/screens/student-wrong-book.jpg";
import shotStudentAiappGen from "@/assets/home/screens/student-aiapp.jpg";
import shotStudentAiappChat from "@/assets/home/screens/student-aiapp-chat.jpg";
import shotStudentAiappProfile from "@/assets/home/screens/student-aiapp-profile.jpg";
import shotStudentAiappPath from "@/assets/home/screens/student-aiapp-path.jpg";
import shotStudentAiappPdf from "@/assets/home/screens/student-aiapp-pdf.jpg";
import shotStudentVirtualLab from "@/assets/home/screens/student-virtual-lab.jpg";
import shotStudentExamCenter from "@/assets/home/screens/student-exam.jpg";
import shotStudentOj from "@/assets/home/screens/student-competition-oj.jpg";
import shotStudentEssay from "@/assets/home/screens/student-competition-essay.jpg";
import shotStudentCloudDisk from "@/assets/home/screens/student-disk.jpg";

import shotTeacherWelcome from "@/assets/home/screens/teacher-welcome.jpg";
import shotTeacherCourseList from "@/assets/home/screens/teacher-course-list.jpg";
import shotTeacherCourseCategory from "@/assets/home/screens/teacher-course-category.jpg";
import shotTeacherTeacherplan from "@/assets/home/screens/teacher-teacherplan.jpg";
import shotTeacherAippt from "@/assets/home/screens/teacher-aippt.jpg";
import shotTeacherTpls from "@/assets/home/screens/teacher-templates.jpg";
import shotTeacherGrading from "@/assets/home/screens/teacher-grading.jpg";
import shotTeacherStatistics from "@/assets/home/screens/teacher-statistics.jpg";
import shotTeacherPortrait from "@/assets/home/screens/teacher-portrait.jpg";
import shotTeacherResearchPath from "@/assets/home/screens/teacher-research-path.jpg";
import shotTeacherQuestionBank from "@/assets/home/screens/teacher-question-bank.jpg";
import shotTeacherVideoAnalysis from "@/assets/home/screens/teacher-video-analysis.jpg";
import shotTeacherEventManage from "@/assets/home/screens/teacher-event-manage.jpg";
import shotTeacherDiscussionReview from "@/assets/home/screens/teacher-discussion-review.jpg";

import IconBook from "@/assets/home-icons/book.svg?component";
import IconEdit from "@/assets/home-icons/edit.svg?component";
import IconTarget from "@/assets/home-icons/target.svg?component";
import IconZap from "@/assets/home-icons/zap.svg?component";

const router = useRouter();
const userStore = useUserStoreHook();
const isScrolled = ref(false);
const showLoginDialog = ref(false);
const activeShowcaseIndex = ref(0);
let showcaseTimer: number | undefined;
const rawIcon = (icon: any) => markRaw(icon);

const userInfo = computed(() => {
  const info = storageLocal().getItem<DataInfo<number>>(userKey);
  const avatar = userStore.avatar || info?.avatar;
  const nickname = userStore.nickname || info?.nickname;
  const username = userStore.username || info?.username;
  if (!avatar && !nickname && !username) return null;
  return {
    avatar,
    nickname,
    username,
    roleType: info?.roleType
  };
});

const hasAdminAccess = computed(() => {
  if (!userInfo.value) return false;
  return userInfo.value.roleType === 2 || userInfo.value.roleType === 3;
});

/* ---------- Data ---------- */
const logoStrip = [
  "学生",
  "教师",
  "教研组",
  "家长",
  "高校",
  "K12 学校",
  "培训机构"
];

const capabilityPills = [
  "AI 助教",
  "数字人讲师",
  "AI PPT 生成",
  "AI 资料研读",
  "虚拟实验室",
  "3D 虚拟校园",
  "视频分析",
  "AI 动画课件",
  "教案管理",
  "智能组卷 · 阅卷",
  "学情画像",
  "个性化学习路径",
  "OJ 判题",
  "作文比赛",
  "综合赛事管理"
];

const showcaseSlides = [
  {
    key: "course",
    shortTitle: "课程",
    title: "课程工作台，让教与学共享同一份页面。",
    docTitle: "嵌入式 Linux 开发实践教程",
    summary:
      "把课程资源、章节进度、学习计划放在同一处。AI 会根据完成度，给学生生成下一组任务。",
    color: "#FFB547",
    props: [
      { k: "学习进度", v: "86%" },
      { k: "章节", v: "12" }
    ],
    tasks: [
      "第 3 章：进程与线程实验",
      "课件资源同步到云盘",
      "AI 生成章节导学笔记",
      "下一步：完成本章随堂练习"
    ],
    agents: ["资源整理", "进度追踪", "AI 导学"],
    icon: rawIcon(IconBook),
    screens: [
      {
        src: shotTeacherCourseList,
        url: "intelledu.com/course/list",
        title: "教师·课程列表 · 进度同步",
        iframeRoute: "/course/list",
        role: "teacher" as const
      },
      {
        src: shotStudentWelcome,
        url: "intelledu.com/welcome · 学生",
        title: "学生·智慧教学平台首页",
        iframeRoute: "/welcome/index",
        role: "student" as const
      },
      {
        src: shotTeacherCourseCategory,
        url: "intelledu.com/course/category",
        title: "教师·课程分类与运营看板",
        iframeRoute: "/course/category",
        role: "teacher" as const
      }
    ]
  },
  {
    key: "wrong",
    shortTitle: "错题",
    title: "错题诊断，不止记录答案，更追踪错因。",
    docTitle: "本周错题分析报告",
    summary:
      "系统识别概念偏差后，会自动生成同类强化练习，并把它推送到学生个人中心。",
    color: "#E85847",
    props: [
      { k: "新练习", v: "3 题" },
      { k: "薄弱点", v: "表达式求值" }
    ],
    tasks: [
      "运算优先级错误已归因",
      "关联知识点：表达式求值",
      "已生成同类题与解析",
      "推送至学生个人中心"
    ],
    agents: ["错因分析", "题目生成", "学习建议"],
    icon: rawIcon(IconTarget),
    screens: [
      {
        src: shotStudentWrongBook,
        url: "intelledu.com/account/wrong-exercise",
        title: "AI 错题本 · 错因聚类",
        iframeRoute: "/account/wrong-exercise",
        role: "student" as const
      },
      {
        src: shotStudentAiappGen,
        url: "intelledu.com/ai-app/generation",
        title: "举一反三 · AI 资源生成",
        iframeRoute: "/ai-app/generation",
        role: "student" as const
      },
      {
        src: shotStudentAiappChat,
        url: "intelledu.com/ai-app/chat",
        title: "AI 助教 · 课程问答",
        iframeRoute: "/ai-app/chat",
        role: "student" as const
      }
    ]
  },
  {
    key: "exam",
    shortTitle: "试卷",
    title: "试卷中心，把组卷、答题、阅卷串成一条线。",
    docTitle: "算法期中测验",
    summary:
      "教师组卷、学生答题、阅卷与学情报告在同一空间完成。",
    color: "#4A90E2",
    props: [
      { k: "平均分", v: "92" },
      { k: "待阅卷", v: "12 份" }
    ],
    tasks: [
      "已发布到选修班",
      "题型难度分布正常",
      "12 份主观题待阅卷",
      "学情分析报告已生成"
    ],
    agents: ["智能组卷", "阅卷管理", "学情报告"],
    icon: rawIcon(IconEdit),
    screens: [
      {
        src: shotTeacherTpls,
        url: "intelledu.com/exam-paper/templates",
        title: "教师·试卷模板",
        iframeRoute: "/exam-paper/templates",
        role: "teacher" as const
      },
      {
        src: shotTeacherGrading,
        url: "intelledu.com/exam-paper/grading",
        title: "AI 阅卷管理",
        iframeRoute: "/exam-paper/grading",
        role: "teacher" as const
      },
      {
        src: shotTeacherStatistics,
        url: "intelledu.com/exam-paper/statistics",
        title: "多维成绩分析",
        iframeRoute: "/exam-paper/statistics",
        role: "teacher" as const
      },
      {
        src: shotStudentExamCenter,
        url: "intelledu.com/student-exam-center",
        title: "学生·考试中心",
        iframeRoute: "/student-exam-center/list",
        role: "student" as const
      }
    ]
  },
  {
    key: "animation",
    shortTitle: "课件",
    title: "动态课件，把抽象知识点变成可播放、可交互。",
    docTitle: "数据结构动画课件",
    summary:
      "把章节内容转为 HTML5 动画与可交互演示，学生端直接播放、与虚拟校园联动。",
    color: "#7B61FF",
    props: [
      { k: "课件版本", v: "HTML5" },
      { k: "章节匹配", v: "已完成" }
    ],
    tasks: [
      "章节动画版本已生成",
      "知识点结构映射完成",
      "多模态资源接入课程",
      "虚拟校园场景可联动"
    ],
    agents: ["动画生成", "资源解析", "场景联动"],
    icon: rawIcon(IconZap),
    screens: [
      {
        src: shotStudentVirtualLab,
        url: "intelledu.com/virtual-lab",
        title: "虚拟实验室 · 动画 + 交互",
        iframeRoute: "/virtual-lab",
        role: "student" as const
      },
      {
        src: shotTeacherAippt,
        url: "intelledu.com/aippt",
        title: "AI PPT 生成",
        iframeRoute: "/aippt",
        role: "teacher" as const
      },
      {
        src: shotTeacherVideoAnalysis,
        url: "intelledu.com/course/video-analysis",
        title: "视频分析 · 教学视频结构化",
        iframeRoute: "/course/video-analysis",
        role: "teacher" as const
      },
      {
        src: shotStudentAiappPdf,
        url: "intelledu.com/ai-app/agentpdf",
        title: "AI 资料研读 · 文档智能体",
        iframeRoute: "/ai-app/agentpdf",
        role: "student" as const
      }
    ]
  },
  {
    key: "portrait",
    shortTitle: "学情",
    title: "学情画像，让每位学生的能力被看见。",
    docTitle: "全息学习画像",
    summary:
      "课程进度、考试成绩、错题分布共同构成学习画像，教师与学生同步可见。",
    color: "#10B981",
    props: [
      { k: "维度", v: "8" },
      { k: "覆盖", v: "全班" }
    ],
    tasks: [
      "学习行为自动沉淀",
      "教学知识点雷达",
      "薄弱点专题推荐",
      "教研路径联动"
    ],
    agents: ["画像分析", "知识图谱", "教研路径"],
    icon: rawIcon(IconTarget),
    screens: [
      {
        src: shotTeacherPortrait,
        url: "intelledu.com/ai-app/profile · 教师",
        title: "教师·全息学情画像",
        iframeRoute: "/ai-app/profile",
        role: "teacher" as const
      },
      {
        src: shotTeacherResearchPath,
        url: "intelledu.com/ai-app/path · 教研",
        title: "教师·教研路径分析",
        iframeRoute: "/ai-app/path",
        role: "teacher" as const
      },
      {
        src: shotStudentAiappProfile,
        url: "intelledu.com/ai-app/profile · 学生",
        title: "学生·学习画像",
        iframeRoute: "/ai-app/profile",
        role: "student" as const
      },
      {
        src: shotStudentAiappPath,
        url: "intelledu.com/ai-app/path · 学习",
        title: "学生·个性化学习路径",
        iframeRoute: "/ai-app/path",
        role: "student" as const
      }
    ]
  },
  {
    key: "competition",
    shortTitle: "赛事",
    title: "综合赛事，把竞赛与日常教学打通。",
    docTitle: "校内编程赛",
    summary:
      "OJ 判题、作文比赛、综合赛事在同一空间发布、报名、评审。",
    color: "#F59E0B",
    props: [
      { k: "已上线", v: "12 项" },
      { k: "参与人数", v: "1,280" }
    ],
    tasks: [
      "OJ 题目自动评测",
      "AI 作文打分",
      "赛事流程闭环",
      "教学与竞赛贯通"
    ],
    agents: ["OJ 判题", "作文 AI", "赛事管理"],
    icon: rawIcon(IconEdit),
    screens: [
      {
        src: shotStudentOj,
        url: "intelledu.com/competition/oj",
        title: "学生·OJ 判题",
        iframeRoute: "/competition/oj",
        role: "student" as const
      },
      {
        src: shotStudentEssay,
        url: "intelledu.com/competition/essay",
        title: "学生·作文比赛",
        iframeRoute: "/competition/essay",
        role: "student" as const
      },
      {
        src: shotTeacherEventManage,
        url: "intelledu.com/competition/event-manage",
        title: "教师·综合赛事管理",
        iframeRoute: "/competition/event-manage",
        role: "teacher" as const
      }
    ]
  }
];

const activeShowcase = computed(() => showcaseSlides[activeShowcaseIndex.value]);

const bentoCourseSlides = [
  {
    src: shotTeacherCourseList,
    url: "intelledu.com/course/list",
    title: "教师·课程列表 · 全量章节与资源",
    iframeRoute: "/course/list",
    role: "teacher" as const
  },
  {
    src: shotTeacherTeacherplan,
    url: "intelledu.com/course/teacherplan",
    title: "教案管理 · AI 自动生成章节教学",
    iframeRoute: "/course/teacherplan",
    role: "teacher" as const
  },
  {
    src: shotTeacherCourseCategory,
    url: "intelledu.com/course/category",
    title: "课程分类与运营看板",
    iframeRoute: "/course/category",
    role: "teacher" as const
  },
  {
    src: shotStudentWelcome,
    url: "intelledu.com/welcome",
    title: "学生·智慧教学平台首页",
    iframeRoute: "/welcome/index",
    role: "student" as const
  }
];

const bentoWrongSlides = [
  {
    src: shotStudentWrongBook,
    url: "intelledu.com/account/wrong-exercise",
    title: "AI 错题本 · 错因聚类 · 同类强化",
    iframeRoute: "/account/wrong-exercise",
    role: "student" as const
  },
  {
    src: shotStudentAiappGen,
    url: "intelledu.com/ai-app/generation",
    title: "举一反三 · AI 资源工作台",
    iframeRoute: "/ai-app/generation",
    role: "student" as const
  },
  {
    src: shotStudentAiappChat,
    url: "intelledu.com/ai-app/chat",
    title: "AI 助教 · 课程问答 · 错因解析",
    iframeRoute: "/ai-app/chat",
    role: "student" as const
  }
];

const bentoExamSlides = [
  {
    src: shotTeacherTpls,
    url: "intelledu.com/exam-paper/templates",
    title: "试卷模板 · 一键智能组卷",
    iframeRoute: "/exam-paper/templates",
    role: "teacher" as const
  },
  {
    src: shotTeacherGrading,
    url: "intelledu.com/exam-paper/grading",
    title: "AI 阅卷 · 主客观自动批改",
    iframeRoute: "/exam-paper/grading",
    role: "teacher" as const
  },
  {
    src: shotTeacherStatistics,
    url: "intelledu.com/exam-paper/statistics",
    title: "多维成绩分析 · 班级 / 知识点透视",
    iframeRoute: "/exam-paper/statistics",
    role: "teacher" as const
  },
  {
    src: shotTeacherQuestionBank,
    url: "intelledu.com/exam-paper/question-bank",
    title: "智能题库 · 标签 / 难度 / 知识点",
    iframeRoute: "/exam-paper/question-bank",
    role: "teacher" as const
  }
];

// 新增 bento 用：学情画像 / 学习路径 / 数字人 / AI PPT / 虚拟实验室
const bentoPortraitSlides = [
  {
    src: shotTeacherPortrait,
    url: "intelledu.com/ai-app/profile · 教师视角",
    title: "教师·学情画像 · 全息能力雷达",
    iframeRoute: "/ai-app/profile",
    role: "teacher" as const
  },
  {
    src: shotStudentAiappProfile,
    url: "intelledu.com/ai-app/profile · 学生视角",
    title: "学生·全息学习画像",
    iframeRoute: "/ai-app/profile",
    role: "student" as const
  }
];

const bentoPathSlides = [
  {
    src: shotTeacherResearchPath,
    url: "intelledu.com/ai-app/path · 教研路径",
    title: "教师·教研路径 · 课程能力图谱",
    iframeRoute: "/ai-app/path",
    role: "teacher" as const
  },
  {
    src: shotStudentAiappPath,
    url: "intelledu.com/ai-app/path · 学习路径",
    title: "学生·个性化学习路径",
    iframeRoute: "/ai-app/path",
    role: "student" as const
  }
];

const bentoLabSlides = [
  {
    src: shotStudentVirtualLab,
    url: "intelledu.com/virtual-lab",
    title: "虚拟实验室 · HTML5 动画 + 交互",
    iframeRoute: "/virtual-lab",
    role: "student" as const
  },
  {
    src: shotTeacherAippt,
    url: "intelledu.com/aippt",
    title: "AI PPT 生成 · 课件级文档生产",
    iframeRoute: "/aippt",
    role: "teacher" as const
  },
  {
    src: shotTeacherVideoAnalysis,
    url: "intelledu.com/course/video-analysis",
    title: "视频分析 · AI 解构教学视频",
    iframeRoute: "/course/video-analysis",
    role: "teacher" as const
  }
];

const bentoCompetitionSlides = [
  {
    src: shotStudentOj,
    url: "intelledu.com/competition/oj",
    title: "OJ 判题 · 自动评测与排行榜",
    iframeRoute: "/competition/oj",
    role: "student" as const
  },
  {
    src: shotStudentEssay,
    url: "intelledu.com/competition/essay",
    title: "作文比赛 · AI 智能批改",
    iframeRoute: "/competition/essay",
    role: "student" as const
  },
  {
    src: shotTeacherEventManage,
    url: "intelledu.com/competition/event-manage",
    title: "教师·综合赛事管理",
    iframeRoute: "/competition/event-manage",
    role: "teacher" as const
  }
];

const tripleBento = [
  {
    eyebrow: "学情画像",
    title: "学习行为，自动沉淀为画像。",
    copy: "课程进度、考试成绩、错题原因共同构成可分析的学习画像。"
  },
  {
    eyebrow: "AI 助教",
    title: "答疑、解题、规划，一个对话框。",
    copy: "围绕课程内容，提供即时答疑、错因分析与个性化建议。"
  },
  {
    eyebrow: "成长档案",
    title: "完整的学习路径，留在档案里。",
    copy: "学生的学习记录、能力图谱、成长报告，按时间线持续生长。"
  }
];

const workflowItems = [
  { title: "备课", description: "从课程章节发起教案、资源、动画课件和题库配置。" },
  { title: "学习", description: "学生在课程空间里看资源、做练习、提问并获得 AI 提示。" },
  { title: "评测", description: "试卷中心管理考试、答题、阅卷和成绩发布状态。" },
  { title: "诊断", description: "错题分析与学情报告持续定位薄弱点，生成下一步计划。" }
];

const statsData = [
  { number: "1,000+", label: "注册学员" },
  { number: "50+", label: "授课教师" },
  { number: "100+", label: "上线课程" },
  { number: "98%", label: "学员满意度" }
];

const testimonials = [
  {
    tag: "学生",
    content:
      "错题分析能直接告诉我哪里理解偏了，还会给同类练习，比只看答案有用得多。",
    name: "小明",
    title: "课程学习者"
  },
  {
    tag: "教师",
    content:
      "试卷、作业和学情报告集中在一个工作台，备课和课后跟进都更省心。",
    name: "张老师",
    title: "课程教师"
  },
  {
    tag: "家长",
    content:
      "孩子的学习进度、成绩趋势和薄弱点都能看清楚，学习计划也更有方向。",
    name: "李女士",
    title: "学生家长"
  }
];

/* ---------- Handlers ---------- */
const handleScroll = () => {
  isScrolled.value = window.scrollY > 20;
};
const setShowcase = (index: number) => {
  activeShowcaseIndex.value = index;
};
const startShowcaseTimer = () => {
  showcaseTimer = window.setInterval(() => {
    activeShowcaseIndex.value =
      (activeShowcaseIndex.value + 1) % showcaseSlides.length;
  }, 6000);
};
const scrollToSection = (id: string) => {
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
};
const handleEntry = () => {
  const token = getToken();
  const info = storageLocal().getItem<DataInfo<number>>(userKey);
  const isLogged = !!(token?.accessToken || token?.refreshToken || info);
  if (isLogged) {
    const roleType =
      info?.roleType ?? (token as any)?.roleType ?? userInfo.value?.roleType;
    if (roleType === 2 || roleType === 3) router.push("/welcome/index");
    else router.push("/account");
  } else {
    showLoginDialog.value = true;
  }
};
const handleLoginSuccess = async () => {
  await initRouter();
  const info = storageLocal().getItem<DataInfo<number>>(userKey);
  const token = getToken();
  const roleType =
    info?.roleType ?? (token as any)?.roleType ?? userInfo.value?.roleType;
  if (Number(roleType) === 2 || Number(roleType) === 3)
    router.push("/welcome/index");
  else router.push("/account");
};
const handleCommand = (command: string) => {
  switch (command) {
    case "space":
      if (hasAdminAccess.value) router.push("/welcome/index");
      else ElMessage.warning("您没有权限进入后台管理空间");
      break;
    case "account":
      router.push("/account");
      break;
    case "logout":
      removeToken();
      ElMessage.success("退出登录成功");
      break;
  }
};

onMounted(() => {
  window.addEventListener("scroll", handleScroll);
  startShowcaseTimer();

  // GSAP: Bento Cards Reveal
  gsap.from(".nx-bento", {
    y: 40,
    opacity: 0,
    duration: 0.8,
    stagger: 0.2,
    ease: "power3.out",
    scrollTrigger: {
      trigger: "#features",
      start: "top 80%",
    }
  });

  // GSAP: Hero satellites floating
  gsap.to(".nx-sat", {
    y: "random(-10, 10)",
    x: "random(-5, 5)",
    rotation: "random(-2, 2)",
    duration: "random(2, 4)",
    repeat: -1,
    yoyo: true,
    ease: "sine.inOut"
  });

  // GSAP: Workflow Steps Sequential Reveal
  gsap.from(".nx-steps li", {
    x: -30,
    opacity: 0,
    duration: 0.6,
    stagger: 0.15,
    ease: "back.out(1.7)",
    scrollTrigger: {
      trigger: ".nx-steps",
      start: "top 85%",
    }
  });
});
onUnmounted(() => {
  window.removeEventListener("scroll", handleScroll);
  if (showcaseTimer) window.clearInterval(showcaseTimer);
});
</script>

<style lang="scss" scoped>
/* =========================================================
   Notion-faithful tokens (measured 2026-06)
   ========================================================= */
.nx {
  --nx-text: rgb(0 0 0 / 95%);
  --nx-text-muted: rgb(0 0 0 / 55%);
  --nx-text-faint: rgb(0 0 0 / 35%);
  --nx-bg: #fff;
  --nx-bg-gray: rgb(246 245 244);
  --nx-border: rgb(0 0 0 / 8%);
  --nx-border-strong: rgb(0 0 0 / 14%);
  --nx-blue: rgb(0 117 222);
  --nx-blue-hover: rgb(0 100 190);
  --nx-radius: 12px;
  --nx-radius-sm: 8px;
  --nx-radius-xs: 6px;
  --nx-container: 1320px;
  --nx-container-wide: 1480px;
  --nx-font:
    "Inter", "NotionInter", -apple-system, BlinkMacSystemFont, "Segoe UI",
    "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", Helvetica,
    Arial, sans-serif;

  min-height: 100vh;
  font-family: var(--nx-font);
  color: var(--nx-text);
  background: var(--nx-bg);
  -webkit-font-smoothing: antialiased;
  text-rendering: optimizeLegibility;
  overflow-x: hidden;
}

.nx :deep(svg) {
  fill: none;
  stroke: currentColor;
  stroke-width: 1.8;
  stroke-linecap: round;
  stroke-linejoin: round;
}

/* =========================================================
   NAV (transparent over dark hero, white text)
   ========================================================= */
.nx-nav {
  position: fixed;
  inset: 0 0 auto;
  z-index: 40;
  height: 60px;
  color: rgb(246 245 244);
  background: transparent;
  transition: background 0.2s, color 0.2s, border-color 0.2s;
  border-bottom: 1px solid transparent;

  &.is-scrolled {
    color: var(--nx-text);
    background: rgb(255 255 255 / 92%);
    border-bottom-color: var(--nx-border);
    backdrop-filter: saturate(180%) blur(12px);
  }
}

.nx-nav__inner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 100%;
  max-width: min(1760px, 100%);
  padding: 0 clamp(32px, 3.6vw, 72px);
  margin: 0 auto;
}

.nx-nav__brand {
  display: inline-flex;
  gap: 8px;
  align-items: center;
  padding: 0;
  font: inherit;
  font-size: 15px;
  font-weight: 600;
  color: inherit;
  cursor: pointer;
  background: transparent;
  border: 0;

  img {
    width: 38px;
    height: 38px;
    border-radius: 8px;
    object-fit: contain;
    transition: background 0.2s, box-shadow 0.2s;
  }
}

.nx-nav:not(.is-scrolled) .nx-nav__brand img {
  background: #fff;
  box-shadow:
    0 0 0 4px #fff,
    0 4px 14px rgb(0 0 0 / 20%);
}

.nx-nav__links {
  display: flex;
  gap: 28px;
  align-items: center;

  a {
    font-size: 14px;
    font-weight: 500;
    color: inherit;
    text-decoration: none;
    opacity: 0.78;
    transition: opacity 0.15s;

    &:hover { opacity: 1; }
  }
}

.nx-nav__right {
  display: flex;
  gap: 8px;
  align-items: center;
}

.nx-nav__user {
  display: inline-flex;
  gap: 8px;
  align-items: center;
  padding: 4px 12px 4px 4px;
  font: inherit;
  font-size: 14px;
  font-weight: 500;
  color: inherit;
  cursor: pointer;
  background: transparent;
  border: 1px solid rgb(255 255 255 / 20%);
  border-radius: 999px;
  transition: background 0.15s, border-color 0.15s;

  &:hover { background: rgb(255 255 255 / 10%); }
}

.nx-nav.is-scrolled .nx-nav__user {
  border-color: var(--nx-border);

  &:hover { background: var(--nx-bg-gray); }
}

/* =========================================================
   BUTTONS
   ========================================================= */
.nx-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  height: 32px;
  padding: 0 14px;
  font: inherit;
  font-size: 14px;
  font-weight: 500;
  color: var(--nx-text);
  white-space: nowrap;
  cursor: pointer;
  background: transparent;
  border: 1px solid transparent;
  border-radius: var(--nx-radius-sm);
  transition: background 0.15s, color 0.15s, border-color 0.15s;

  &--primary {
    color: #fff;
    background: var(--nx-blue);

    &:hover { background: var(--nx-blue-hover); }
  }

  &--ghost {
    color: inherit;
    background: transparent;
    border-color: currentcolor;
    opacity: 0.85;

    &:hover { opacity: 1; background: rgb(255 255 255 / 8%); }
  }

  /* on light bg ghost looks correct via opacity + outline */
  .nx-cta &--ghost,
  .nx-section &--ghost {
    color: var(--nx-text);
    background: transparent;
    border-color: var(--nx-border-strong);
    opacity: 1;

    &:hover { background: var(--nx-bg-gray); }
  }

  &--lg {
    height: 44px;
    padding: 0 22px;
    font-size: 15px;
    border-radius: 8px;
  }
}

.nx-link {
  height: 32px;
  padding: 0 10px;
  font: inherit;
  font-size: 14px;
  color: inherit;
  cursor: pointer;
  background: transparent;
  border: 0;
  border-radius: var(--nx-radius-xs);
  transition: background 0.15s;

  &:hover { background: rgb(255 255 255 / 10%); }
}

.nx-nav.is-scrolled .nx-link:hover { background: var(--nx-bg-gray); }

/* round black arrow button — Notion's signature card CTA */
.nx-arrow {
  display: inline-grid;
  flex-shrink: 0;
  place-items: center;
  width: 40px;
  height: 40px;
  padding: 0;
  font: inherit;
  font-size: 16px;
  color: #fff;
  cursor: pointer;
  background: var(--nx-text);
  border: 0;
  border-radius: 50%;
  transition: background 0.15s, transform 0.15s;

  &:hover {
    background: #000;
    transform: scale(1.04);
  }

  &--sm {
    width: 32px;
    height: 32px;
    font-size: 14px;
  }
}

/* =========================================================
   HERO  (dark navy, Notion-style)
   ========================================================= */
.nx-hero {
  --hero-bg: rgb(2 9 58);
  --hero-fg: rgb(246 245 244);
  --hero-fg-muted: rgb(246 245 244 / 70%);
  --hero-doodle: rgb(132 156 255 / 28%);

  position: relative;
  padding: 132px 32px 80px;
  overflow: hidden;
  color: var(--hero-fg);
  background: var(--hero-bg);
}

.nx-doodle {
  position: absolute;
  top: 60px;
  z-index: 1;
  width: 600px;
  height: 600px;
  color: var(--hero-doodle);
  pointer-events: none;

  &--left { left: -120px; }
  &--right { right: -120px; }
}

.nx-hero__inner {
  position: relative;
  z-index: 2;
  max-width: 920px;
  margin: 0 auto;
  text-align: center;
}

.nx-hero__title {
  margin: 0;
  font-size: clamp(40px, 5.4vw, 64px);
  font-weight: 700;
  line-height: 1.05;
  letter-spacing: -0.033em;
  color: var(--hero-fg);
}

.nx-hero__sub {
  max-width: 580px;
  margin: 20px auto 0;
  font-size: 17px;
  line-height: 1.5;
  color: var(--hero-fg-muted);
}

.nx-hero__cta {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  justify-content: center;
  margin-top: 28px;
}

/* Capability pills under CTA */
.nx-pills {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  justify-content: center;
  max-width: 760px;
  padding: 0;
  margin: 28px auto 0;
  list-style: none;

  li {
    padding: 5px 12px;
    font-size: 12.5px;
    font-weight: 500;
    color: var(--hero-fg-muted);
    background: rgb(255 255 255 / 6%);
    border: 1px solid rgb(255 255 255 / 12%);
    border-radius: 999px;
    transition: color 0.15s, background 0.15s, border-color 0.15s;

    &:hover {
      color: var(--hero-fg);
      background: rgb(255 255 255 / 12%);
      border-color: rgb(255 255 255 / 24%);
    }
  }
}

/* Product window */
.nx-hero__product {
  position: relative;
  z-index: 2;
  max-width: var(--nx-container-wide);
  padding: 0 32px;
  margin: 56px auto 0;
}

/* =========================================================
   SATELLITE PREVIEW CARDS (around hero product window)
   ========================================================= */
.nx-sat {
  position: absolute;
  z-index: 3;
  width: 240px;
  padding: 14px;
  background: #fff;
  border: 1px solid var(--nx-border);
  border-radius: 14px;
  box-shadow:
    0 1px 2px rgb(0 0 0 / 4%),
    0 12px 30px rgb(0 0 0 / 8%);

  header {
    display: flex;
    gap: 6px;
    align-items: center;
    margin-bottom: 10px;
    font-size: 12px;
    font-weight: 600;
    color: var(--nx-text-muted);
  }

  p {
    margin: 8px 0 0;
    font-size: 12.5px;
    line-height: 1.45;
    color: var(--nx-text);
  }

  &--tl { top: -28px; left: -16px; width: 320px; transform: rotate(-2deg); }
  &--tr { top: -28px; right: -16px; transform: rotate(2deg); }
  &--bl { bottom: -32px; left: 12px; transform: rotate(-1.5deg); }
  &--br { bottom: -32px; right: 12px; width: 260px; transform: rotate(1.5deg); }
}

.nx-sat__dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
}

.nx-sat__media {
  position: relative;
  display: grid;
  grid-template-columns: minmax(0, 1fr) 124px;
  gap: 10px;
  align-items: stretch;
}

.nx-sat__video {
  display: block;
  width: 100%;
  height: 150px;
  object-fit: cover;
  background: #11132a;
  border-radius: 12px;
}

.nx-sat__chip {
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 10px;
  background: linear-gradient(160deg, rgb(123 97 255 / 12%), rgb(74 144 226 / 10%));
  border: 1px solid rgb(123 97 255 / 25%);
  border-radius: 12px;

  strong {
    font-size: 11.5px;
    font-weight: 700;
    color: var(--nx-text);
    line-height: 1.3;
  }
}

.nx-sat__chipLabel {
  font-size: 10px;
  font-weight: 600;
  color: var(--nx-text-muted);
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.nx-sat__chipMeta {
  display: inline-flex;
  gap: 6px;
  align-items: center;
  margin-top: auto;
  font-size: 10.5px;
  color: var(--nx-text-muted);
}

.nx-pulse-sm {
  width: 6px;
  height: 6px;
  background: #26ce83;
  border-radius: 50%;
  box-shadow: 0 0 0 0 rgb(38 206 131 / 60%);
  animation: nx-pulse-sm 1.6s ease-out infinite;
}

@keyframes nx-pulse-sm {
  0% { box-shadow: 0 0 0 0 rgb(38 206 131 / 60%); }
  100% { box-shadow: 0 0 0 8px rgb(38 206 131 / 0%); }
}

.nx-sat__wave--chip {
  height: 14px;
  margin-top: 2px;

  span {
    width: 2px;
    background: linear-gradient(180deg, #7B61FF, #4A90E2);
  }
}

.nx-sat__avatar {
  position: relative;
  display: grid;
  place-items: center;
  width: 44px;
  height: 44px;
  font-size: 16px;
  font-weight: 700;
  color: #fff;
  background: linear-gradient(135deg, #7B61FF, #4A90E2);
  border-radius: 50%;

  .nx-pulse {
    position: absolute;
    inset: -3px;
    border: 2px solid rgb(123 97 255 / 50%);
    border-radius: 50%;
    animation: nx-pulse 1.8s ease-out infinite;
  }
}

@keyframes nx-pulse {
  0% { transform: scale(0.9); opacity: 1; }
  100% { transform: scale(1.35); opacity: 0; }
}

.nx-sat__wave {
  display: flex;
  gap: 3px;
  align-items: flex-end;
  height: 22px;
  margin-top: 10px;

  span {
    width: 3px;
    height: 30%;
    background: linear-gradient(180deg, #7B61FF, #4A90E2);
    border-radius: 2px;
    animation: nx-wave 1.2s ease-in-out infinite;
  }
}

@keyframes nx-wave {
  0%, 100% { height: 30%; }
  50% { height: 100%; }
}

/* AI chat bubbles */
.nx-bubble {
  max-width: 92%;
  padding: 8px 10px;
  margin-bottom: 6px;
  font-size: 12.5px;
  line-height: 1.45;
  border-radius: 10px;

  &--in {
    color: var(--nx-text);
    background: var(--nx-bg-gray);
    border-bottom-left-radius: 4px;
  }

  &--out {
    margin-left: auto;
    color: #fff;
    background: var(--nx-blue);
    border-bottom-right-radius: 4px;
  }
}

.nx-typing {
  display: inline-flex;
  gap: 3px;
  margin-left: 4px;
  vertical-align: middle;

  i {
    width: 4px;
    height: 4px;
    background: rgb(255 255 255 / 75%);
    border-radius: 50%;
    animation: nx-typing 1.2s ease-in-out infinite;
  }

  i:nth-child(2) { animation-delay: 0.15s; }
  i:nth-child(3) { animation-delay: 0.3s; }
}

@keyframes nx-typing {
  0%, 80%, 100% { transform: translateY(0); opacity: 0.4; }
  40% { transform: translateY(-3px); opacity: 1; }
}

/* AI PPT slides */
.nx-slides {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 6px;
}

.nx-slide {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 8px;
  background: rgb(255 181 71 / 12%);
  border: 1px solid rgb(255 181 71 / 25%);
  border-radius: 6px;
  aspect-ratio: 4 / 3;

  strong {
    font-size: 10px;
    font-weight: 600;
    color: var(--nx-text);
  }

  span {
    height: 3px;
    background: rgb(0 0 0 / 12%);
    border-radius: 2px;

    &.w70 { width: 70%; }
    &.w50 { width: 50%; }
  }

  &--alt {
    background: rgb(74 144 226 / 12%);
    border-color: rgb(74 144 226 / 25%);
  }
}

/* OJ code panel */
.nx-code {
  padding: 8px 10px;
  margin: 0;
  font-family:
    "JetBrains Mono", "SF Mono", Menlo, Consolas, "Liberation Mono", monospace;
  font-size: 11.5px;
  line-height: 1.5;
  color: rgb(0 0 0 / 80%);
  white-space: pre-wrap;
  background: rgb(74 144 226 / 8%);
  border-radius: 6px;

  .k { color: #c41a16; font-weight: 600; }
  .f { color: #0e8a16; font-weight: 600; }
}

.nx-cases {
  display: grid;
  gap: 4px;
  padding: 0;
  margin: 8px 0 0;
  list-style: none;

  li {
    display: flex;
    gap: 6px;
    align-items: center;
    font-size: 11.5px;
    color: var(--nx-text-muted);
  }
}

.nx-ok {
  display: inline-grid;
  place-items: center;
  width: 12px;
  height: 12px;
  background: #26ce83;
  border-radius: 50%;
  position: relative;

  &::after {
    content: "";
    width: 6px;
    height: 3px;
    border-left: 1.5px solid #fff;
    border-bottom: 1.5px solid #fff;
    transform: rotate(-45deg) translate(1px, -1px);
  }
}

.nx-window {
  overflow: hidden;
  background: #fff;
  border: 1px solid var(--nx-border);
  border-radius: var(--nx-radius);
  box-shadow:
    0 1px 2px rgb(0 0 0 / 4%),
    0 24px 48px rgb(0 0 0 / 8%);
}

.nx-window__bar {
  display: flex;
  gap: 6px;
  align-items: center;
  height: 32px;
  padding: 0 14px;
  background: var(--nx-bg-gray);
  border-bottom: 1px solid var(--nx-border);

  > span {
    width: 10px;
    height: 10px;
    background: rgb(0 0 0 / 12%);
    border-radius: 50%;
  }
}

.nx-window__body {
  display: grid;
  grid-template-columns: 260px minmax(0, 1fr);
  min-height: 520px;
  background: #fff;
}

.nx-side {
  padding: 14px 8px;
  background: var(--nx-bg-gray);
  border-right: 1px solid var(--nx-border);
}

.nx-side__head {
  display: flex;
  gap: 8px;
  align-items: center;
  padding: 6px 10px 14px;
  font-size: 14px;
  font-weight: 600;

  img {
    width: 20px;
    height: 20px;
    border-radius: 4px;
  }
}

.nx-side__group {
  padding: 16px 10px 6px;
  font-size: 12px;
  font-weight: 500;
  color: var(--nx-text-faint);
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.nx-side__item {
  display: flex;
  gap: 8px;
  align-items: center;
  width: 100%;
  padding: 6px 10px;
  font: inherit;
  font-size: 14px;
  font-weight: 500;
  color: var(--nx-text);
  text-align: left;
  cursor: pointer;
  background: transparent;
  border: 0;
  border-radius: 4px;
  opacity: 0.78;
  transition: background 0.15s, opacity 0.15s;

  svg {
    width: 16px;
    height: 16px;
  }

  &:hover {
    background: rgb(0 0 0 / 4%);
    opacity: 1;
  }

  &.is-active {
    background: rgb(0 0 0 / 6%);
    opacity: 1;
  }
}

.nx-doc {
  min-width: 0;
  padding: 40px 56px;
  overflow: hidden;
}

.nx-doc__crumbs {
  display: flex;
  gap: 6px;
  font-size: 13px;
  color: var(--nx-text-faint);

  span:nth-child(odd) {
    color: var(--nx-text-muted);
  }
}

.nx-doc__title {
  margin: 14px 0 12px;
  font-size: 36px;
  font-weight: 700;
  line-height: 1.15;
  letter-spacing: -0.024em;
  color: var(--nx-text);
}

.nx-doc__lede {
  max-width: 540px;
  margin: 0 0 24px;
  font-size: 14px;
  line-height: 1.55;
  color: var(--nx-text-muted);
}

.nx-doc__props {
  display: flex;
  gap: 0;
  padding: 14px 0;
  margin: 0 0 22px;
  border-top: 1px solid var(--nx-border);
  border-bottom: 1px solid var(--nx-border);

  > div {
    flex: 1;

    span {
      display: block;
      font-size: 12px;
      color: var(--nx-text-faint);
    }

    strong {
      display: block;
      margin-top: 4px;
      font-size: 14px;
      font-weight: 600;
      color: var(--nx-text);
    }
  }
}

.nx-doc__list {
  display: grid;
  gap: 6px;
  padding: 0;
  margin: 0;
  list-style: none;

  li {
    display: flex;
    gap: 10px;
    align-items: center;
    padding: 6px 8px;
    font-size: 14px;
    color: var(--nx-text);
    border-radius: 4px;
    transition: background 0.15s;

    &:hover { background: rgb(0 0 0 / 3%); }
  }
}

.nx-check {
  display: inline-block;
  flex-shrink: 0;
  width: 14px;
  height: 14px;
  background: #fff;
  border: 1.5px solid var(--nx-border-strong);
  border-radius: 3px;
  position: relative;

  &::after {
    position: absolute;
    inset: 0;
    content: "";
    background: var(--nx-blue);
    border-radius: 2px;
    transform: scale(0.45);
  }
}

.nx-fade-enter-active,
.nx-fade-leave-active {
  transition: opacity 0.25s ease, transform 0.25s ease;
}

.nx-fade-enter-from { opacity: 0; transform: translateY(6px); }
.nx-fade-leave-to { opacity: 0; transform: translateY(-4px); }

/* =========================================================
   LOGO STRIP
   ========================================================= */
.nx-strip {
  max-width: var(--nx-container);
  padding: 56px 32px 64px;
  margin: 0 auto;
  text-align: center;
}

.nx-strip__lead {
  margin: 0 0 18px;
  font-size: 13px;
  font-weight: 500;
  color: var(--nx-text-faint);
  text-transform: uppercase;
  letter-spacing: 0.06em;
}

.nx-strip__items {
  display: flex;
  flex-wrap: wrap;
  gap: 56px;
  align-items: center;
  justify-content: center;

  span {
    font-size: 16px;
    font-weight: 600;
    color: var(--nx-text-muted);
    opacity: 0.7;
  }
}

/* =========================================================
   SECTION shared
   ========================================================= */
.nx-section {
  padding: 96px 32px;
  background: var(--nx-bg);

  &--gray { background: var(--nx-bg-gray); }
}

.nx-section--features {
  padding-inline: clamp(32px, 3.6vw, 72px);
}

.nx-shead {
  max-width: var(--nx-container);
  margin: 0 auto 40px;

  &--center {
    text-align: center;
  }
}.nx-eyebrow {
  margin: 0;
  font-size: 14px;
  font-weight: 500;
  color: var(--nx-text-muted);
}

.nx-stitle {
  max-width: 720px;
  margin: 8px 0 0;
  font-size: clamp(32px, 4vw, 42px);
  font-weight: 700;
  line-height: 1.14;
  letter-spacing: -0.024em;
  color: var(--nx-text);
}

.nx-shead--center .nx-stitle { margin-left: auto; margin-right: auto; }

.nx-ssub {
  max-width: 560px;
  margin: 14px auto 0;
  font-size: 16px;
  line-height: 1.55;
  color: var(--nx-text-muted);
}

/* =========================================================
   BENTO
   ========================================================= */
.nx-bento {
  --bento-color: rgb(246 245 244);

  display: flex;
  flex-direction: column;
  max-width: var(--nx-container);
  margin: 0 auto 20px;
  overflow: hidden;
  background: #fff;
  border: 1px solid var(--nx-border);
  border-radius: var(--nx-radius);
  transition: box-shadow 0.2s;

  &:hover {
    box-shadow:
      0 1px 2px rgb(0 0 0 / 4%),
      0 6px 20px rgb(0 0 0 / 6%);
  }

  &--wide {
    flex-direction: row;
    align-items: stretch;
    min-height: 320px;

    > .nx-bento__head {
      flex: 0 0 36%;
      padding: 32px 32px 28px;
    }

    > .nx-bento__media {
      flex: 1;
    }
  }

  &--sm {
    padding: 28px;

    .nx-bento__head { padding: 0; }
  }
}

.nx-bento__head {
  display: flex;
  gap: 20px;
  align-items: flex-start;
  justify-content: space-between;
  padding: 28px 28px 24px;
}

.nx-bento__eyebrow {
  margin: 0 0 8px;
  font-size: 14px;
  font-weight: 500;
  color: var(--nx-text-muted);
}

.nx-bento__title {
  margin: 0;
  font-size: 22px;
  font-weight: 700;
  line-height: 1.25;
  letter-spacing: -0.018em;
  color: var(--nx-text);
}

.nx-bento--wide .nx-bento__title { font-size: 28px; }

.nx-bento__copy {
  margin: 14px 0 0;
  font-size: 14px;
  line-height: 1.55;
  color: var(--nx-text-muted);
}

.nx-bento__media {
  display: flex;
  align-items: stretch;
  padding: 0 0 0 28px;
  background: var(--bento-color);
}

.nx-bento--wide .nx-bento__media {
  padding: 24px 0 0 24px;
}

.nx-bento:not(.nx-bento--wide) .nx-bento__media {
  margin: 0 28px 28px;
  border-radius: 10px;
  overflow: hidden;
  padding: 24px 0 0 24px;
}

.nx-bento__inset {
  flex: 1;
  overflow: hidden;
  background: #fff;
  border-radius: 8px 0 0;
  box-shadow: 0 -2px 8px rgb(0 0 0 / 6%);

  img {
    display: block;
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  &--lg {
    background: var(--bento-color, rgb(246 245 244));
    display: flex;
    padding: 28px 0 0 28px;
    border-radius: var(--nx-radius);
    box-shadow: none;
  }

  &--carousel {
    padding: 0;
    background: transparent;
    box-shadow: none;
  }
}

.nx-bento__inset--lg .nx-mockdoc {
  flex: 1;
  padding: 24px 28px;
  background: #fff;
  border-radius: 8px 0 0;
  box-shadow: 0 -2px 10px rgb(0 0 0 / 8%);

  h4 {
    margin: 0 0 12px;
    font-size: 18px;
    font-weight: 700;
    letter-spacing: -0.012em;
  }

  ul {
    display: grid;
    gap: 6px;
    padding: 0;
    margin: 0;
    list-style: none;

    li {
      display: flex;
      gap: 10px;
      align-items: center;
      font-size: 13px;
      color: var(--nx-text);
    }
  }
}

.nx-bento__grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 20px;
  max-width: var(--nx-container);
  margin: 0 auto 20px;

  .nx-bento { margin: 0; }

  &--3 {
    grid-template-columns: repeat(3, minmax(0, 1fr));
    margin-top: 0;
  }
}

.nx-section--features {
  .nx-shead,
  .nx-bento,
  .nx-bento__grid {
    max-width: min(1760px, 100%);
  }
}

/* =========================================================
   TABBED PANEL (agents section)
   ========================================================= */
.nx-tabbar {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  justify-content: center;
  max-width: var(--nx-container);
  margin: 0 auto 28px;
}

.nx-tabbar__btn {
  height: 36px;
  padding: 0 16px;
  font: inherit;
  font-size: 14px;
  font-weight: 500;
  color: var(--nx-text-muted);
  cursor: pointer;
  background: transparent;
  border: 1px solid transparent;
  border-radius: 999px;
  transition: background 0.15s, color 0.15s, border-color 0.15s;

  &:hover { color: var(--nx-text); background: #fff; }

  &.is-active {
    color: var(--nx-text);
    background: #fff;
    border-color: var(--nx-border-strong);
  }
}

.nx-tabpanel {
  max-width: var(--nx-container);
  margin: 0 auto;
}

.nx-tabpanel__inner {
  display: grid;
  grid-template-columns: minmax(0, 0.85fr) minmax(0, 1.15fr);
  gap: 48px;
  align-items: center;
}

.nx-tabpanel__copy {
  h3 {
    margin: 0 0 14px;
    font-size: 28px;
    font-weight: 700;
    line-height: 1.18;
    letter-spacing: -0.02em;
  }

  > p {
    margin: 0 0 22px;
    font-size: 16px;
    line-height: 1.55;
    color: var(--nx-text-muted);
  }

  ul {
    display: grid;
    gap: 8px;
    padding: 0;
    margin: 0;
    list-style: none;

    li {
      display: flex;
      gap: 10px;
      align-items: center;
      font-size: 14px;
      color: var(--nx-text);
    }
  }
}

.nx-tabpanel__media .nx-bento__inset--lg {
  min-height: 320px;
}

/* =========================================================
   WORKFLOW STEPS
   ========================================================= */
.nx-steps {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 0;
  max-width: var(--nx-container);
  padding: 0;
  margin: 0 auto;
  list-style: none;

  li {
    position: relative;
    padding: 0 28px;
  }

  li + li::before {
    position: absolute;
    top: 0;
    bottom: 0;
    left: 0;
    width: 1px;
    content: "";
    background: var(--nx-border);
  }

  h4 {
    margin: 16px 0 8px;
    font-size: 20px;
    font-weight: 700;
    letter-spacing: -0.014em;
  }

  p {
    margin: 0;
    font-size: 14px;
    line-height: 1.55;
    color: var(--nx-text-muted);
  }
}

.nx-steps__num {
  font-size: 13px;
  font-weight: 600;
  color: var(--nx-text-faint);
  letter-spacing: 0.04em;
}

/* =========================================================
   TESTIMONIAL QUOTES
   ========================================================= */
.nx-quotes {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 20px;
  max-width: var(--nx-container);
  margin: 0 auto;
}

.nx-quote {
  padding: 28px;
  background: #fff;
  border: 1px solid var(--nx-border);
  border-radius: var(--nx-radius);
}

.nx-quote__brand {
  margin: 0 0 16px;
  font-size: 14px;
  font-weight: 600;
  color: var(--nx-text-muted);
}

.nx-quote__body {
  margin: 0 0 22px;
  font-size: 17px;
  line-height: 1.5;
  color: var(--nx-text);
}

.nx-quote__more {
  display: inline-block;
  margin-left: 4px;
  color: var(--nx-text-muted);
}

.nx-quote__who {
  strong {
    display: block;
    font-size: 14px;
    font-weight: 600;
  }

  small {
    display: block;
    margin-top: 2px;
    font-size: 13px;
    color: var(--nx-text-muted);
  }
}

.nx-stats {
  display: flex;
  flex-wrap: wrap;
  gap: 32px;
  align-items: center;
  justify-content: center;
  max-width: var(--nx-container);
  padding: 28px 28px 0;
  margin: 28px auto 0;
  list-style: none;
  border-top: 1px solid var(--nx-border);

  li {
    display: inline-flex;
    gap: 6px;
    align-items: baseline;
  }

  strong {
    font-size: 15px;
    font-weight: 600;
    color: var(--nx-text);
  }

  span {
    font-size: 14px;
    color: var(--nx-text-muted);
  }
}

/* =========================================================
   CTA
   ========================================================= */
.nx-cta {
  padding: 110px 32px 130px;
  background: var(--nx-bg);
}

.nx-cta__inner {
  max-width: 720px;
  margin: 0 auto;
  text-align: center;

  h2 {
    margin: 0;
    font-size: clamp(34px, 4.5vw, 48px);
    font-weight: 700;
    line-height: 1.1;
    letter-spacing: -0.026em;
  }

  > p {
    margin: 18px auto 0;
    font-size: 17px;
    line-height: 1.5;
    color: var(--nx-text-muted);
  }
}

.nx-cta__btns {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  justify-content: center;
  margin-top: 28px;
}

/* =========================================================
   FOOTER
   ========================================================= */
.nx-foot {
  padding: 40px 32px;
  background: var(--nx-bg-gray);
  border-top: 1px solid var(--nx-border);
}

.nx-foot__inner {
  display: flex;
  gap: 24px;
  align-items: center;
  justify-content: space-between;
  max-width: var(--nx-container);
  margin: 0 auto;
}

.nx-foot__brand {
  display: flex;
  gap: 12px;
  align-items: center;

  img { width: 32px; height: 32px; }

  strong {
    display: block;
    font-size: 13px;
    font-weight: 600;
  }

  p {
    margin: 4px 0 0;
    font-size: 12px;
    color: var(--nx-text-muted);
  }
}

.nx-foot__legal {
  margin: 0;
  font-size: 12px;
  color: var(--nx-text-muted);
  text-align: right;
}

/* =========================================================
   RESPONSIVE
   ========================================================= */
@media (width <= 1024px) {
  .nx-sat { display: none; }

  .nx-bento--wide {
    flex-direction: column;

    > .nx-bento__head { flex: none; }
  }

  .nx-bento__grid,
  .nx-bento__grid--3 {
    grid-template-columns: 1fr;
  }

  .nx-tabpanel__inner {
    grid-template-columns: 1fr;
    gap: 28px;
  }

  .nx-steps { grid-template-columns: repeat(2, 1fr); row-gap: 28px; }
  .nx-steps li:nth-child(3)::before { display: none; }

  .nx-quotes { grid-template-columns: 1fr; }
}

@media (width <= 680px) {
  .nx-nav__inner { padding: 0 16px; }
  .nx-nav__links { display: none; }

  .nx-hero { padding: 100px 16px 56px; }
  .nx-hero__product { padding: 0 16px; margin-top: 36px; }

  .nx-window__body { grid-template-columns: 1fr; min-height: 0; }

  .nx-side {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 4px;
    padding: 10px;
    border-right: 0;
    border-bottom: 1px solid var(--nx-border);
  }

  .nx-side__head, .nx-side__group { display: none; }

  .nx-side__item {
    flex-direction: column;
    gap: 4px;
    padding: 8px 6px;
    font-size: 12px;
    text-align: center;
  }

  .nx-doc { padding: 24px 20px; }
  .nx-doc__title { font-size: 24px; }

  .nx-strip__items { gap: 24px; }

  .nx-section { padding: 64px 16px; }
  .nx-cta { padding: 72px 16px 88px; }

  .nx-bento__head { padding: 22px 22px 18px; }
  .nx-bento__title { font-size: 19px; }

  .nx-steps { grid-template-columns: 1fr; }
  .nx-steps li + li::before { display: none; }
  .nx-steps li { padding: 0; }
  .nx-steps li + li { padding-top: 22px; margin-top: 22px; border-top: 1px solid var(--nx-border); }

  .nx-foot__inner { flex-direction: column; align-items: flex-start; gap: 16px; }
  .nx-foot__legal { text-align: left; }
}
</style>
