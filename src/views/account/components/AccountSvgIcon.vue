<template>
  <svg
    class="account-svg-icon"
    viewBox="0 0 24 24"
    fill="none"
    aria-hidden="true"
  >
    <g v-if="name === 'check'">
      <path d="m5 12 4 4L19 6" />
    </g>
    <g v-else-if="name === 'mail'">
      <rect x="4" y="6" width="16" height="12" rx="2" />
      <path d="m5 8 7 5 7-5" />
    </g>
    <g v-else-if="name === 'play'">
      <path d="M8 5v14l11-7z" />
    </g>
    <g v-else-if="name === 'activity'">
      <path d="M4 17h16" />
      <path d="M6 14l4-4 3 3 5-6" />
      <path d="M17 7h1v1" />
    </g>
    <g v-else-if="name === 'plus'">
      <path d="M12 5v14" />
      <path d="M5 12h14" />
    </g>
    <g v-else-if="name === 'edit'">
      <path d="M5 19h4l10-10-4-4L5 15z" />
      <path d="m13.5 6.5 4 4" />
    </g>
    <g v-else-if="name === 'chevron-down'">
      <path d="m7 9 5 5 5-5" />
    </g>
    <g v-else>
      <circle cx="12" cy="12" r="8" />
      <path d="M12 8v4l2.5 2" />
    </g>
  </svg>
</template>

<script setup lang="ts">
defineProps<{
  name: string;
}>();
</script>

<style scoped>
.account-svg-icon {
  display: block;
  width: 1em;
  height: 1em;
  color: currentcolor;
  stroke: currentcolor;
  stroke-width: var(--account-icon-stroke, 1.9);
  stroke-linecap: round;
  stroke-linejoin: round;
}
</style>
