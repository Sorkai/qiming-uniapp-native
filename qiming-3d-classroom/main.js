import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { VRM, VRMLoaderPlugin, VRMUtils } from "@pixiv/three-vrm";
import { EffectComposer } from "three/addons/postprocessing/EffectComposer.js";
import { RenderPass } from "three/addons/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/addons/postprocessing/UnrealBloomPass.js";
import { OutputPass } from "three/addons/postprocessing/OutputPass.js";
import { SMAAPass } from "three/addons/postprocessing/SMAAPass.js";
import { SAOPass } from "three/addons/postprocessing/SAOPass.js";
import { createClassroom } from "./classroom.js";

// --- 1.基础场景初始化 ---

const scene = new THREE.Scene();

// 加载环境纹理
const textureLoader = new THREE.TextureLoader();
const envTexture = textureLoader.load(
  "/textures/FullskiesSunset0001_1_L.jpg",
  tex => {
    tex.mapping = THREE.EquirectangularReflectionMapping;
    tex.colorSpace = THREE.SRGBColorSpace;
    scene.background = tex;
    scene.environment = tex;
    scene.backgroundBlurriness = 0.05; // 轻微模糊背景突出主体
  }
);

const camera = new THREE.PerspectiveCamera(
  65, // 增大 FOV 从 45 到 65，获得更宽广的视野
  window.innerWidth / window.innerHeight,
  0.1,
  100.0
);
// 设置初始视角在教室内，看向 Z=0 墙面的黑板
camera.position.set(0, 1.15, -4.9);

const renderer = new THREE.WebGLRenderer({
  antialias: false,
  alpha: true,
  powerPreference: "high-performance"
});
renderer.setSize(window.innerWidth, window.innerHeight);
// 极致优化：统一像素比为 1.0，大幅减轻 GPU 填充率压力
renderer.setPixelRatio(1.0);
renderer.outputColorSpace = THREE.SRGBColorSpace;
// 彻底关闭实时阴影，改为依靠光照颜色区分明暗，这是降低 GPU 占用最有效的手段
renderer.shadowMap.enabled = false;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.0;
document.body.appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);
// 目标看向黑板方向 (Z=-10)
controls.target.set(0, 1.15, -10);
// 允许缩放，禁止平移和旋转（旋转由锁控制）
controls.enableZoom = true; // 允许滚轮缩放
controls.minDistance = 0.1; // 最小缩放距离
controls.maxDistance = 10.0; // 最大缩放距离
controls.enablePan = false;
controls.enableRotate = false; // 初始锁定状态
controls.rotateSpeed = 0.5;
controls.update();

// 锁定的相机坐标 (站在第二排课桌椅处观察教室)
const fixedCameraPos = new THREE.Vector3(0, 1.2, -4.4);
let isLocked = true; // 视角锁定状态

// 灯光设置
const ambientLight = new THREE.AmbientLight(0xffffff, 0.4); // 提高环境光强度以补偿移除的点光源
scene.add(ambientLight);

const hemiLight = new THREE.HemisphereLight(0xffffff, 0x444444, 0.8); // 提高半球光模拟天空散射
hemiLight.position.set(0, 20, 0);
scene.add(hemiLight);

// 窗户侧补光（模拟窗外散射光，增加真实室内光照层次）
const fillLight = new THREE.DirectionalLight(0xfff0dd, 0.4);
fillLight.position.set(-8, 6, -5);
fillLight.castShadow = false; // 补光不投射阴影
scene.add(fillLight);

// 极致优化：移除了教室内所有点光源 (PointLight) 和点光源补光。
// 它们对 GPU 负载贡献很大。

const directionalLight = new THREE.DirectionalLight(0xffffff, 1.0); // 调整主灯强度
directionalLight.position.set(5, 12, 8);
directionalLight.castShadow = false; // 彻底关闭阴影计算
scene.add(directionalLight);

// --- 创建教室背景 ---
createClassroom(scene);

// --- 2. VRM 加载逻辑 ---

let teacherVRM = null;
const studentVRMs = [];
const loader = new GLTFLoader();

// 注册 VRM 插件
loader.register(parser => {
  return new VRMLoaderPlugin(parser);
});

