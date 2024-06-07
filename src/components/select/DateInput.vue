<script setup lang="ts">
import Calendar from 'primevue/calendar'

const model = defineModel<Date>()
</script>

<template>
  <!-- TODO: l10n so that this changes with client locale -->
  <Calendar v-model="model" :date-format="'dd/mm/yy'" />
</template>

<style scoped>
.date-input {
  background-color: var(--input-colour);
  color: var(--text-colour);
  border: none;
  border-radius: 0.3rem;
}
</style>
