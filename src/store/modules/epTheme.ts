import { defineStore } from "pinia";
import {
  store,
  getConfig,
  storageLocal,
  responsiveStorageNameSpace
} from "../utils";

export const useEpThemeStore = defineStore("pure-epTheme", {
  state: () => ({
    epThemeColor:
      storageLocal().getItem<StorageConfigs>(
        `${responsiveStorageNameSpace()}layout`
      )?.epThemeColor ??
      getConfig().EpThemeColor ??
      "#97b4f7",
    epTheme:
      storageLocal().getItem<StorageConfigs>(
        `${responsiveStorageNameSpace()}layout`
      )?.theme ??
      getConfig().Theme ??
      "light"
  }),
  getters: {
    getEpThemeColor(state) {
      return state.epThemeColor;
    },
    /** 用于mix导航模式下hamburger-svg的fill属性 */
    fill(state) {
      if (state.epTheme === "light") {
        return "#97b4f7";
      } else {
        return "#fff";
      }
    }
  },
  actions: {
    setEpThemeColor(newColor: string): void {
      const layout = storageLocal().getItem<StorageConfigs>(
        `${responsiveStorageNameSpace()}layout`
      );
      this.epTheme = layout?.theme ?? getConfig().Theme ?? "light";
      this.epThemeColor = newColor || getConfig().EpThemeColor || "#97b4f7";
      if (!layout) return;
      layout.epThemeColor = this.epThemeColor;
      storageLocal().setItem(`${responsiveStorageNameSpace()}layout`, layout);
    }
  }
});

export function useEpThemeStoreHook() {
  return useEpThemeStore(store);
}
