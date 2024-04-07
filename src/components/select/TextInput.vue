<script setup lang="ts">

    const props = defineProps();
    const model = defineModel();
</script>

<template>
    <input v-bind="props" v-model="model">
</template>

<style scoped>
input {
    border-color: transparent;
    background-color: var(--input-colour);
    border-radius: .5rem;
    color: var(--text-colour);
    padding: .5rem;
    outline: none;
}
</style>
