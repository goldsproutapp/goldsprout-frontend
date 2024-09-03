<script setup lang="ts">
import { formatDecimal, getAccountByID, getStockByID } from '@/lib/data';
import { accountUniqueDisplay } from '@/lib/formats/display';
import { getHoldings, getStockList } from '@/lib/requests';
import { dataState } from '@/lib/state';
import type { Account } from '@/lib/types';
import Column from 'primevue/column';
import DataTable from 'primevue/datatable';
import { ref, watch } from 'vue';
import PerformanceGraph from '../performance/PerformanceGraph.vue';
import TabMenu from 'primevue/tabmenu';
import CountUp from '@/components/display/CountUp.vue';
import SummaryCards from '@/components/display/SummaryCards.vue';
import SummaryCard from '@/components/display/SummaryCard.vue';
import router from '@/router';

const props = defineProps<{
  accountID: number;
}>();

const account = ref<Account | null>(null);
const holding = ref<any>(null);
const ytd = ref(0);
const selection = ref();

const menu = ref([
  {
    label: 'Holdings'
  },
  {
    label: 'Performance'
  }
]);
const menuIdx = ref(0);

watch(
  props,
  async ({ accountID }, _) => {
    if (accountID !== undefined) {
      getAccountByID(accountID).then((result) => (account.value = result ? result : account.value));
      getStockList(true).then(() =>
        getHoldings(true).then(async () => {
          const data: any = [];
          await Promise.all(
            Object.entries(dataState.accountHoldings[accountID]).map(
              async ([id, { value, units }]) =>
                data.push({
                  stock: await getStockByID(Number.parseInt(id), false),
                  value: value,
                  units: units
                })
            )
          );
          holding.value = data;
        })
      );
    }
  },
  {
    immediate: true
  }
);
</script>

<template>
  <div v-if="account !== null" class="container">
    <h1>{{ accountUniqueDisplay(account) }}</h1>
    <SummaryCards>
      <SummaryCard>
        <template #title>Value </template>
        <template #content>
          £
          <CountUp :value="parseFloat(account.value)" :duration="750" :decimal-precision="2" />
        </template>
      </SummaryCard>
      <SummaryCard>
        <template #title>YTD</template>
        <template #content
          ><CountUp
            :value="ytd"
            :duration="750"
            :decimal-precision="2"
            v-if="ytd"
            :format="(v, d) => `${formatDecimal(v.toFixed(d))}%`"
            :coloured="true"
        /></template>
      </SummaryCard>
      <SummaryCard>
        <template #title>Stocks</template>
        <template #content>{{ account.stock_count }}</template>
      </SummaryCard>
    </SummaryCards>
    <TabMenu
      :model="menu"
      v-model:activeIndex="menuIdx"
      style="margin-left: var(--inline-spacing)"
    />
    <DataTable
      v-if="menuIdx == 0"
      :value="holding"
      class="table"
      selection-mode="single"
      v-model:selection="selection"
      @row-select="(row) => router.push(`/stocks/${row.data.stock.id}`)"
    >
      <Column header="Stock" field="stock.name" sortable></Column>
      <Column
        header="Holding"
        :field="({ value }) => `£${formatDecimal(value)}`"
        sortable
        data-type="numeric"
        sort-field="value"
      ></Column>
      <Column
        header="Units"
        :field="({ units }) => formatDecimal(units)"
        sortable
        data-type="numeric"
        sort-field="units"
      ></Column>
    </DataTable>
    <div class="graph-container" v-show="menuIdx == 1">
      <PerformanceGraph
        performance-type="account"
        :id="accountID.toString()"
        @ytd="(x) => (ytd = x)"
      />
    </div>
  </div>
  <div v-else></div>
</template>

<style scoped>
.graph-container {
  flex-grow: 1;
  display: flex;
  flex-direction: column;
}
.container {
  width: 100%;
  min-height: 100%;
  display: flex;
  flex-direction: column;
  padding-left: 2rem;
  padding-right: 2rem;
  flex-grow: 1;
}
.info-span {
  font-size: large;
  margin-bottom: 1rem;
}
.table {
  margin: var(--inline-spacing);
}
</style>
<style>
.p-datatable-wrapper {
  border-radius: var(--border-radius);
}
</style>
