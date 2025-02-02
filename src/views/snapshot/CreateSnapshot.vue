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
import { TransactionAttribution, type Account, type Snapshot, type User } from '@/lib/types';
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
import { fillGaps } from '@/lib/processing/snapshot';
import Dropdown from 'primevue/dropdown';
import { TransactionAttributionMap } from '@/lib/constants';

const headings = {
  stock_name: 'Name',
  units: 'Units',
  price: 'Price (pence)',
  value: 'Value (£)',
  cost: 'Cost (£)',
  absolute_change: 'Gain/loss (£)'
};

const text_colour = (num: number): any => ({
  color: `var(--${num < 0 ? 'failure' : 'success'}-colour)`
});

const replaceCommas = ['units', 'price', 'value', 'cost', 'absolute_change'];
onMounted(() => {
  getStockList(true);
  getAccounts(true);
  getSnapshots(true);
});

const user = ref<User>(authState.userInfo);
const account = ref<Account>();

const entries = ref<any[]>([]);
const inputDiv: any = ref(null);
const dateInput = ref<Date>(new Date(new Date().toDateString()));

const showSummaryDialog = ref(false);
const summary = ref({
  num_snapshots: 0,
  total_value: 0,
  user: ''
});

const toast = useToast();
const unitDiff = ref<any>([]);
const showUnitDiffModal = ref(false);

function promptTransactionAttribution() {
  const account_id = account.value?.id ?? 0;
  const prevSnapshots = dataState.snapshots_latest.filter((s) => s.account_id == account_id);
  const existing_ids: number[] = [];
  const notNewEntries = entries.value.map((e) => {
    const prev = prevSnapshots.find(
      ({ stock }) =>
        (stock.stock_code != '' && stock.stock_code == e.stock_code) || stock.name == e.stock_name
    );
    if (prev) {
      existing_ids.push(prev.id);
      return [e, prev];
    } else return [e, { transaction_attribution: TransactionAttribution.BuySell, units: 0 }];
  });
  const sold = prevSnapshots
    .filter((s) => !existing_ids.includes(s.id))
    .map((s) => [
      { ...s, transaction_attribution: TransactionAttribution.BuySell, stock_name: s.stock.name },
      -parseFloat(s.units)
    ]);
  notNewEntries.forEach(([e, p]) => (e.transaction_attribution = p.transaction_attribution));
  unitDiff.value = notNewEntries
    .map(([e, p]) => [e, parseFloat(e.units) - parseFloat(p.units)])
    .filter(([_, u]) => u != 0)
    .concat(sold);

  if (unitDiff.value.length > 0) {
    showUnitDiffModal.value = true;
    return true;
  }
  return false;
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
  let error: string | null = null;
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
        const [filled, err] = fillGaps(obj);
        if (err != null) error = err;
        return filled;
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
  if (error != null) {
    toast.add({
      summary: 'Error',
      detail: error,
      group: 'bl',
      severity: 'error',
      life: 2000
    });
  }
  inputDiv.value.innerText = '';
}
const createSnapshots = async () => {
  const date = dateInput.value;
  const payload = {
    batches: [
      {
        date: Math.floor(date.getTime() / 1000),
        account_id: account.value?.id ?? 0,
        entries: entries.value,
        delete_sold_stocks: true
      }
    ]
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
  if (!promptTransactionAttribution()) createSnapshots();
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
    <Dialog v-model:visible="showUnitDiffModal" modal>
      Please select the reason for the change in number of units of each holding:
      <table class="transattr-table">
        <thead>
          <tr>
            <th>Holding</th>
            <th>Unit change</th>
            <th>Value change</th>
            <th>Reason</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="([entry, diff, _], i) in unitDiff" :key="i">
            <td>{{ entry.stock_name }}</td>
            <td :style="text_colour(diff)">{{ formatDecimal(diff.toFixed(2)) }}</td>
            <td :style="text_colour(diff)">
              {{ formatDecimal(((diff * entry.price) / 100).toFixed(2)) }}
            </td>
            <td>
              <Dropdown
                v-model="unitDiff[i][0].transaction_attribution"
                :option-label="`name_${diff > 0}`"
                option-value="id"
                :options="TransactionAttributionMap"
              />
            </td>
          </tr>
        </tbody>
      </table>
      <div class="save-cancel">
        <SaveCancel @cancel="showUnitDiffModal = false" @save="createSnapshots" />
      </div>
    </Dialog>
    <h1>Create snapshot</h1>
    <div style="margin-bottom: 1rem">
      <span v-if="account">
        Format:
        <pre style="display: inline">{{ account.provider?.csv_format }}</pre>
      </span>
      <span v-else> Select an account. </span>
    </div>
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
      <div class="option-container">
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
.option-container {
  display: flex;
  flex-wrap: wrap;
  gap: var(--inline-spacing);
}
.transattr-table {
  margin-top: var(--inline-spacing);
  border-left: 2px solid var(--border-colour);
  border-spacing: var(--inline-spacing);
  text-align: left;
}
</style>
