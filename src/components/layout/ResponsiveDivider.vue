<script setup lang="ts">
import Divider from 'primevue/divider';
import { compile, computed, type CSSProperties } from 'vue';
const dividerStyle: CSSProperties = {
  backgroundColor: 'var(--surface-ground)'
};
const props = defineProps<{
  landscapeDirection: 'h' | 'v';
}>();
const classA = computed(() => `${props.landscapeDirection}div`);
const classB = computed(() => `${props.landscapeDirection == 'h' ? 'v' : 'h'}div`);
</script>

<template>
  <Divider layout="horizontal" :class="classA" :pt:content:style="dividerStyle" align="center"
    ><slot
  /></Divider>
  <Divider layout="vertical" :class="classB" :pt:content:style="dividerStyle" align="center"
    ><slot
  /></Divider>
</template>

<style scoped>
.vdiv {
  display: none;
}
@media screen and (max-width: 650px) {
  .hdiv {
    display: none;
  }
  .vdiv {
    display: flex;
  }
}
</style>