/**
 * 设置基础姿势（使人物双臂下垂，不再是 T-Pose）
 * 根据 VRM 版本自动适配旋转方向
 * @param {VRM} vrm
 */
function setBasePose(vrm) {
  if (!vrm || !vrm.humanoid) return;

  const isV0 = vrm.meta?.metaVersion === "0";
  const sign = isV0 ? 1 : -1;

  const leftUpperArm = vrm.humanoid.getNormalizedBoneNode("leftUpperArm");
  const rightUpperArm = vrm.humanoid.getNormalizedBoneNode("rightUpperArm");

  if (leftUpperArm) {
    leftUpperArm.rotation.z = sign * 1.3;
  }
  if (rightUpperArm) {
    rightUpperArm.rotation.z = sign * -1.3;
  }

  const leftLowerArm = vrm.humanoid.getNormalizedBoneNode("leftLowerArm");
  const rightLowerArm = vrm.humanoid.getNormalizedBoneNode("rightLowerArm");
  if (leftLowerArm) leftLowerArm.rotation.z = sign * 0.2;
  if (rightLowerArm) rightLowerArm.rotation.z = sign * -0.2;
}

/**
 * 设置坐姿（使人物坐在椅子上，双腿弯曲，双臂放在桌上）
 * @param {VRM} vrm
 * @param {number} armAngle 上臂前抬角度，值越大胳膊抬得越高
 */
function setSittingPose(vrm, armAngle = 1.2) {
  if (!vrm || !vrm.humanoid) return;

  const isV0 = vrm.meta?.metaVersion === "0";
  const sign = isV0 ? 1 : -1;

  // 1. 重置重心 (不再使用hips偏移，完全靠外部 position.y 控制)
  const hips = vrm.humanoid.getNormalizedBoneNode("hips");
  if (hips) {
    hips.position.y = 0;
  }

  // 2. 大腿抬起（与躯干成 90 度左右）
  const leftUpperLeg = vrm.humanoid.getNormalizedBoneNode("leftUpperLeg");
  const rightUpperLeg = vrm.humanoid.getNormalizedBoneNode("rightUpperLeg");
  if (leftUpperLeg) leftUpperLeg.rotation.x = sign * 1.25;
  if (rightUpperLeg) rightUpperLeg.rotation.x = sign * 1.25;

  // 3. 小腿放下（垂直地面）
  const leftLowerLeg = vrm.humanoid.getNormalizedBoneNode("leftLowerLeg");
  const rightLowerLeg = vrm.humanoid.getNormalizedBoneNode("rightLowerLeg");
  if (leftLowerLeg) leftLowerLeg.rotation.x = sign * -1.45;
  if (rightLowerLeg) rightLowerLeg.rotation.x = sign * -1.45;

  // 4. 手臂放在课桌上
  const leftUpperArm = vrm.humanoid.getNormalizedBoneNode("leftUpperArm");
  const rightUpperArm = vrm.humanoid.getNormalizedBoneNode("rightUpperArm");
  if (leftUpperArm) {
    leftUpperArm.rotation.z = sign * 1.0;
    leftUpperArm.rotation.x = sign * armAngle;
  }
  if (rightUpperArm) {
    rightUpperArm.rotation.z = sign * -1.0;
    rightUpperArm.rotation.x = sign * armAngle;
  }

  const leftLowerArm = vrm.humanoid.getNormalizedBoneNode("leftLowerArm");
  const rightLowerArm = vrm.humanoid.getNormalizedBoneNode("rightLowerArm");
  if (leftLowerArm) leftLowerArm.rotation.y = sign * -0.3;
  if (rightLowerArm) rightLowerArm.rotation.y = sign * 0.3;
}

/**
 * 通用加载 VRM 模型的函数
 * @param {string} url 模型路径
 * @param {THREE.Vector3} pos 位置
 * @param {number} rotationY 旋转
 * @param {boolean} isTeacher 是否是老师
 */
