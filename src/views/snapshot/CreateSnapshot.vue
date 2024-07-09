<script setup lang="ts">
import { formatDecimal, getUserDisplayName, pluralise } from '@/lib/data';
import { parseCSV } from '@/lib/formats/csv';
import {
  authenticatedRequest,
  getAccounts,
  getHoldings,
  getSnapshots,
  getStockList
} from '@/lib/requests';
import { authState, dataState } from '@/lib/state';
import { type Account, type Snapshot, type Stock, type User } from '@/lib/types';
import router from '@/router';
import { onMounted, ref } from 'vue';
import SaveCancel from '@/components/buttons/SaveCancel.vue';
import DateInput from '@/components/select/DateInput.vue';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import Button from 'primevue/button';
import Dialog from 'primevue/dialog';
import { useToast } from 'primevue/usetoast';
import { StatusCode, statusFrom, statusText } from '@/lib/formats/responses';
import AccountDropdown from '@/components/select/AccountDropdown.vue';

const headings = {
  stock_name: 'Name',
  units: 'Units',
  price: 'Price (pence)',
  value: 'Value (£)',
  cost: 'Cost (£)',
  absolute_change: 'Gain/loss (£)'
};

const replaceCommas = ['units', 'price', 'value', 'cost', 'absolute_change'];
onMounted(() => {
  getStockList(true);
  getAccounts(true);
});

const user = ref<User>(authState.userInfo);
const account = ref<Account>();

const entries = ref<any[]>([]);
const inputDiv: any = ref(null);
const dateInput = ref<Date>(new Date(new Date().toDateString()));

const missingStocks = ref<Stock[]>([]);
const showDeletionModal = ref(false);
const showSummaryDialog = ref(false);
const summary = ref({
  num_snapshots: 0,
  total_value: 0,
  user: ''
});

const toast = useToast();

function findMissingStocks(): boolean {
  const account_id = account.value?.id ?? 0;
  const snapshotsStocksNames = entries.value.map((entry: any) => entry.stock_name);
  const snapshotsStocksCodes = entries.value
    .filter((entry: any) => entry.stock_code != '')
    .map((entry: any) => entry.stock_code);
  const applicableStocks = dataState.stocks.filter(
    (stock) =>
      stock.tracking_strategy === 'DATA_IMPORT' &&
      stock.users.has(user.value.id) &&
      stock.accounts.includes(account_id)
  );
  missingStocks.value = applicableStocks.filter(
    (stock) =>
      !(
        (stock.stock_code != '' && snapshotsStocksCodes.includes(stock.stock_code)) ||
        snapshotsStocksNames.includes(stock.name)
      )
  );
  const missing = missingStocks.value.length !== 0;
  if (missing) showDeletionModal.value = true;
  return missing;
}

function process() {
  if (account.value === null || account.value === undefined) {
    toast.add({
      summary: 'Error',
      detail: 'Please select an account.',
      group: 'bl',
      severity: 'error',
      life: 2000
    });
    return;
  }
  const raw = inputDiv.value.innerText;
  const rows = raw.split('\n').filter((r: string) => r);
  const parsedRows = rows.map(parseCSV);
  try {
    const objs = parsedRows
      .filter((row: string[]) => row)
      .map((row: string[]) => {
        const obj: { [key: string]: string | number } = {};
        // @ts-ignore acccount.value cannot be undefined, this is ensured above
        Object.entries(account.value.provider.csv_format_obj).forEach(
          ([key, idx]) =>
            (obj[key] = replaceCommas.includes(key) ? row[idx].replace(',', '') : row[idx])
        );
        return obj;
      });
    entries.value.push(...objs);
  } catch (e) {
    toast.add({
      summary: 'Error',
      detail: 'The given data is not in the correct format for the selected provider.',
      group: 'bl',
      severity: 'error',
      life: 2000
    });
    return;
  }
  inputDiv.value.innerText = '';
}
const createSnapshots = async (deleteSoldStocks: boolean = true) => {
  const date = dateInput.value;
  const payload = {
    date: Math.floor(date.getTime() / 1000),
    account_id: account.value?.id ?? 0,
    entries: entries.value,
    delete_sold_stocks: deleteSoldStocks
  };
  const res = await authenticatedRequest('/snapshots', {
    method: 'POST',
    body: JSON.stringify(payload)
  });
  const status = statusFrom(res.status);
  if (status !== StatusCode.Created) {
    toast.add({
      summary: 'Error',
      detail: `An error occurred while creating the snapshots: ${statusText(status)}`,
      group: 'bl',
      severity: 'error',
      life: 2000
    });
    return;
  }
  toast.add({
    summary: 'Success',
    detail: 'Snapshots created',
    group: 'bl',
    severity: 'success',
    life: 2000
  });
  showSummaryDialog.value = true;
  const { data } = await res.json();
  summary.value.num_snapshots = data.length;
  summary.value.user = getUserDisplayName(user.value as User);
  summary.value.total_value = data.reduce(
    (total: number, snapshot: Snapshot) => total + Number.parseFloat(snapshot.value),
    0
  );
  getSnapshots(false);
  getStockList(false);
  getHoldings(false);
};

