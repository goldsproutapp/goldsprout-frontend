<script setup lang="ts">
    const model = defineModel();
</script>

<template>
    <input type="date" v-model="model" class="date-input">
</template>

<style scoped>
.date-input {
    background-color: var(--input-colour);
    color: var(--text-colour);
    border: none;
    border-radius: .3rem;
}
</style>