function loadVRM(
  url,
  pos = new THREE.Vector3(0, 0.15, -9.0),
  rotationY = 0,
  isTeacher = true
) {
  console.log("正在加载模型:", url, isTeacher ? "(老师)" : "(学生)");

  if (isTeacher && teacherVRM) {
    scene.remove(teacherVRM.scene);
    VRMUtils.deepDispose(teacherVRM.scene);
    teacherVRM = null;
  }

  loader.load(
    url,
    gltf => {
      const vrm = gltf.userData.vrm;
      if (isTeacher) {
        teacherVRM = vrm;
      } else {
        studentVRMs.push(vrm);
      }
      scene.add(vrm.scene);

      // 针对 VRM 0.x 的旋转修正：将其统一到 1.0 的 Z-forward 朝向
      VRMUtils.rotateVRM0(vrm);

      vrm.scene.position.copy(pos);
      vrm.scene.rotation.y = rotationY;

      // 贴图优化
      vrm.scene.traverse(obj => {
        if (obj.isMesh) {
          const materials = Array.isArray(obj.material)
            ? obj.material
            : [obj.material];
          materials.forEach(mat => {
            if (mat.map) {
              // 极简优化：完全关闭各向异性过滤
              mat.map.anisotropy = 1;
              mat.map.minFilter = THREE.LinearFilter;
              mat.map.magFilter = THREE.LinearFilter;
            }
          });
        }
      });

      if (isTeacher) {
        setBasePose(vrm);
      } else {
        // VRM 1.0 模型需要更大的 armAngle 才能让胳膊看起来和 0.x 一样高
        const isV0 = vrm.meta?.metaVersion === "0";
        setSittingPose(vrm, isV0 ? 1.2 : 1.3);
      }
      console.log("模型加载成功:", url);
    },
    undefined,
    error => console.error("加载出错:", error)
  );
}

// --- 3. UI 交互绑定 ---

// 切换模型（仅切换老师）
const selector = document.getElementById("model-selector");
if (selector) {
  selector.addEventListener("change", event => {
    loadVRM(event.target.value, new THREE.Vector3(0, 0.25, -9.0), 0, true);
  });
}

// 视角恢复功能
const resetBtn = document.getElementById("reset-view-btn");
if (resetBtn) {
  resetBtn.addEventListener("click", () => {
    camera.position.set(0, 1.15, -4.4);
    controls.target.set(0.0, 1.25, -10.0);
    controls.update();
  });
}

// 视角锁切换功能
const lockBtn = document.getElementById("lock-btn");
if (lockBtn) {
  lockBtn.addEventListener("click", () => {
    isLocked = !isLocked;
    lockBtn.classList.toggle("unlocked", !isLocked);

    // 同步控制状态：锁定模式禁止旋转，解锁模式允许 360 度观察
    controls.enableRotate = !isLocked;

    // 切换模式时重置为中心点，防止偏移
    controls.target.set(0, 1.15, -10);
    controls.update();
  });
}

// --- 后期处理设置 ---
// 极致优化：完全关闭后期处理。EffectComposer 和多重渲染 Pass 是极大的 GPU 开销。
// 如果需要基本的色彩校正，直接使用 WebGLRenderer 的 toneMapping。

// 初始默认加载第一个模型 (做老师)
// Math.PI 让老师转身面向学生 (VRM 0.x 经 rotateVRM0 后默认朝 -Z，需要翻转)
loadVRM(
  "/models/AliciaSolid_vrm-0.51.vrm",
  new THREE.Vector3(0, 0.25, -9.0),
  Math.PI,
  true
);

// 在第一排课桌加载三位学生
// 椅子位置：X = -2.5 / 0 / 2.5，Z = -6.0（第一排椅子座面中心），Y = 0.55（屁股对齐椅面 0.42 + 微调）
// VRM 0.x 经 rotateVRM0 后朝 -Z（面向黑板）→ rotationY = 0
// VRM 1.0 默认朝 +Z（背对黑板）→ rotationY = Math.PI 翻转
loadVRM(
  "/models/AliciaSolid_vrm-0.51.vrm",
  new THREE.Vector3(-2.5, 0.55, -6.0),
  0,
  false
);
loadVRM(
  "/models/VRM1_Constraint_Twist_Sample.vrm",
  new THREE.Vector3(0.0, 0.55, -6.0),
  Math.PI,
  false
);
loadVRM(
  "/models/AliciaSolid_vrm-0.51.vrm",
  new THREE.Vector3(2.5, 0.55, -6.0),
  0,
  false
);
// --- 4. 动画渲染循环 ---