const submit = () => {
  if (!findMissingStocks()) createSnapshots();
};
</script>

<template>
  <div class="container">
    <Dialog
      v-model:visible="showSummaryDialog"
      header="Summary"
      modal
      :pt="{
        footer: {
          style: {
            justifyContent: 'start'
          }
        }
      }"
    >
      <span>
        You have created {{ pluralise(summary.num_snapshots, 'snapshot') }} for
        {{ summary.user }} with a total value of £{{
          formatDecimal(summary.total_value.toFixed(2))
        }}
      </span>
      <template #footer>
        <Button
          label="OK"
          severity="secondary"
          @click="
            () => {
              router.push('/snapshots');
              showSummaryDialog = false;
            }
          "
        />
      </template>
    </Dialog>
    <Dialog v-model:visible="showDeletionModal" modal>
      You have not provided data for the following stocks:
      <ul>
        <li v-for="stock in missingStocks" :key="stock.id.toString()">
          {{ stock.name }} of {{ stock.provider_name }}
        </li>
      </ul>
      It looks like these stocks are no longer held, and will be marked as such.<br />
      <Button
        class="modal-button"
        severity="success"
        @click="() => createSnapshots()"
        label="These are no longer held, continue"
      />
      <Button
        class="modal-button"
        severity="danger"
        @click="showDeletionModal = false"
        label="Cancel"
      />
      <br />
      <Button
        class="modal-button"
        severity="secondary"
        @click="createSnapshots(false)"
        label="These are still held,
                            continue without updating them"
      />
    </Dialog>
    <h1>Create snapshot</h1>
    <div contenteditable ref="inputDiv" class="csv-input"></div>
    <hr />
    <Button class="button" @click="process" label="Add" severity="primary" />
    <Button class="button" @click="entries = []" label="Clear" severity="secondary" />
    <DataTable :value="entries">
      <Column
        v-for="[key, display] in Object.entries(headings)"
        :key="key"
        :field="key"
        :header="display"
      ></Column>
    </DataTable>
    <hr />
    <div class="control-items">
      <div>
        <DateInput id="date-input" v-model="dateInput" />
        <AccountDropdown v-model="account" />
      </div>
      <div class="save-cancel">
        <SaveCancel class="save-cancel" @save="submit" @cancel="router.back()" />
      </div>
    </div>
  </div>
</template>

<style scoped>
.csv-input {
  width: 100%;
  border: 1px solid grey;
  border-radius: 0.2rem;
  min-height: 2lh;
}

.container {
  height: 100%;
  flex-grow: 1;
}

.misc-inputs {
  display: flex;
  margin-bottom: 2rem;
}

#date-input {
  margin-right: 1rem;
}

.error-message {
  color: var(--failure-colour);
  width: 100%;
  text-align: center;
  margin-bottom: 1rem;
}

.button {
  margin-right: var(--inline-spacing);
  margin-bottom: var(--inline-spacing);
}

.control-items {
  display: flex;
  flex-direction: column;
  justify-content: start;
  column-gap: var(--inline-spacing);
}

.modal-button {
  margin: 0.5rem;
}
.save-cancel {
  display: flex;
  column-gap: var(--inline-spacing);
  margin-top: var(--inline-spacing);
}
</style>
