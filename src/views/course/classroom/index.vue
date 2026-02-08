<script setup lang="ts">
import { ref, onMounted, onUnmounted } from "vue";
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

defineOptions({
  name: "Classroom3D"
});

const containerRef = ref<HTMLDivElement>();
const isLocked = ref(true);
const selectedModel = ref("/models/AliciaSolid_vrm-0.51.vrm");

let scene: THREE.Scene;
let camera: THREE.PerspectiveCamera;
let renderer: THREE.WebGLRenderer;
let controls: OrbitControls;
let composer: EffectComposer;
let smaaPass: SMAAPass;
let clock: THREE.Clock;
let animationId: number;

let teacherVRM: VRM | null = null;
const studentVRMs: VRM[] = [];
const loader = new GLTFLoader();

// 锁定的相机坐标
const fixedCameraPos = new THREE.Vector3(0, 1.2, -4.4);

loader.register(parser => {
  return new VRMLoaderPlugin(parser);
});

function setBasePose(vrm: VRM) {
  if (!vrm || !vrm.humanoid) return;
  const isV0 = vrm.meta?.metaVersion === "0";
  const sign = isV0 ? 1 : -1;
  const leftUpperArm = vrm.humanoid.getNormalizedBoneNode("leftUpperArm");
  const rightUpperArm = vrm.humanoid.getNormalizedBoneNode("rightUpperArm");
  if (leftUpperArm) leftUpperArm.rotation.z = sign * 1.3;
  if (rightUpperArm) rightUpperArm.rotation.z = sign * -1.3;
  const leftLowerArm = vrm.humanoid.getNormalizedBoneNode("leftLowerArm");
  const rightLowerArm = vrm.humanoid.getNormalizedBoneNode("rightLowerArm");
  if (leftLowerArm) leftLowerArm.rotation.z = sign * 0.2;
  if (rightLowerArm) rightLowerArm.rotation.z = sign * -0.2;
}

