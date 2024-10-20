<script setup lang="ts">
import SaveCancel from '@/components/buttons/SaveCancel.vue';
import { getProviderByID } from '@/lib/data';
import { processFormat } from '@/lib/formats/csv';
import { optionalFields, requiredFields, validate_csv_format } from '@/lib/processing/snapshot';
import { authenticatedRequest } from '@/lib/requests';
import { type Provider } from '@/lib/types';
import router from '@/router';
import InputNumber from 'primevue/inputnumber';
import InputText from 'primevue/inputtext';
import { useToast } from 'primevue/usetoast';
import { ref, watch } from 'vue';

const props = defineProps<{
  providerID?: number;
}>();

const toast = useToast();

const provider = ref<Provider>({
  id: 0,
  name: '',
  csv_format: '',
  csv_format_obj: {},
  annual_fee: 0
});

watch(
  props,
  ({ providerID }, _) => {
    if (providerID !== undefined)
      getProviderByID(providerID).then(
        (result) => (provider.value = result ? result : provider.value)
      );
  },
  {
    immediate: true
  }
);
function validate_csv(): boolean {
  const fmt = processFormat(provider.value.csv_format);
  const [valid, missing] = validate_csv_format(Object.keys(fmt), false);
  if (!valid) {
    toast.add({
      summary: 'Error',
      detail: `Missing required fields: ${missing.join(',')}`,
      group: 'bl',
      severity: 'error',
      life: 2000
    });
  }
  return valid;
}
const save = async () => {
  if (!validate_csv()) {
    return;
  }
  const payload = {
    provider: provider.value
  };
  await authenticatedRequest('/providers', {
    method: 'PUT',
    body: JSON.stringify(payload)
  });
  router.push('/providers');
};
</script>

<template>
  <div class="container">
    <div class="input-item">
      <InputText placeholder="Name" v-model="provider.name" type="text" />
    </div>
    <div class="input-item" style="width: 50%">
      <div>
        <span style="color: var(--warning-colour)">
          Required fields:
          <template v-for="(field, idx) in requiredFields(false, true)">
            <template v-if="idx != 0">,&nbsp;</template>
            <pre style="display: inline">{{ field }}</pre>
          </template>
        </span>
        <br />
        <span style="color: var(--success-colour)">
          Optional fields:
          <template v-for="(field, idx) in optionalFields()">
            <template v-if="idx != 0">,&nbsp;</template>
            <pre style="display: inline">{{ field }}</pre>
          </template>
        </span>
      </div>
    </div>
    <div class="input-item" style="width: 50%">
      <InputText
        placeholder="CSV Format"
        v-model="provider.csv_format"
        type="text"
        style="width: 100%"
      />
    </div>
    <div class="input-item" style="width: 50%">
      <InputNumber
        placeholder="Annual fee"
        v-model="provider.annual_fee"
        :min="0"
        :max="100"
        :max-fraction-digits="2"
        suffix="%"
      />
    </div>
    <div class="input-item">
      <SaveCancel @save="save" @cancel="router.back()" />
    </div>
  </div>
</template>

<style scoped>
.container {
  display: flex;
  flex-direction: column;
  padding-top: 2rem;
}

.input-item {
  padding-bottom: 1rem;
  display: flex;
  column-gap: 1rem;
}
</style>
