<script setup lang="ts">
import SaveCancel from '@/components/buttons/SaveCancel.vue';
import { clearCache } from '@/lib/cache';
import { DEFAULT_IMPORT_FORMAT } from '@/lib/constants';
import { getAccountByName, getProviderByName, getUserByName } from '@/lib/data';
import { parseCSV, processFormat } from '@/lib/formats/csv';
import { fillGaps, requiredFields, validate_csv_format } from '@/lib/processing/snapshot';
import { authenticatedRequest } from '@/lib/requests';
import router from '@/router';
import Button from 'primevue/button';
import Dialog from 'primevue/dialog';
import InputText from 'primevue/inputtext';
import ProgressSpinner from 'primevue/progressspinner';
import Textarea from 'primevue/textarea';
import { useToast } from 'primevue/usetoast';
import { ref } from 'vue';

const replaceCommas = ['units', 'price', 'value', 'cost', 'absolute_change'];

const fmt = ref(DEFAULT_IMPORT_FORMAT);
const dataText = ref();
const toast = useToast();
const waiting = ref(false);

function checkFormat(): boolean {
  const format = processFormat(fmt.value);
  const [valid, missing] = validate_csv_format(Object.keys(format), true);
  if (!valid) {
    toast.add({
      summary: 'Error',
      detail: `Format is missing the following fields: ${missing.join(',')}`,
      group: 'bl',
      severity: 'error',
      life: 3000
    });
  }
  return valid;
}
const groupedData = ref<{ [key: string]: { [key: string]: any } }>({});
const modal = ref(false);
const numEntries = ref(0);
const numBatches = ref(0);

const process = async () => {
  if (!checkFormat()) return;

  const rows = dataText.value.split('\n');
  const parsedRows = rows.map(parseCSV);
  const format = processFormat(fmt.value);
  const data: { [key: string]: { [key: string]: any } } = {}; // date -> user -> snapshot[]
  const pushSnapshot = (timestamp: number, account_id: number, snapshot: any) => {
    numEntries.value++;
    if (!Object.keys(data).includes(timestamp.toString())) data[timestamp.toString()] = {};
    if (!Object.keys(data[timestamp.toString()]).includes(account_id.toString())) {
      numBatches.value++;
      data[timestamp.toString()][account_id.toString()] = [];
    }
    data[timestamp.toString()][account_id.toString()].push(snapshot);
  };

  try {
    for (const row of parsedRows) {
      const obj: { [key: string]: string | number } = {};
      Object.entries(format).forEach(
        ([key, idx]) =>
          (obj[key] = replaceCommas.includes(key) ? row[idx].replace(',', '') : row[idx])
      );
      const provider = await getProviderByName(obj.provider.toString());
      if (!provider) {
        toast.add({
          summary: 'Error',
          detail: `Invalid provider name '${obj.provider}'`,
          group: 'bl',
          severity: 'error',
          life: 3000
        });
        return cancel();
      }
      const user = await getUserByName(obj.user.toString());
      if (!user) {
        toast.add({
          summary: 'Error',
          detail: `Invalid user '${obj.user}'`,
          group: 'bl',
          severity: 'error',
          life: 3000
        });
        return cancel();
      }
      const account = await getAccountByName(obj.account.toString(), user.id, provider.id);
      if (!account) {
        toast.add({
          summary: 'Error',
          detail: `Invalid account for ${obj.user} with ${obj.provider}: '${obj.account}'`,
          group: 'bl',
          severity: 'error',
          life: 3000
        });
        return cancel();
      }
      obj.account_id = account.id;
      const timestamp = Math.floor(Date.parse(obj.date.toString()) / 1000);
      if (isNaN(timestamp)) {
        toast.add({
          summary: 'Error',
          detail: `Invalid date '${obj.date}'`,
          group: 'bl',
          severity: 'error',
          life: 3000
        });
        return cancel();
      }
      const [filled, err] = fillGaps(obj);
      if (err != null) {
        toast.add({
          summary: 'Error',
          detail: `An error has occurred: '${err}'`,
          group: 'bl',
          severity: 'error',
          life: 3000
        });
        return cancel();
      }
      const meta: any = {};
      if (obj.region) meta.region = obj.region;
      if (obj.sector) meta.sector = obj.sector;
      if (obj.annual_fee) meta.annual_fee = obj.annual_fee;
      pushSnapshot(timestamp, obj.account_id, {
        stock_name: filled.stock_name,
        stock_code: filled.stock_code,
        units: filled.units,
        price: filled.price,
        value: filled.value,
        cost: filled.cost,
        absolute_change: filled.absolute_change,
        ...meta
      });
    }
    groupedData.value = data;
  } catch (e) {
    toast.add({
      summary: 'Error',
      detail: `An error has occurred: '${e}'`,
      group: 'bl',
      severity: 'error',
      life: 3000
    });
  }
  modal.value = true;
};

function dateKeys(): string[] {
  const keys = [...Object.keys(groupedData.value)];
  keys.sort((a, b) => Number.parseInt(a) - Number.parseInt(b));
  return keys;
}

const submit = async () => {
  waiting.value = true;
  let i = 0;
  const batches = [];
  for (const date of dateKeys()) {
    for (const account of Object.keys(groupedData.value[date])) {
      i++;
      const payload = {
        date: Number.parseInt(date),
        account_id: Number.parseInt(account),
        entries: groupedData.value[date][account],
        delete_sold_stocks: true
      };
      batches.push(payload);
    }
  }
  const payload = {
    batches: batches
  };
  await authenticatedRequest('/snapshots', {
    method: 'POST',
    body: JSON.stringify(payload)
  });
  toast.add({
    summary: 'Complete',
    detail: 'Completed import',
    severity: 'success',
    life: 3000,
    group: 'bl'
  });
  waiting.value = false;
  cancel();
  clearCache();
  router.push('/');
};
const cancel = () => {
  numBatches.value = 0;
  numEntries.value = 0;
  modal.value = false;
  groupedData.value = {};
};
</script>

<template>
  <h1>Import data</h1>
  <Dialog v-model:visible="modal" header="Import" :closable="!waiting">
    <div class="dialog-container">
      <span
        >You have entered {{ numEntries }} records, which will be created in
        {{ numBatches }} batches.</span
      >
      <ProgressSpinner v-if="waiting" />
      <div class="btn-container" v-else>
        <SaveCancel saveLabel="Confirm" @save="submit" @cancel="cancel" />
      </div>
    </div>
  </Dialog>
  <div class="container">
    <span
      >Required fields:
      <template v-for="(field, i) in requiredFields(true, true)">
        <pre style="display: inline">{{ i > 0 ? ',' : '' }}&nbsp;{{ field }}</pre>
      </template>
    </span>
    <InputText v-model="fmt" placeholder="CSV Format" />
    <Textarea v-model="dataText" :rows="15" placeholder="Data" />
    <div class="btn-container">
      <Button label="Process" @click="process" />
      <Button label="Cancel" severity="secondary" @click="router.back()" />
    </div>
  </div>
</template>

<style scoped>
.container {
  display: flex;
  flex-direction: column;
  justify-content: center;
  row-gap: 1rem;
}

.btn-container {
  display: flex;
  column-gap: 1rem;
}

.dialog-container {
  display: flex;
  flex-direction: column;
  row-gap: 2rem;
}
</style>
