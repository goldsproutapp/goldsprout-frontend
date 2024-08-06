<script setup lang="ts"></script>

<template>
  <div class="summary-cards">
    <slot />
  </div>
</template>

<style scoped>
.summary-cards {
  display: flex;
  flex-wrap: wrap;
}
</style>
