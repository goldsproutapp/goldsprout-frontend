<script setup lang="ts">
</script>

<template>
    <div class="screen-fill">
        <div class="modal-wrapper">
            <slot />
        </div>
    </div>
</template>

<style scoped>
.screen-fill {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 0;
    background-color: rgba(0, 0, 0, 0.5);
}
.modal-wrapper {
    position: absolute;
    background-color: var(--header-bg-colour);
    padding: 2rem;
    border-radius: 1rem;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
}
</style>