function setSittingPose(vrm: VRM, armAngle = 1.2) {
  if (!vrm || !vrm.humanoid) return;
  const isV0 = vrm.meta?.metaVersion === "0";
  const sign = isV0 ? 1 : -1;
  const hips = vrm.humanoid.getNormalizedBoneNode("hips");
  if (hips) hips.position.y = 0;
  const leftUpperLeg = vrm.humanoid.getNormalizedBoneNode("leftUpperLeg");
  const rightUpperLeg = vrm.humanoid.getNormalizedBoneNode("rightUpperLeg");
  if (leftUpperLeg) leftUpperLeg.rotation.x = sign * 1.25;
  if (rightUpperLeg) rightUpperLeg.rotation.x = sign * 1.25;
  const leftLowerLeg = vrm.humanoid.getNormalizedBoneNode("leftLowerLeg");
  const rightLowerLeg = vrm.humanoid.getNormalizedBoneNode("rightLowerLeg");
  if (leftLowerLeg) leftLowerLeg.rotation.x = sign * -1.45;
  if (rightLowerLeg) rightLowerLeg.rotation.x = sign * -1.45;
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

function loadVRM(
  url: string,
  pos = new THREE.Vector3(0, 0.15, -9.0),
  rotationY = 0,
  isTeacher = true
) {
  if (isTeacher && teacherVRM) {
    scene.remove(teacherVRM.scene);
    VRMUtils.deepDispose(teacherVRM.scene);
    teacherVRM = null;
  }

  loader.load(
    url,
    gltf => {
      const vrm = gltf.userData.vrm as VRM;
      if (isTeacher) {
        teacherVRM = vrm;
      } else {
        studentVRMs.push(vrm);
      }
      scene.add(vrm.scene);
      VRMUtils.rotateVRM0(vrm);
      vrm.scene.position.copy(pos);
      vrm.scene.rotation.y = rotationY;
      vrm.scene.traverse(obj => {
        if ((obj as any).isMesh) {
          const mesh = obj as THREE.Mesh;
          const materials = Array.isArray(mesh.material)
            ? mesh.material
            : [mesh.material];
          materials.forEach(mat => {
            if ((mat as any).map) {
              (mat as any).map.anisotropy =
                renderer.capabilities.getMaxAnisotropy();
              (mat as any).map.minFilter = THREE.LinearMipmapLinearFilter;
            }
          });
        }
      });

      if (isTeacher) {
        setBasePose(vrm);
      } else {
        const isV0 = vrm.meta?.metaVersion === "0";
        setSittingPose(vrm, isV0 ? 1.2 : 1.3);
      }
    },
    undefined,
    error => console.error("加载出错:", error)
  );
}

function applyIdleAnimation(vrm: VRM, time: number) {
  if (!vrm || !vrm.humanoid) return;
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

function initScene() {
  if (!containerRef.value) return;

  scene = new THREE.Scene();
  const textureLoader = new THREE.TextureLoader();
  textureLoader.load("/textures/FullskiesSunset0001_1_L.jpg", tex => {
    tex.mapping = THREE.EquirectangularReflectionMapping;
    tex.colorSpace = THREE.SRGBColorSpace;
    scene.background = tex;
    scene.environment = tex;
    scene.backgroundBlurriness = 0.05;
  });

  const width = containerRef.value.clientWidth;
  const height = containerRef.value.clientHeight;

  camera = new THREE.PerspectiveCamera(65, width / height, 0.1, 100.0);
  camera.position.set(0, 1.15, -4.9);

  renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setSize(width, height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.0;
  containerRef.value.appendChild(renderer.domElement);

  controls = new OrbitControls(camera, renderer.domElement);
  controls.target.set(0, 1.15, -10);
  controls.enableZoom = true;
  controls.minDistance = 0.1;
  controls.maxDistance = 10.0;
  controls.enablePan = false;
  controls.enableRotate = !isLocked.value;
  controls.rotateSpeed = 0.5;
  controls.update();

  const ambientLight = new THREE.AmbientLight(0xffffff, 0.2);
  scene.add(ambientLight);

  const hemiLight = new THREE.HemisphereLight(0xffffff, 0x444444, 0.6);
  hemiLight.position.set(0, 20, 0);
  scene.add(hemiLight);

  const fillLight = new THREE.DirectionalLight(0xfff0dd, 0.3);
  fillLight.position.set(-8, 6, -5);
  scene.add(fillLight);

  const bounceLight = new THREE.PointLight(0xffe8d0, 0.15, 20);
  bounceLight.position.set(0, 0.3, -5);
  scene.add(bounceLight);

  const directionalLight = new THREE.DirectionalLight(0xffffff, 1.2);
  directionalLight.position.set(5, 12, 8);
  directionalLight.castShadow = true;
  directionalLight.shadow.mapSize.set(4096, 4096);
  directionalLight.shadow.camera.left = -15;
  directionalLight.shadow.camera.right = 15;
  directionalLight.shadow.camera.top = 15;
  directionalLight.shadow.camera.bottom = -15;
  directionalLight.shadow.bias = -0.0003;
  directionalLight.shadow.normalBias = 0.02;
  directionalLight.shadow.radius = 3;
  scene.add(directionalLight);

  createClassroom(scene);

  composer = new EffectComposer(renderer);
  const renderPass = new RenderPass(scene, camera);
  composer.addPass(renderPass);

  const saoPass = new SAOPass(scene, camera);
  saoPass.params.output = SAOPass.OUTPUT.Default;
  saoPass.params.saoBias = 1.0;
  saoPass.params.saoIntensity = 0.008;
  saoPass.params.saoScale = 5;
  saoPass.params.saoKernelRadius = 8;
  saoPass.params.saoMinResolution = 0.005;
  composer.addPass(saoPass);

  const bloomPass = new UnrealBloomPass(
    new THREE.Vector2(width, height),
    0.15,
    0.8,
    0.98
  );
  composer.addPass(bloomPass);

  smaaPass = new SMAAPass(
    width * window.devicePixelRatio,
    height * window.devicePixelRatio
  );
  composer.addPass(smaaPass);

  const outputPass = new OutputPass();
  composer.addPass(outputPass);

  loadVRM(
    selectedModel.value,
    new THREE.Vector3(0, 0.25, -9.0),
    Math.PI,
    true
  );
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

  clock = new THREE.Clock();
  animate();
}

function animate() {
  animationId = requestAnimationFrame(animate);

  const deltaTime = clock.getDelta();
  const time = clock.elapsedTime;

  if (!isLocked.value) {
    controls.update();
    const dist = camera.position.distanceTo(controls.target);
    const offset = new THREE.Vector3()
      .subVectors(camera.position, controls.target)
      .normalize();
    camera.position.copy(fixedCameraPos);
    const defaultDist = 5.0;
    const zoomFactor = defaultDist / dist;
    const targetFOV = 65 / zoomFactor;
    camera.fov = THREE.MathUtils.lerp(camera.fov, targetFOV, 0.1);
    camera.updateProjectionMatrix();
    controls.target.copy(fixedCameraPos).sub(offset.multiplyScalar(dist));
  } else {
    camera.fov = THREE.MathUtils.lerp(camera.fov, 65, 0.1);
    camera.updateProjectionMatrix();
    camera.position.copy(fixedCameraPos);
    controls.target.set(0, 1.15, -10);
  }
  controls.update();

  if (teacherVRM) {
    teacherVRM.update(deltaTime);
    applyIdleAnimation(teacherVRM, time);
  }

  studentVRMs.forEach(vrm => {
    vrm.update(deltaTime);
    applyIdleAnimation(vrm, time);
  });

  composer.render();
}

const handleResize = () => {
  if (!containerRef.value) return;
  const width = containerRef.value.clientWidth;
  const height = containerRef.value.clientHeight;
  const pixelRatio = Math.min(window.devicePixelRatio, 2);
  camera.aspect = width / height;
  camera.updateProjectionMatrix();
  renderer.setSize(width, height);
  composer.setSize(width, height);
  smaaPass.setSize(width * pixelRatio, height * pixelRatio);
};

const toggleLock = () => {
  isLocked.value = !isLocked.value;
  if (controls) {
    controls.enableRotate = !isLocked.value;
    controls.target.set(0, 1.15, -10);
    controls.update();
  }
};

const resetView = () => {
  if (camera && controls) {
    camera.position.set(0, 1.15, -4.4);
    controls.target.set(0.0, 1.25, -10.0);
    controls.update();
  }
};

const onModelChange = (val: string) => {
  loadVRM(val, new THREE.Vector3(0, 0.25, -9.0), Math.PI, true);
};

onMounted(() => {
  initScene();
  window.addEventListener("resize", handleResize);
});

onUnmounted(() => {
  window.removeEventListener("resize", handleResize);
  cancelAnimationFrame(animationId);
  if (renderer) {
    renderer.dispose();
  }
  if (teacherVRM) {
    VRMUtils.deepDispose(teacherVRM.scene);
  }
  studentVRMs.forEach(vrm => {
    VRMUtils.deepDispose(vrm.scene);
  });
});
</script>

<template>
  <div class="classroom-container">
    <div ref="containerRef" class="canvas-container" />

    <button
      class="lock-btn"
      :class="{ unlocked: !isLocked }"
      @click="toggleLock"
      title="锁定/解锁视角"
    >
      <svg v-if="isLocked" class="icon" viewBox="0 0 24 24">
        <path
          d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zM9 6c0-1.66 1.34-3 3-3s3 1.34 3 3v2H9V6zm9 14H6V10h12v10zm-6-3c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2z"
        />
      </svg>
      <svg v-else class="icon" viewBox="0 0 24 24">
        <path
          d="M12 17c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm6-9h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6h1.9c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm0 12H6V10h12v10z"
        />
      </svg>
    </button>

    <div class="ui-container">
      <div class="ui-row">
        <label>选择角色：</label>
        <el-select
          v-model="selectedModel"
          @change="onModelChange"
          placeholder="请选择角色"
          style="width: 150px"
        >
          <el-option label="Alicia (默认)" value="/models/AliciaSolid_vrm-0.51.vrm" />
          <el-option label="Twist Sample" value="/models/VRM1_Constraint_Twist_Sample.vrm" />
          <el-option label="虚拟角色 A" value="/models/2307020555850481813.vrm.glb" />
          <el-option label="虚拟角色 B" value="/models/3003548679065420654.vrm.glb" />
        </el-select>
      </div>
      <div class="ui-row" style="margin-top: 10px">
        <el-button type="primary" @click="resetView">恢复视角</el-button>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.classroom-container {
  position: relative;
  width: 100%;
  height: calc(100vh - 110px);
  background-color: #f0f0f0;
  overflow: hidden;

  .canvas-container {
    width: 100%;
    height: 100%;
  }

  .lock-btn {
    position: absolute;
    top: 20px;
    right: 20px;
    background: rgba(255, 255, 255, 0.9);
    color: #333;
    border: none;
    padding: 0;
    border-radius: 50%;
    width: 48px;
    height: 48px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.15);
    z-index: 1000;
    transition: all 0.3s ease;

    .icon {
      width: 24px;
      height: 24px;
      fill: currentColor;
    }

    &.unlocked {
      background: #4a90d9;
      color: white;
    }
  }

  .ui-container {
    position: absolute;
    top: 20px;
    left: 20px;
    background: rgba(255, 255, 255, 0.8);
    padding: 15px;
    border-radius: 8px;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    z-index: 1000;
  }
}
</style>
