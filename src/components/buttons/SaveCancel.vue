<script setup lang="ts">
import Button from 'primevue/button';

defineEmits(['save', 'cancel']);
const props = withDefaults(
  defineProps<{
    saveLabel?: string;
    cancelLabel?: string;
    saveEnabled?: boolean;
    cancelEnabled?: boolean;
  }>(),
  {
    saveLabel: 'Save',
    cancelLabel: 'Cancel',
    saveEnabled: true,
    cancelEnabled: true,
  }
);
</script>

<template>
  <Button
    class="button"
    type="button"
    :label="cancelLabel"
    :disabled="!cancelEnabled"
    severity="danger"
    @click="$emit('cancel')"
  />
  <Button
    class="button"
    type="button"
    :label="saveLabel"
    :disabled="!saveEnabled"
    severity="success"
    @click="$emit('save')"
  />
</template>

<style scoped></style>
