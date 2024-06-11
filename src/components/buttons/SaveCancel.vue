<script setup lang="ts">
import Button from 'primevue/button';

defineEmits(['save', 'cancel']);
const props = withDefaults(
  defineProps<{
    saveLabel?: string;
    cancelLabel?: string;
  }>(),
  {
    saveLabel: 'Save',
    cancelLabel: 'Cancel'
  }
);
</script>

<template>
  <Button
    class="button"
    type="button"
    :label="saveLabel"
    severity="success"
    @click="$emit('save')"
  />
  <Button
    class="button"
    type="button"
    :label="cancelLabel"
    severity="danger"
    @click="$emit('cancel')"
  />
</template>

<style scoped></style>
