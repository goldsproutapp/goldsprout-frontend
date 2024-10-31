<script setup lang="ts">
import TabMenu from 'primevue/tabmenu';
import { capitalize, computed, ref } from 'vue';

const props = defineProps<{
  tabs: string[];
}>();

const menu = computed(() =>
  props.tabs.map((tab) => ({
    label: capitalize(tab)
  }))
);
const menuIdx = ref(0);
</script>

<template>
  <TabMenu :model="menu" v-model:activeIndex="menuIdx" style="margin-left: var(--inline-spacing)" />
  <template v-for="(tab, idx) in tabs" :key="idx">
    <div v-show="idx == menuIdx" style="display: contents">
      <slot :name="tab" />
    </div>
  </template>
</template>

<style scoped></style>
