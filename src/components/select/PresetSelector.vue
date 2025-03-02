<script setup lang="ts">
import { PRESET_DEFAULT_LABEL, type PresetService } from '@/lib/service/presets';
import Button from 'primevue/button';
import Dropdown from 'primevue/dropdown';
import ProgressSpinner from 'primevue/progressspinner';
import { useConfirm } from 'primevue/useconfirm';

const props = defineProps<{
  presets: PresetService<any>;
}>();
const confirm = useConfirm();
const save = () => props.presets.save();
const deleteItem = (e: Event, option: string) => {
  e.stopPropagation();
  confirm.require({
    target: e.currentTarget as HTMLElement,
    message: `Are you sure you want to delete preset '${option}'?`,
    icon: 'pi pi-exclamation-triangle',
    acceptLabel: 'Delete',
    rejectLabel: 'Cancel',
    rejectClass: 'p-button-secondary p-button-outlined',
    acceptClass: 'p-button-danger',
    accept: () => props.presets.deleteOption(option),
    reject: () => {}
  });
};
</script>

<template>
  <div class="persistence-selector-container">
    <ProgressSpinner
      style="height: 1em; width: 1em; margin-right: 1em"
      stroke-width="8"
      v-if="presets.processing.value"
    />
    <Button
      icon="pi pi-save"
      class="save-button"
      text
      rounded
      severity="secondary"
      v-else-if="presets.canSave.value"
      @click="save"
    />
    <Dropdown
      class="preset-dropdown"
      editable
      :options="presets.optionLabels.value"
      v-model="presets.selectedKey.value"
      :loading="presets.loading.value"
    >
      <template #option="{ option }">
        <div
          class="option"
          @click="() => (option == presets.selectedKey.value ? presets.selectionChanged() : {})"
        >
          {{ option }}
          <Button
            icon="pi pi-trash"
            severity="danger"
            text
            rounded
            v-if="!!(option != PRESET_DEFAULT_LABEL || presets.defaultIsCustom.value)"
            @click="(e) => deleteItem(e, option)"
          />
          <!--Ensure that default entry has the same height: -->
          <Button
            style="visibility: hidden"
            icon="pi pi-times"
            severity="danger"
            text
            rounded
            v-else
          />
        </div>
      </template>
    </Dropdown>
  </div>
</template>

<style scoped>
.option {
  width: 100%;
  align-items: center;
  display: inline-flex;
  justify-content: space-between;
}
.persistence-selector-container {
  margin-top: 0.25rem;
  margin-bottom: 0.25rem;
  display: flex;
  align-items: center;
}
.save-button {
  height: unset;
}
</style>
