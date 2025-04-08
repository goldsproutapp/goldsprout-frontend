<script setup lang="ts">
import SaveCancel from '@/components/buttons/SaveCancel.vue';
import AccountDropdown from '@/components/select/AccountDropdown.vue';
import { TransactionAttributionMap } from '@/lib/constants';
import { formatCurrency, formatDecimal, pluralise } from '@/lib/data';
import { accountUniqueDisplay } from '@/lib/formats/display';
import { StatusCode, statusFrom, statusText } from '@/lib/formats/responses';
import { validateSnapshotRowEdit } from '@/lib/processing/snapshot';
import {
  SnapshotNumericFields,
  parseFile,
  promptTransactionAttribution,
  type SnapshotImportRow
} from '@/lib/processing/snapshot_import';
import { authenticatedRequest, getHoldings, getSnapshots, getStockList } from '@/lib/requests';
import { dataState } from '@/lib/state';
import type { Account, Snapshot } from '@/lib/types';
import { isArray } from '@/lib/utils';
import Button from 'primevue/button';
import Calendar from 'primevue/calendar';
import Column from 'primevue/column';
import DataTable, {
  type DataTableCellEditCompleteEvent,
  type DataTableRowEditSaveEvent
} from 'primevue/datatable';
import Dialog from 'primevue/dialog';
import Divider from 'primevue/divider';
import Dropdown from 'primevue/dropdown';
import FileUpload, { type FileUploadUploaderEvent } from 'primevue/fileupload';
import InputNumber from 'primevue/inputnumber';
import InputText from 'primevue/inputtext';
import Stepper from 'primevue/stepper';
import StepperPanel from 'primevue/stepperpanel';
import Textarea from 'primevue/textarea';
import { capitalize, computed, onMounted, ref } from 'vue';

const text_colour = (num: number): any => ({
  color: `var(--${num < 0 ? 'failure' : 'success'}-colour)`
});

const headings = {
  stock_code: 'Code',
  stock_name: 'Name',
  units: 'Units',
  price: 'Price (pence)',
  value: 'Value (£)',
  cost: 'Cost (£)'
};
const activeStep = ref(0);
const editingRows = ref([]);
const success = ref(false);
const completePanelPT = computed(() =>
  success.value || activeStep.value != 3
    ? {}
    : {
        number: {
          style: {
            backgroundColor: 'var(--failure-colour)'
          }
        }
      }
);
const stepperPT = computed(() =>
  success.value || activeStep.value != 3
    ? {}
    : {
        separator: {
          style: {
            backgroundColor: 'var(--failure-colour)'
          }
        }
      }
);
const summary = ref({
  num_snapshots: 0,
  total_value: 0,
  account: 'account'
});

onMounted(() => getSnapshots(false));

const account = ref<Account>();
const date = ref(new Date(new Date().toDateString()));
const data = ref<any[]>([]);
const csvText = ref('');
const optsValid = computed(() => account.value !== undefined);
const dataValid = ref(false);
const invalidDataText = computed(() => !(csvText.value == '' || dataValid.value));
const unitDiff = ref<any>([]);
const showUnitDiffModal = ref(false);
const unitDiffInputs = computed(() => unitDiff.value.filter(([, d]: [any, number]) => d != 0));

const csvTextUpdated = () => {
  const fallbackFmt = account.value?.provider?.csv_format_obj;
  const [success, parsed] = parseFile(csvText.value.split('\n'), fallbackFmt ? [fallbackFmt] : []);
  if (success) {
    data.value = parsed;
    dataValid.value = true;
  } else {
    data.value = [];
    dataValid.value = false;
  }
};

const showErrorDialog = ref<boolean>(false);
const errorMessages = ref<string[]>([]);

const displayError = (errors: string[]) => {
  errorMessages.value = errors;
  showErrorDialog.value = true;
};

