<script setup lang="ts">
import { formatDecimal } from '@/lib/data';
import { computed } from 'vue';
import { watch } from 'vue';
import { ref } from 'vue';

const props = defineProps<{
  value: number;
  duration: number;
  decimalPrecision: number;
}>();
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
      if (newValue > props.value) {
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
</script>

<template>
  {{ formatDecimal(current.toFixed(decimalPrecision)) }}
</template>

<style scoped></style>
