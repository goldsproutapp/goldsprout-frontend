<script setup lang="ts">
import router from '@/router';
import Button from 'primevue/button';
</script>

<template>
  <div class="wrapper">
    <h1>Unauthorised</h1>
    <h2>You do not have permission to access this page</h2>
    <Button label="Go back" severity="secondary" @click="router.back()" />
  </div>
</template>

<style scoped>
.wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
}
</style>
