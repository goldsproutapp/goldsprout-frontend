<script setup lang="ts">
</script>

<template>
    <div class="container">
        <slot />
    </div>
</template>

<style scoped>
.container {
    display: flex;
    flex-direction: column;
    align-items: center;
    row-gap: 1rem;
}
</style>
