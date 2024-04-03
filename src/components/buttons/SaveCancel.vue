<script setup lang="ts">
import Button from './Button.vue';
defineEmits(['save', 'cancel'])
</script>

<template>
    <Button colour-profile="success" @click="$emit('save')">Save</Button>
    <Button colour-profile="failure" @click="$emit('cancel')">Cancel</Button>
</template>

<style scoped>
</style>
