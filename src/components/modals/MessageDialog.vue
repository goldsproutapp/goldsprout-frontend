<script setup lang="ts">
import Button from 'primevue/button';
import Dialog from 'primevue/dialog';
import { computed } from 'vue';

type MessageType = 'success' | 'failure';
const colours: { [key in MessageType]: string } = {
  success: 'success-colour',
  failure: 'failure-colour'
};
const showDialog = defineModel<boolean>();
const props = defineProps<{
  messages: string[];
  messageType: MessageType;
  header: string;
  icon: string;
  summary: string;
}>();
const colourStyle = computed(() => `color: var(--${colours[props.messageType]})`);
</script>

<template>
  <Dialog v-model:visible="showDialog" modal :header="header" :draggable="false">
    <div class="error-modal">
      <div>
        <span :style="colourStyle">
          <i :class="icon" />
          {{ summary }}
        </span>
        <ul>
          <li v-for="msg in messages">
            {{ msg }}
          </li>
        </ul>
      </div>
      <div><Button @click="showDialog = false" label="Close" severity="secondary" /></div>
    </div>
  </Dialog>
</template>

<style scoped>
.error-modal {
  display: flex;
  flex-direction: column;
  align-items: end;
  gap: var(--inline-spacing);
}
</style>
