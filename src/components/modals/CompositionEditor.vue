<script setup lang="ts">
import Dialog from 'primevue/dialog';
import InputText from 'primevue/inputtext';
import InputNumber from 'primevue/inputnumber';
import Button from 'primevue/button';
import { computed, ref } from 'vue';
import SaveCancel from '../buttons/SaveCancel.vue';
const showDialog = defineModel<boolean>();
const props = defineProps<{
  compType: string;
  initComp: { [key: string]: number };
}>();

const composition = ref(Object.entries(props.initComp));
const compositionObj = computed(() => Object.fromEntries(composition.value));

const header = computed(() => `${props.compType} composition`);
const valid = computed(() => {
  const totalValid = Object.values(compositionObj.value).reduce((acc, x) => acc + x, 0) == 100;
  const keys = Object.keys(compositionObj.value);
  const keysValid = keys.length == new Set(keys).size && keys.every((k) => k != '');
  return totalValid && keysValid;
});

const emit = defineEmits<{
  (e: 'close', composition: { [key: string]: number }): void;
}>();
const close = (comp: { [key: string]: number }) => {
  emit('close', comp);
  showDialog.value = false;
};
</script>

<template>
  <Dialog v-model:visible="showDialog" modal :header="header" :draggable="false">
    <table>
      <tr>
        <th>{{ compType }}</th>
        <th>%</th>
        <th></th>
      </tr>
      <tr v-for="(_, i) in composition">
        <td><InputText v-model="composition[i][0]" /></td>
        <td>
          <InputNumber
            v-model="composition[i][1]"
            :min="0"
            :max="100"
            :step="0.1"
            :max-fraction-digits="1"
            suffix="%"
          />
        </td>
        <td><Button icon="pi pi-times" severity="danger" @click="composition.splice(i, 1)" /></td>
      </tr>
      <tr>
        <td colspan="3">
          <Button label="Add" style="width: 100%" @click="composition.push(['', 0])" />
        </td>
      </tr>
      <tr>
        <td colspan="1">
          <div class="save-cancel-container">
            <SaveCancel
              @cancel="close(initComp)"
              @save="close(compositionObj)"
              save-label="Accept"
              :save-enabled="valid"
            />
          </div>
        </td>
      </tr>
    </table>
  </Dialog>
</template>

<style scoped>
.save-cancel-container {
  display: flex;
  column-gap: 1rem;
}
</style>
