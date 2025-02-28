<script setup lang="ts">
import { formatDecimal, getAccountByID, getStockByID } from '@/lib/data';
import { accountUniqueDisplay } from '@/lib/formats/display';
import { authenticatedRequest, getAccounts, getHoldings, getStockList } from '@/lib/requests';
import { dataState } from '@/lib/state';
import type { Account } from '@/lib/types';
import Column from 'primevue/column';
import DataTable from 'primevue/datatable';
import { ref, watch } from 'vue';
import PerformanceGraph from '@/components/display/PerformanceGraph.vue';
import CountUp from '@/components/display/CountUp.vue';
import SummaryCards from '@/components/display/SummaryCards.vue';
import SummaryCard from '@/components/display/SummaryCard.vue';
import router from '@/router';
import Button from 'primevue/button';
import Menu from 'primevue/menu';
import { useConfirm } from 'primevue/useconfirm';
import { StatusCode, statusFrom, statusText } from '@/lib/formats/responses';
import { useToast } from 'primevue/usetoast';
import { clearCache } from '@/lib/cache';
import { hasWritePermFor } from '@/lib/utils';
import TabbedSection from '@/components/layout/TabbedSection.vue';
import NotFound from '../auth/NotFound.vue';

const props = defineProps<{
  accountID: number;
}>();

const account = ref<Account | null | undefined>(undefined);
const holding = ref<any>(null);
const ytd = ref(0);
const selection = ref();

const confirm = useConfirm();
const toast = useToast();

const deleteAccount = () => {
  confirm.require({
    message:
      'Are you sure that you want to permanantly delete this account and all associated data? This action is irreversible.',
    header: 'Confirm',
    icon: 'pi pi-exclamation-triangle',
    rejectLabel: 'Cancel',
    acceptLabel: 'Delete',
    acceptClass: 'p-button-danger',
    acceptIcon: 'pi pi-trash',
    rejectIcon: 'pi pi-times',
    async accept() {
      const res = await authenticatedRequest(`/accounts/${account.value?.id}`, {
        method: 'DELETE'
      });
      const status = statusFrom(res.status);
      if (status != StatusCode.NoContent) {
        toast.add({
          summary: 'Error',
          detail: `Failed to delete account: ${statusText(status)}.`,
          severity: 'error',
          life: 3000,
          group: 'bl'
        });
      } else {
        toast.add({
          summary: 'Success',
          detail: 'Successfully deleted account.',
          severity: 'success',
          life: 3000,
          group: 'bl'
        });
        clearCache();
        getAccounts(false);
        router.push('/accounts');
      }
    }
  });
};

const editMenu = ref([
  {
    label: 'Options',
    items: [
      {
        label: 'Edit',
        icon: 'pi pi-pencil',
        disabled: true
      },
      {
        label: 'Delete',
        icon: 'pi pi-trash',
        command: deleteAccount
      }
    ]
  }
]);
const editMenuRef = ref();
const toggleOptionsMenu = (evt: any) => editMenuRef.value.toggle(evt);

watch(
  props,
  async ({ accountID }, _) => {
    if (accountID !== undefined) {
      getAccountByID(accountID).then((result) => (account.value = result ? result : null));
      getStockList(true).then(() =>
        getHoldings(true).then(async () => {
          if (account.value !== null) {
            const data: any = [];
            await Promise.all(
              Object.entries(dataState.accountHoldings[accountID])
                .filter(([_, { units }]) => units != '0')
                .map(async ([id, { value, units }]) =>
                  data.push({
                    stock: await getStockByID(Number.parseInt(id), false),
                    value: value,
                    units: units
                  })
                )
            );
            holding.value = data;
          }
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
  <div v-if="account === undefined">Loading...</div>
  <NotFound v-else-if="account === null" message="This account could not be found" />
  <div v-else class="container">
    <div class="header">
      <h1>{{ accountUniqueDisplay(account) }}</h1>
      <Button
        type="button"
        outlined
        icon="pi pi-ellipsis-v"
        @click="toggleOptionsMenu"
        v-if="hasWritePermFor(account.user_id)"
      />
      <Menu ref="editMenuRef" id="options_menu" :model="editMenu" popup />
    </div>
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
        <template #title>Holdings</template>
        <template #content>{{ account.stock_count || '0' }}</template>
      </SummaryCard>
    </SummaryCards>
    <TabbedSection :tabs="['holdings', 'performance']">
      <template #holdings>
        <DataTable
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
      </template>
      <template #performance>
        <div class="graph-container">
          <PerformanceGraph
            performance-type="account"
            :id="accountID.toString()"
            @ytd="(x) => (ytd = x)"
          />
        </div>
      </template>
    </TabbedSection>
  </div>
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
.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
</style>
<style>
.p-datatable-wrapper {
  border-radius: var(--border-radius);
}
</style>
