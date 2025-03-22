<script setup lang="ts">
import OptionFilterLayout from '@/components/layout/OptionFilterLayout.vue';
import PerformanceFilter from '@/components/select/PerformanceFilter.vue';
import { PAGINATOR_PAGE_OPTIONS, TransactionAttributionMap } from '@/lib/constants';
import { formatCurrency, formatDecimal, getAccountByID, getStockByID } from '@/lib/data';
import { accountUniqueDisplay } from '@/lib/formats/display';
import { isSuccessful, statusFrom } from '@/lib/formats/responses';
import { clickColumnPT } from '@/lib/pt';
import {
  authenticatedRequest,
  getAccounts,
  getProviderList,
  getStockList,
  getUsers
} from '@/lib/requests';
import Button from 'primevue/button';
import Calendar from 'primevue/calendar';
import Column from 'primevue/column';
import DataTable from 'primevue/datatable';
import Divider from 'primevue/divider';
import Tag from 'primevue/tag';
import Skeleton from 'primevue/skeleton';
import { computed, onActivated, ref, watch, type StyleValue } from 'vue';
import { useRouter } from 'vue-router';
import { TransactionAttribution } from '@/lib/types';
import Dropdown from 'primevue/dropdown';
import { usePresets } from '@/lib/service/presets';
import PresetSelector from '@/components/select/PresetSelector.vue';
import TabView from 'primevue/tabview';
import TabPanel from 'primevue/tabpanel';
import { initialTransactionFilter } from '@/lib/filters/transactions';
import IconField from 'primevue/iconfield';
import InputIcon from 'primevue/inputicon';
import InputText from 'primevue/inputtext';
import MultiSelect from 'primevue/multiselect';
import InputNumber from 'primevue/inputnumber';
import { useMinimumLoading } from '@/lib/service/loading';

const startDate = ref<Date | null>(null);
const periodOpts = ['Annual', 'Monthly'];
const report = ref<any>(null);
const periods = ref<any>([]);
const transactions = ref<any[]>([]);
const router = useRouter();
const filters = ref(initialTransactionFilter());
const dateFormats: { [key: string]: string } = {
  Annual: 'yy',
  Monthly: 'MM yy'
};
const dateSelectionTypes: { [key: string]: 'year' | 'month' | 'date' } = {
  Annual: 'year',
  Monthly: 'month'
};

const presets = usePresets(
  'reports',
  () => ({
    period: periodOpts[0],
    startDate: null as null | number,
    filters: {} as { [key: string]: string }
  }),
  {
    onChange: () => {
      setFilter();
      update();
    }
  }
);
watch(
  startDate,
  (v) => (presets.selectedData.value.startDate = v ? Math.floor(v.getTime() / 1000) : v)
);

const filter = ref();
const setFilter = () => {
  if (filter.value) filter.value.setFilter(presets.selectedData.value.filters);
  if (presets.selectedData.value.startDate)
    startDate.value = new Date(presets.selectedData.value.startDate * 1000);
};

const gridStyle = computed<StyleValue>(() => ({
  gridTemplateColumns: report.value
    ? Object.keys(periods.value)
        .map((_) => 'auto')
        .join(' ')
    : 'auto'
}));

const loading = useMinimumLoading();

const update = async () => {
  loading.enter();
  transactions.value = [];
  report.value = null;
  const query = new URLSearchParams();
  Object.entries(presets.selectedData.value.filters).forEach(([key, value]) =>
    query.set(key, value)
  );
  query.set('period', presets.selectedData.value.period.toLowerCase());
  if (startDate.value !== null)
    query.set('filter_ignore_before', Math.floor(startDate.value.getTime() / 1000).toString());
  const res = await authenticatedRequest(`/report?${query.toString()}`);
  if (isSuccessful(statusFrom(res.status))) {
    const json = await res.json();
    const trans_out: any[] = [];
    const all_trans = json.data.report.Total.transactions;
    await Promise.all(
      all_trans.map(async (trans: any) =>
        trans_out.push({
          ...trans,
          account: await getAccountByID(trans.account_id, false),
          stock: await getStockByID(trans.stock_id, false),
          date_string: new Date(trans.date).toLocaleDateString(),
          tag: TransactionAttributionMap[trans.attribution][`name_${trans.value.charAt(0) != '-'}`]
        })
      )
    );
    loading.exit(() => {
      transactions.value = trans_out;
      report.value = json.data.report;
      periods.value = json.data.periods;
    });
  }
};
onActivated(() => {
  Promise.all([getUsers(true), getProviderList(true), getAccounts(true), getStockList(true)]).then(
    update
  );
});
const TAG_SEVERITY = {
  [TransactionAttributionMap[TransactionAttribution.BuySell].name_true]: 'info',
  [TransactionAttributionMap[TransactionAttribution.BuySell].name_false]: 'warning',
  [TransactionAttributionMap[TransactionAttribution.IncomeFee].name_true]: 'success',
  [TransactionAttributionMap[TransactionAttribution.IncomeFee].name_false]: 'danger'
};
</script>

