import Clarity from "@microsoft/clarity";

let initialized = false;

export const initClarity = () => {
  const projectId = import.meta.env.VITE_CLARITY_PROJECT_ID?.trim();

  if (initialized || !projectId) return;

  Clarity.init(projectId);
  initialized = true;
};
