<script setup lang="ts">
import router from '@/router';
import Button from 'primevue/button';
defineProps<{
  message?: string;
}>();
</script>

<template>
  <div class="wrapper">
    <h1>404 Not found</h1>
    <h2>{{ message || 'This page could not be found' }}</h2>
    <Button label="Go back" severity="secondary" @click="router.back()" />
  </div>
</template>

<style scoped>
.wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
}
h1,
h2 {
  text-align: center;
}
</style>