const fileUpload = async (cb: Function, event: FileUploadUploaderEvent) => {
  // @ts-ignore
  const file = event.files[0];
  const reader = new FileReader();
  reader.onload = (e) => {
    // @ts-ignore
    const text: string = e.target.result;
    const [success, parsed] = parseFile(text.split('\n'), []);
    if (success) {
      data.value = parsed;
      cb();
    } else {
      if (isArray<string>(parsed)) displayError(parsed);
    }
  };
  reader.readAsText(file);
};
const totalValue = computed<Number>(() =>
  data.value.reduce((acc, { value }) => acc + Number.parseFloat(value), 0)
);

const createSnapshots = async (cb: Function) => {
  showUnitDiffModal.value = false;
  const payload = {
    batches: [
      {
        date: Math.floor(date.value.getTime() / 1000),
        account_id: account.value?.id ?? 0,
        entries: unitDiff.value.map(([e]: [any]) => e),
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
    summary.value.account = `An error occurred while creating the snapshots: ${statusText(status)}`;
    success.value = true;
    return;
  }
  const { data } = await res.json();
  summary.value.num_snapshots = data.filter(({ units }: any) => units != '0').length;
  summary.value.account = account.value ? accountUniqueDisplay(account.value) : 'this account';
  summary.value.total_value = data.reduce(
    (total: number, snapshot: Snapshot) => total + Number.parseFloat(snapshot.value),
    0
  );
  success.value = true;
  cb();
  getSnapshots(false);
  getStockList(false);
  getHoldings(false);
};

const emptySnapshot = (cb: Function) => {
  data.value = [];
  cb();
};
const canCopyPreviousSnapshots = computed(() =>
  dataState.snapshots_latest.some((s) => s.account_id == account.value?.id)
);
const copyPreviousSnapshots = (cb: Function) => {
  const prev = dataState.snapshots_latest.filter((s) => s.account_id == account.value?.id);
  data.value = prev.map<SnapshotImportRow>((s) => ({
    stock_name: s.stock.name,
    stock_code: s.stock.stock_code,
    absolute_change: (parseFloat(s.value) - parseFloat(s.cost)).toFixed(2),
    cost: s.cost,
    value: s.value,
    units: s.units,
    price: s.price,
    transaction_attribution: s.transaction_attribution
  }));
  cb();
};

const submit = (cb: Function) => {
  if (account.value == null) return;
  unitDiff.value = promptTransactionAttribution(
    account.value.id,
    dataState.snapshots_latest,
    data.value
  );
  const requirePrompt = unitDiffInputs.value.length > 0;
  showUnitDiffModal.value = requirePrompt;
  if (!requirePrompt) {
    createSnapshots(cb);
  }
};
const restart = () => {
  activeStep.value = 0;
};

const showEditOptionDialog = ref<boolean>(false);
const editOptions = ref<[string, number][][]>([]);
const editIdx = ref<number>(0);
const onEditRowSave = (evt: DataTableRowEditSaveEvent) => {
  const [newData, options] = validateSnapshotRowEdit(data.value[evt.index], evt.newData);
  data.value[evt.index] = newData;
  editOptions.value = options;
  editIdx.value = evt.index;
  if (options.length == 1) applyEditSuggestion(options[0]);
  else if (options.length > 1) showEditOptionDialog.value = true;
};

const applyEditSuggestion = (option: [string, number][]) => {
  option.forEach(([k, v]) => (data.value[editIdx.value][k] = v.toFixed(2)));
  showEditOptionDialog.value = false;
};
</script>

<template>
  <h1>Create snapshot</h1>
  <Dialog v-model:visible="showErrorDialog" modal header="Error" :draggable="false">
    <div class="error-modal">
      <div>
        <span style="color: var(--failure-colour)">
          <i class="pi pi-exclamation-triangle" />
          An error occurred whilst trying to parse the input:</span
        >
        <ul>
          <li v-for="msg in errorMessages">
            {{ msg }}
          </li>
        </ul>
      </div>
      <div><Button @click="showErrorDialog = false" label="Close" severity="secondary" /></div>
    </div>
  </Dialog>
  <Dialog v-model:visible="showEditOptionDialog" modal header="Input required" :draggable="false">
    <div class="edit-option-list">
      <span
        >The fields
        <!-- Use same field ordering as options. Changes depending on input -->
        <pre style="display: inline">{{ editOptions[0][0][0] }}</pre>
        ,
        <pre style="display: inline">{{ editOptions[0][1][0] }}</pre>
        and
        <pre style="display: inline">{{ editOptions[0][2][0] }}</pre>
        must be in proportion.<br />
        Please select the correct set of values.</span
      >
      <div
        v-for="opt in editOptions"
        class="edit-option-container"
        @click="applyEditSuggestion(opt)"
      >
        <span v-for="[k, v] in opt"> {{ capitalize(k) }}: {{ v.toFixed(2) }} </span>
      </div>
      <div><Button @click="showEditOptionDialog = false" label="Cancel" severity="danger" /></div>
    </div>
  </Dialog>
  <div class="cs-wrapper">
    <Stepper
      v-model:active-step="activeStep"
      :pt:panelContainer:style="'background-color: var(--surface-ground)'"
      :pt:stepperpanel="stepperPT"
      linear
    >
      <StepperPanel header="Options">
        <template #content="{ nextCallback }">
          <div class="option-container panel-body">
            <div class="option-grid">
              <span>Select account</span>
              <AccountDropdown v-model="account" />
              <span>Select date</span>
              <Calendar v-model="date" date-format="dd/mm/yy" />
            </div>
          </div>
          <div class="button-container">
            <span></span>
            <Button @click="nextCallback" label="Next" :disabled="!optsValid" />
          </div>
        </template>
      </StepperPanel>
      <StepperPanel header="Data">
        <template #content="{ nextCallback, prevCallback }">
          <div class="upload-container panel-body">
            <span class="input-instruction">Upload file</span>
            <FileUpload
              accept="text/csv"
              :show-upload-button="false"
              :show-cancel-button="false"
              custom-upload
              auto
              @uploader="(event) => fileUpload(nextCallback, event)"
            >
              <template #content
                ><div class="file-upload-target">Drag and drop file.</div></template
              >
            </FileUpload>
            <Divider>Or</Divider>
            <span class="input-instruction">Enter text</span>
            <Textarea v-model="csvText" @input="csvTextUpdated" :invalid="invalidDataText" />
            <Divider>Or</Divider>
            <Button
              :disabled="!canCopyPreviousSnapshots"
              label="Copy previous"
              outlined
              severity="secondary"
              @click="copyPreviousSnapshots(nextCallback)"
            />
            <Divider>Or</Divider>
            <Button
              label="Empty snapshot"
              outlined
              severity="secondary"
              @click="emptySnapshot(nextCallback)"
            />
          </div>
          <div class="button-container">
            <Button @click="prevCallback" label="Back" severity="secondary" />
            <Button @click="nextCallback" label="Next" :disabled="!dataValid" />
          </div>
        </template>
      </StepperPanel>
      <StepperPanel header="Review">
        <template #content="{ nextCallback, prevCallback }">
          <div class="panel-body">
            <h3>
              Review snapshot for
              <span class="highlight">{{ date.toLocaleDateString() }}</span> containing
              <span class="highlight">{{ data.length }}</span> entries with a total value of
              <span class="highlight">{{ formatCurrency(totalValue.toFixed(2)) }}</span
              >. <br /><br />Previous snapshot for
              <span class="highlight">{{
                account ? accountUniqueDisplay(account) : 'this account'
              }}</span>
              contained <span class="highlight">{{ account?.stock_count }}</span> entries totalling
              <span class="highlight">{{ formatCurrency(account?.value ?? '0') }}</span>
            </h3>
            <Divider />
            <DataTable
              :value="data"
              v-model:editing-rows="editingRows"
              :loading="data.length == 0"
              edit-mode="row"
              @row-edit-save="onEditRowSave"
              :pt="{
                table: { style: 'min-width: 50rem' }
              }"
            >
              <template #loading> Empty snapshot </template>
              <Column
                v-for="[key, display] in Object.entries(headings)"
                :key="key"
                :field="key"
                :header="display"
              >
                <template #editor="{ data, field }">
                  <InputNumber
                    v-model="data[field]"
                    :max-fraction-digits="2"
                    autofocus
                    style="width: 100%"
                    v-if="SnapshotNumericFields.includes(key as keyof SnapshotImportRow)"
                  />
                  <InputText v-model="data[key]" autofocus v-else style="width: 100%" />
                </template>

                <template #body="{ data }">
                  {{ data[key] }}
                </template>
              </Column>
              <Column key="delete" header="Delete">
                <template #body="{ index }">
                  <Button severity="danger" icon="pi pi-trash" @click="data.splice(index, 1)" />
                </template>
              </Column>
              <Column
                :rowEditor="true"
                style="width: 10%; min-width: 8rem"
                bodyStyle="text-align:center"
              ></Column>
            </DataTable>
          </div>
          <div class="button-container">
            <Button @click="prevCallback" label="Back" severity="secondary" />
            <Button @click="submit(nextCallback)" label="Submit" />
          </div>
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
                <tr v-for="([entry, diff, _], i) in unitDiffInputs" :key="i">
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
              <SaveCancel
                @cancel="showUnitDiffModal = false"
                @save="createSnapshots(nextCallback)"
                save-label="Submit"
              />
            </div>
          </Dialog>
        </template>
      </StepperPanel>
      <StepperPanel header="Complete" :pt="completePanelPT">
        <template #content>
          <div class="panel-body">
            <h2 v-if="success">
              <i class="pi pi-check" style="color: var(--success-colour)"></i>
              You have successfully created a snapshot with
              <span
                v-html="
                  '<b style=&quot;color: var(--primary-color);&quot;>' +
                  pluralise(summary.num_snapshots, '</b> item')
                "
              ></span>
              for <b class="highlight">{{ summary.account }}</b> with a total value of
              <b class="highlight">{{ formatCurrency(summary.total_value.toFixed(2)) }}</b>
            </h2>
            <h2 v-else>
              <i class="pi pi-times" style="color: var(--failure-colour)"></i>
              {{ summary.account }}
            </h2>
          </div>
          <div class="button-container">
            <Button @click="restart" :label="success ? 'Create more' : 'Try again'" />
          </div>
        </template>
      </StepperPanel>
    </Stepper>
  </div>
</template>

<style scoped>
.cs-wrapper {
  margin-top: 3rem;
  margin-bottom: 3rem;
  margin-left: min(5%, 3rem);
  margin-right: min(5%, 3rem);
}
.option-grid span {
  display: inline-flex;
  align-items: center;
}
.option-container {
  display: flex;
  justify-content: center;
}
.option-grid {
  display: grid;
  grid-template-rows: auto auto;
  grid-template-columns: auto auto;
  gap: var(--inline-spacing);
}
@media screen and (max-width: 50rem) {
  .option-grid {
    grid-template-columns: auto;
  }
}
.button-container {
  margin-top: var(--inline-spacing);
  display: flex;
  justify-content: space-between;
}
.upload-container {
  display: flex;
  flex-direction: column;
}
.file-upload-target {
  text-align: center;
  margin: 1rem;
}
.input-instruction {
  margin-bottom: var(--inline-spacing);
}
.highlight {
  color: var(--primary-color);
}
.save-cancel {
  display: flex;
  column-gap: var(--inline-spacing);
  margin-top: var(--inline-spacing);
}
.modal-button {
  margin: 0.5rem;
}
.transattr-table {
  margin-top: var(--inline-spacing);
  border-left: 2px solid var(--border-colour);
  border-spacing: var(--inline-spacing);
  text-align: left;
}
.error-modal {
  display: flex;
  flex-direction: column;
  align-items: end;
  gap: var(--inline-spacing);
}
.panel-body {
  background-color: var(--surface-card);
  padding: 3rem;
}
.edit-option-container:hover {
  background-color: var(--border-colour);
}
.edit-option-container {
  width: 100%;
  padding: var(--inline-spacing);
  border: 1px solid var(--border-colour);
  display: flex;
  flex-direction: column;
  cursor: pointer;
}
.edit-option-list {
  display: flex;
  flex-direction: column;
  row-gap: var(--inline-spacing);
  min-width: 25vw;
  align-items: end;
}
</style>
<style>
.p-inputnumber input {
  width: 5em;
}
</style>