const clock = new THREE.Clock();
let lastFrameTime = 0;
const targetFPS = 20; // 极致优化：限制在 20 帧，大幅减少每秒刷新频率，是降低 GPU 并发计算的关键
const frameInterval = 1 / targetFPS;

// 视锥体剔除工具
const frustum = new THREE.Frustum();
const projScreenMatrix = new THREE.Matrix4();

/**
 * 检查模型是否在视野内（手动剔除以节省 CPU）
 */
function isVisible(vrm) {
  if (!vrm || !vrm.scene) return false;
  camera.updateMatrixWorld();
  projScreenMatrix.multiplyMatrices(
    camera.projectionMatrix,
    camera.matrixWorldInverse
  );
  frustum.setFromProjectionMatrix(projScreenMatrix);
  return frustum.intersectsObject(vrm.scene);
}

/**
 * 简单的待机动画逻辑
 */
function applyIdleAnimation(vrm, time) {
  if (!vrm || !vrm.humanoid) return;

  // 呼吸 & 身体微动
  const neck = vrm.humanoid.getNormalizedBoneNode("neck");
  if (neck) neck.rotation.x = Math.sin(time * 0.8) * 0.02 + 0.02;

  const head = vrm.humanoid.getNormalizedBoneNode("head");
  if (head) {
    head.rotation.y = Math.sin(time * 0.4) * 0.1;
    head.rotation.z = Math.sin(time * 0.3) * 0.05;
  }

  const spine = vrm.humanoid.getNormalizedBoneNode("spine");
  if (spine) spine.rotation.z = Math.sin(time * 0.2) * 0.02;
}

function animate() {
  requestAnimationFrame(animate);

  const deltaTime = clock.getDelta();
  const time = clock.elapsedTime;

  // 帧率限制逻辑
  if (time - lastFrameTime < frameInterval) return;
  lastFrameTime = time;

  // --- 视角控制逻辑 ---
  if (!isLocked) {
    // 解锁模式：实现原地 360 度转头 + 滚轮缩放（通过位移模拟）
    controls.update();

    // 获取当前控制器计算出的距离（滚轮会改变这个值）
    const dist = camera.position.distanceTo(controls.target);

    // 计算旋转偏移向量（归一化）
    const offset = new THREE.Vector3()
      .subVectors(camera.position, controls.target)
      .normalize();

    // 始终以固定座点为基准
    camera.position.copy(fixedCameraPos);

    const defaultDist = 5.0;
    const zoomFactor = defaultDist / dist; // 缩放倍数

    // 优化：仅在 FOV 需要变化时才更新投影矩阵，减少 CPU 计算
    const targetFOV = 65 / zoomFactor;
    if (Math.abs(camera.fov - targetFOV) > 0.01) {
      camera.fov = THREE.MathUtils.lerp(camera.fov, targetFOV, 0.1);
      camera.updateProjectionMatrix();
    }

    // 更新目标点锁定旋转
    controls.target.copy(fixedCameraPos).sub(offset.multiplyScalar(dist));
  } else {
    // 锁定模式：重置 FOV 和位置
    if (Math.abs(camera.fov - 65) > 0.01) {
      camera.fov = THREE.MathUtils.lerp(camera.fov, 65, 0.1);
      camera.updateProjectionMatrix();
    }
    camera.position.copy(fixedCameraPos);
    controls.target.set(0, 1.15, -10);
  }
  controls.update();

  // 更新老师动画（仅在视野范围内更新以节省 CPU）
  if (teacherVRM) {
    if (isVisible(teacherVRM)) {
      teacherVRM.scene.visible = true;
      teacherVRM.update(deltaTime);
      applyIdleAnimation(teacherVRM, time);
    } else {
      teacherVRM.scene.visible = false;
    }
  }

  // 更新学生动画（仅在视野范围内更新以节省 CPU）
  studentVRMs.forEach(vrm => {
    if (isVisible(vrm)) {
      vrm.scene.visible = true;
      vrm.update(deltaTime);
      applyIdleAnimation(vrm, time);
    } else {
      vrm.scene.visible = false;
    }
  });

  renderer.render(scene, camera);
}

animate();

// --- 5. 窗口尺寸适配 ---

window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});
