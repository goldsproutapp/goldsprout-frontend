<script setup lang="ts">
import type { RelativePosition } from '@/lib/options'

withDefaults(
  defineProps<{
    content: string
    position: RelativePosition
  }>(),
  {
    position: 'top'
  }
)
</script>

<template>
  <div style="display: inline-block" v-if="position == 'left'" v-tooltip.left="content">
    <slot />
  </div>
  <div style="display: inline-block" v-if="position == 'right'" v-tooltip.right="content">
    <slot />
  </div>
  <div style="display: inline-block" v-if="position == 'top'" v-tooltip.top="content">
    <slot />
  </div>
  <div style="display: inline-block" v-if="position == 'bottom'" v-tooltip.bottom="content">
    <slot />
  </div>
</template>

<style scoped></style>