<template>
  <OptionFilterLayout>
    <template #header>
      <h1 class="title">Reports</h1>
    </template>
    <template #options>
      <div class="option-container">
        <span>
          Generate
          <Dropdown :options="periodOpts" v-model="presets.selectedData.value.period" />
          report from
          <Calendar
            :manual-input="false"
            placeholder="beginning"
            v-model="startDate"
            :date-format="dateFormats[presets.selectedData.value.period]"
            selection-mode="single"
            :view="dateSelectionTypes[presets.selectedData.value.period]"
            show-button-bar
          >
            <template #inputicon> test </template>
          </Calendar>
          <Button
            style="margin-left: 1rem"
            type="button"
            label="Generate"
            severity="primary"
            @click="update"
          />
        </span>
        <PresetSelector :presets="presets" />
      </div>
    </template>
    <template #filter>
      <PerformanceFilter
        v-model="presets.selectedData.value.filters"
        upper-date-only
        @update="update"
        ref="filter"
      />
    </template>
    <template #body>
      <TabView>
        <TabPanel header="Summary">
          <div class="summary-container">
            <div class="summary-labels">
              <span>&nbsp;</span>
              <Divider class="divider" />
              <span class="summary-label">Start value</span>
              <span class="summary-label">End value</span>
              <b class="summary-label">
                <span>Gross change</span>
              </b>
              <Divider class="divider" />
              <span class="summary-label">Total purchases</span>
              <span class="summary-label">Total sales</span>
              <b class="summary-label">
                <span>Net cashflow</span>
              </b>
              <Divider class="divider" />
              <span class="summary-label">Expected fees</span>
              <span class="summary-label">Fees paid</span>
              <Divider class="divider" />
              <span class="summary-label">Income</span>
              <span class="summary-label">Gain/loss</span>
              <Divider class="divider" />
              <span class="summary-label">Snapshot count</span>
            </div>
            <div class="summary-table" :style="gridStyle">
              <b v-for="p in periods" v-if="!loading.loading">{{ p }}</b>
              <Skeleton class="skeleton" v-else width="100%" height="1rem"></Skeleton>
              <Divider class="divider" />
              <span v-if="!loading.loading" v-for="p in periods">{{
                formatCurrency(report[p].start_value)
              }}</span>
              <Skeleton class="skeleton" v-else width="100%" height="1rem"></Skeleton>
              <span v-if="!loading.loading" v-for="p in periods">{{
                formatCurrency(report[p].end_value)
              }}</span>
              <Skeleton class="skeleton" v-else width="100%" height="1rem"></Skeleton>
              <b v-for="p in periods" v-if="!loading.loading">
                <span>{{ formatCurrency(report[p].gross_change) }}</span>
              </b>
              <Skeleton class="skeleton" v-else width="100%" height="1rem"></Skeleton>

              <Divider class="divider" />
              <span v-if="!loading.loading" v-for="p in periods">{{
                formatCurrency(report[p].purchase_total)
              }}</span>
              <Skeleton class="skeleton" v-else width="100%" height="1rem"></Skeleton>
              <span v-if="!loading.loading" v-for="p in periods">{{
                formatCurrency(report[p].sell_total)
              }}</span>
              <Skeleton class="skeleton" v-else width="100%" height="1rem"></Skeleton>
              <b v-for="p in periods" v-if="!loading.loading">
                <span>{{ formatCurrency(report[p].net_cashflow) }}</span>
              </b>
              <Skeleton class="skeleton" v-else width="100%" height="1rem"></Skeleton>

              <Divider class="divider" />
              <span v-if="!loading.loading" v-for="p in periods">{{
                formatCurrency(report[p].expected_fees)
              }}</span>
              <Skeleton class="skeleton" v-else width="100%" height="1rem"></Skeleton>
              <span v-if="!loading.loading" v-for="p in periods">{{
                formatCurrency(report[p].total_fee_paid)
              }}</span>
              <Skeleton class="skeleton" v-else width="100%" height="1rem"></Skeleton>

              <Divider class="divider" />
              <span v-if="!loading.loading" v-for="p in periods">{{
                formatCurrency(report[p].total_income)
              }}</span>
              <Skeleton class="skeleton" v-else width="100%" height="1rem"></Skeleton>
              <span v-if="!loading.loading" v-for="p in periods">{{
                formatCurrency(report[p].total_gain)
              }}</span>
              <Skeleton class="skeleton" v-else width="100%" height="1rem"></Skeleton>

              <Divider class="divider" />
              <span v-if="!loading.loading" v-for="p in periods">{{
                report[p].snapshot_count.toString()
              }}</span>
              <Skeleton class="skeleton" v-else width="100%" height="1rem"></Skeleton>
            </div>
          </div>
        </TabPanel>
        <TabPanel header="Transactions">
          <DataTable
            :value="transactions"
            sort-mode="single"
            :sort-order="0"
            removable-sort
            class="transaction-table"
            :loading="loading.loading"
            paginator
            :rows="PAGINATOR_PAGE_OPTIONS[0]"
            :rows-per-page-options="PAGINATOR_PAGE_OPTIONS"
            v-model:filters="filters"
            :global-filter-fields="['stock.name']"
            filter-display="menu"
          >
            <template #empty> No transactions found. </template>

            <template #header>
              <div class="table-header">
                <Button
                  icon="pi pi-filter-slash"
                  label="Clear"
                  outlined
                  @click="filters = initialTransactionFilter()"
                />
                <IconField icon-position="left">
                  <InputIcon>
                    <i class="pi pi-search" />
                  </InputIcon>
                  <!-- @vue-expect-error I don't know how to convince the 
                        compiler that filters.global does have a property 'value'
                    -->
                  <InputText v-model="filters.global.value" placeholder="Quick search" />
                </IconField>
              </div>
            </template>
            <Column
              header="Type"
              sortable
              field="tag"
              filter-field="tag"
              :show-filter-match-modes="false"
            >
              <template #filter="{ filterModel }">
                <MultiSelect v-model="filterModel.value" :options="Object.keys(TAG_SEVERITY)" />
              </template>
              <template #body="{ data }">
                <Tag :value="data.tag" :severity="TAG_SEVERITY[data.tag]" />
              </template>
            </Column>
            <Column header="Date" field="date_string" sort-field="date" sortable />
            <Column
              header="Account"
              :pt="clickColumnPT"
              filter-field="account.id"
              show-filter-options
              :show-filter-match-modes="false"
              filter-menu-class="filter-menu"
            >
              <template #filter="{ filterModel }">
                <MultiSelect
                  filter
                  v-model="filterModel.value"
                  :options="[...new Set(transactions.map((t) => t.account))]"
                  :option-label="accountUniqueDisplay"
                  option-value="id"
                  placeholder="Any"
                />
              </template>
              <template #body="{ data }">
                <div class="click-cell" @click="router.push(`/accounts/${data.account_id}`)">
                  {{ accountUniqueDisplay(data.account) }}
                </div>
              </template>
            </Column>
            <Column header="Stock" :pt="clickColumnPT">
              <template #body="{ data }">
                <div class="click-cell" @click="router.push(`/stocks/${data.stock_id}`)">
                  {{ data.stock.name }}
                </div>
              </template>
            </Column>
            <Column
              header="Value"
              :field="({ value }) => formatCurrency(value)"
              sortable
              data-type="numeric"
              filter-field="value"
            >
              <template #filter="{ filterModel }">
                <InputNumber
                  v-model="filterModel.value"
                  mode="decimal"
                  :max-fraction-digits="2"
                  prefix="£"
                />
              </template>
            </Column>
            <Column header="Units" :field="({ units }) => formatDecimal(units)" />
            <Column
              header="Value after"
              :field="({ value_after }) => `£${formatDecimal(value_after)}`"
            />
          </DataTable>
        </TabPanel>
      </TabView>
    </template>
  </OptionFilterLayout>
</template>

<style scoped>
.summary-container {
  display: flex;
}
.summary-table {
  flex-grow: 1;
}
.summary-table,
.summary-labels {
  display: grid;
  row-gap: var(--inline-spacing);
  column-gap: calc(var(--inline-spacing) * 2);
  margin: var(--inline-spacing);
  padding-top: var(--inline-spacing);
  /* keep the scrollbar out of the way */
  padding-bottom: calc(var(--inline-spacing) * 2);
  overflow-x: scroll;
}
.summary-labels {
  flex-shrink: 0;
}
.loading {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
}
.transaction-table {
  margin: var(--inline-spacing);
}
.divider {
  grid-column: 1/-1;
}
.loading-bar {
  height: 6px;
  margin-left: var(--inline-spacing);
  margin-bottom: var(--inline-spacing);
}
.summary-label {
  align-self: start;
  position: sticky;
}
.option-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 1rem;
}
.summary-table span,
.summary-table b {
  text-wrap: nowrap;
}

.table-header {
  display: flex;
  justify-content: space-between;
}
@media screen and (max-width: 500px) {
  .table-header {
    flex-direction: column;
    row-gap: var(--inline-spacing);
    align-items: start;
  }
}
</style>
