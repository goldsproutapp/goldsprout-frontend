<script setup lang="ts">
import Button from './Button.vue';
defineEmits(['save', 'cancel'])
const props = withDefaults(defineProps<{
    saveLabel?: string,
    cancelLabel?: string,
}>(), {
    saveLabel: 'Save',
    cancelLabel: 'Cancel',
});
</script>

<template>
    <Button colour-profile="success" @click="$emit('save')">{{ saveLabel }}</Button>
    <Button colour-profile="failure" @click="$emit('cancel')">{{ cancelLabel }} </Button>
</template>

<style scoped>
</style>
