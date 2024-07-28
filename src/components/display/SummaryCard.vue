<script setup lang="ts">
import Card from 'primevue/card';
</script>

<template>
  <Card class="summary-card">
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
  min-width: 20rem;
}
</style>
