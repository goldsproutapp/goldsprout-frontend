<script setup lang="ts">
import SaveCancel from '@/components/buttons/SaveCancel.vue';
import SnapshotImportBox from '@/components/display/SnapshotImportBox.vue';
import MessageDialog from '@/components/modals/MessageDialog.vue';
import { clearCache } from '@/lib/cache';
import { getAccountByName, getProviderByName, getUserByName } from '@/lib/data';
import { authenticatedRequest } from '@/lib/requests';
import router from '@/router';
import Button from 'primevue/button';
import Dialog from 'primevue/dialog';
import ProgressSpinner from 'primevue/progressspinner';
import { useToast } from 'primevue/usetoast';
import { ref } from 'vue';

const toast = useToast();
const waiting = ref(false);

const rawData = ref<any[]>([]);
const dataValid = ref<boolean>(false);

const groupedData = ref<{ [key: string]: { [key: string]: any } }>({});
const modal = ref(false);
const numEntries = ref(0);
const numBatches = ref(0);

const showErrorDialog = ref<boolean>(false);
const errorMessages = ref<string[]>([]);

const displayError = (errors: string[]) => {
  errorMessages.value = errors;
  showErrorDialog.value = true;
};

const process = async () => {
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
    for (const row of rawData.value) {
      const provider = await getProviderByName(row.provider.toString());
      if (!provider) {
        toast.add({
          summary: 'Error',
          detail: `Invalid provider name '${row.provider}'`,
          group: 'bl',
          severity: 'error',
          life: 3000
        });
        return cancel();
      }
      const user = await getUserByName(row.user.toString());
      if (!user) {
        toast.add({
          summary: 'Error',
          detail: `Invalid user '${row.user}'`,
          group: 'bl',
          severity: 'error',
          life: 3000
        });
        return cancel();
      }
      const account = await getAccountByName(row.account.toString(), user.id, provider.id);
      if (!account) {
        toast.add({
          summary: 'Error',
          detail: `Invalid account for ${row.user} with ${row.provider}: '${row.account}'`,
          group: 'bl',
          severity: 'error',
          life: 3000
        });
        return cancel();
      }
      row.account_id = account.id;
      const timestamp = Math.floor(Date.parse(row.date.toString()) / 1000);
      if (isNaN(timestamp)) {
        toast.add({
          summary: 'Error',
          detail: `Invalid date '${row.date}'`,
          group: 'bl',
          severity: 'error',
          life: 3000
        });
        return cancel();
      }
      const meta: any = {};
      if (row.region) meta.region = row.region;
      if (row.sector) meta.sector = row.sector;
      if (row.annual_fee) meta.annual_fee = row.annual_fee;
      pushSnapshot(timestamp, row.account_id, {
        stock_name: row.stock_name,
        stock_code: row.stock_code,
        units: row.units,
        price: row.price,
        value: row.value,
        cost: row.cost,
        absolute_change: row.absolute_change,
        ...meta
      });
    }
    groupedData.value = data;
  } catch (e) {
    console.error(e);
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
  <MessageDialog
    header="Error"
    message-type="failure"
    icon="pi pi-exclamation-triangle"
    summary="An error occurred whilst trying to parse the input:"
    v-model="showErrorDialog"
    :messages="errorMessages"
  />
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
    <SnapshotImportBox
      @error="displayError"
      :account="undefined"
      forbid-copy-previous
      forbid-create-empty
      extended
      @file-upload="process"
      v-model:data="rawData"
      v-model:data-valid="dataValid"
    />
    <div class="btn-container">
      <Button label="Cancel" severity="secondary" @click="router.back()" />
      <Button label="Process" @click="process" :disabled="!dataValid" />
    </div>
  </div>
</template>

<style scoped>
.container {
  display: flex;
  flex-direction: column;
  justify-content: center;
  row-gap: 1rem;
  background-color: var(--surface-card);
  padding: 3rem;
}

.btn-container {
  display: flex;
  justify-content: space-between;
}

.dialog-container {
  display: flex;
  flex-direction: column;
  row-gap: 2rem;
}
</style>
