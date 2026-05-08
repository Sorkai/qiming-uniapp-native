import { ref } from "vue";

const visibilityOverride = ref<boolean | null>(null);
const activeInstanceId = ref<number | null>(null);

let nextInstanceId = 0;

export const aiScreenCaptureVisibilityOverride = visibilityOverride;
export const aiScreenCaptureActiveInstanceId = activeInstanceId;

export const createAiScreenCaptureInstanceId = () => {
  nextInstanceId += 1;
  return nextInstanceId;
};

export const claimAiScreenCaptureInstance = (instanceId: number) => {
  if (activeInstanceId.value === null) {
    activeInstanceId.value = instanceId;
  }
  return activeInstanceId.value === instanceId;
};

export const releaseAiScreenCaptureInstance = (instanceId: number) => {
  if (activeInstanceId.value === instanceId) {
    activeInstanceId.value = null;
  }
};

export const setAiScreenCaptureVisibilityOverride = (
  visible: boolean | null
) => {
  visibilityOverride.value = visible;
};
