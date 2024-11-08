<script setup lang="ts">
import { computed, watch, shallowRef } from "vue";
import { useDark, useGlobal } from "@pureadmin/utils";
import { useRenderIcon } from "@/components/ReIcon/src/hooks";
import { useDataThemeChange } from "@/layout/hooks/useDataThemeChange";

import DayIcon from "@/assets/svg/day.svg?component";
import DarkIcon from "@/assets/svg/dark.svg?component";

const { isDark } = useDark();
const styleIcon = shallowRef();
const { $storage } = useGlobal<GlobalPropertiesApi>();
const { dataTheme, dataThemeChange } = useDataThemeChange();
const overallStyle = computed(() => $storage?.layout?.overallStyle);

function onToggle() {
  if (overallStyle.value === "light") {
    dataTheme.value = true;
    dataThemeChange("dark");
  } else {
    dataTheme.value = false;
    dataThemeChange("light");
  }
}

watch(
  overallStyle,
  style => {
    styleIcon.value = style === "light" ? DarkIcon : DayIcon;
  },
  {
    immediate: true
  }
);
</script>

<template>
  <span class="overall-style-icon navbar-bg-hover" @click="onToggle">
    <component
      :is="useRenderIcon(styleIcon, { fill: isDark ? '#fff' : '#262626' })"
    />
  </span>
</template>
