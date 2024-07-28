<script setup lang="ts">
import { formatDecimal } from '@/lib/data';
import type { StyleValue } from 'vue';
import { computed } from 'vue';
import { watch } from 'vue';
import { ref } from 'vue';

const fmt = (value: number, decimalPrecision: number): string =>
  formatDecimal(value.toFixed(decimalPrecision));

const props = withDefaults(
  defineProps<{
    value: number;
    duration: number;
    decimalPrecision: number;
    coloured?: boolean;
    format?: null | ((value: number, decimalPrecision: number) => string);
  }>(),
  {
    coloured: false,
    format: null
  }
);
watch(
  props,
  () => {
    current.value = 0;
    counting = true;
  },
  {}
);
const interval = 10;
const step = computed(() => props.value / (props.duration / interval));
const current = ref(0);
let counting = true;
watch(
  current,
  (n, _) => {
    if (!counting) return;
    setTimeout(() => {
      const newValue = parseFloat((n + step.value).toFixed(props.decimalPrecision));
      if (Math.abs(newValue) > Math.abs(props.value)) {
        current.value = props.value;
        counting = false;
        return;
      }
      current.value = newValue;
    }, interval);
  },
  {
    immediate: true
  }
);
const style = computed(() => {
  const obj: StyleValue = {
    display: 'inline'
  };
  if (props.coloured && props.value != 0)
    obj.color = props.value > 0 ? 'var(--text-colour-positive)' : 'var(--text-colour-negative)';
  return obj;
});
</script>

<template>
  <span :style="style">
    {{ (format ?? fmt)(current, decimalPrecision) }}
  </span>
</template>

<style scoped></style>
