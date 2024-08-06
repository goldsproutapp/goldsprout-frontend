<script setup lang="ts">
import Card from 'primevue/card';
import { computed } from 'vue';

const props = withDefaults(
  defineProps<{
    padding?: boolean;
  }>(),
  {
    padding: true
  }
);

const style = computed<Partial<CSSStyleDeclaration>>(() => {
  const obj: Partial<CSSStyleDeclaration> = {};
  if (!props.padding) obj.padding = '0';
  return obj;
});
</script>

<template>
  <Card class="summary-card" :pt:body:style="style">
    <template #title><slot name="title" /></template>
    <template #content>
      <h1>
        <b>
          <slot name="content" />
        </b>
      </h1>
    </template>
  </Card>
</template>

<style scoped>
.summary-card {
  margin: var(--inline-spacing);
  min-width: 16rem;
}
</style>
<style>
.p-card-content {
  padding: 0;
  height: 100%;
}
</style>
