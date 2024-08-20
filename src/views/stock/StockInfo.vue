<script setup lang="ts">
import SaveCancel from '@/components/buttons/SaveCancel.vue';
import ProviderDropdown from '@/components/select/ProviderDropdown.vue';
import { getUserByID, getUserDisplayName, getStockByID } from '@/lib/data';
import {
  authenticatedRequest,
  getHoldings,
  getRegions,
  getSectors,
  getStockList
} from '@/lib/requests';
import { type Stock } from '@/lib/types';
import router from '@/router';
import Dropdown from 'primevue/dropdown';
import InputSwitch from 'primevue/inputswitch';
import Button from 'primevue/button';
import { computed, onMounted, ref } from 'vue';
import PerformanceGraph from '../performance/PerformanceGraph.vue';
import { dataState } from '@/lib/state';
import Inplace from 'primevue/inplace';
import InputText from 'primevue/inputtext';
import InputNumber from 'primevue/inputnumber';
import Dialog from 'primevue/dialog';
import StockDropdown from '@/components/select/StockDropdown.vue';
import { useToast } from 'primevue/usetoast';
import { StatusCode, statusFrom, statusText } from '@/lib/formats/responses';
import { watch } from 'vue';
import HoldingTable from '@/components/display/HoldingTable.vue';
const props = defineProps<{
  id: string;
}>();

const stock = ref<Stock | undefined | null>(undefined);
const regions = computed(() => dataState.regions);
const sectors = computed(() => dataState.sectors);

const mergeModal = ref(false);
const mergeInto = ref<Stock | null>(null);

const toast = useToast();

onMounted(async () => {
  stock.value = await getStockByID(Number.parseInt(props.id));
  stock.value = Object.assign({}, stock.value);
  getRegions(true);
  getSectors(true);
});

const holding = ref<any>(null);

watch(stock, async (v, _) => {
  if (!v) return;
  const info = dataState.stockHoldings[v.id];
  if (!info) await getHoldings(true);
  const data: any = [];
  if (!dataState.stockHoldings[v.id]) return;
  await Promise.all(
    Object.entries(dataState.stockHoldings[v.id]).map(async ([uid, { value, units }]) =>
      data.push([getUserDisplayName(await getUserByID(Number.parseInt(uid))), value])
    )
  );
  holding.value = data;
});

const save = async () => {
  const obj = stock.value as Stock;
  obj.provider_name = obj.provider.name;
  const payload = {
    stock: obj
  };
  await authenticatedRequest('/stocks', {
    method: 'PUT',
    body: JSON.stringify(payload)
  });
  dataState.stocks[dataState.stocks.findIndex((s: Stock) => s.id === obj.id)] = obj;
  if (!dataState.regions.includes(obj.region)) dataState.regions.push(obj.region);
  if (!dataState.sectors.includes(obj.sector)) dataState.sectors.push(obj.sector);
  router.push('/stocks');
};
const merge = async () => {
  mergeModal.value = false;
  if (mergeInto.value == null) {
    toast.add({
      summary: 'Error',
      detail: 'Please select a stock to merge into.',
      group: 'bl',
      severity: 'error',
      life: 2000
    });
    return;
  }
  const payload = {
    stock: stock.value?.id ?? 0, // stock can't be null if we're getting here.
    merge_into: mergeInto.value.id
  };
  const res = await authenticatedRequest('/stocks/merge', {
    method: 'POST',
    body: JSON.stringify(payload)
  });
  const status = statusFrom(res.status);
  if (status !== StatusCode.NoContent) {
    toast.add({
      summary: 'Error',
      detail: `An error occurred while attempting to merge stocks: ${statusText(status)}.`,
      group: 'bl',
      severity: 'error',
      life: 2000
    });
    return;
  }
  toast.add({
    summary: 'Success',
    detail: 'Successfully merged stocks.',
    group: 'bl',
    severity: 'success',
    life: 2000
  });
  getStockList(false).then(() => router.push('/stocks'));
};
</script>

<template>
  <div class="container" v-if="stock === null">Stock not found.</div>
  <div class="container" v-else-if="stock === undefined">Loading...</div>
  <div class="container" v-else>
    <Inplace :closable="true" class="stock-title">
      <template #display>
        {{ stock.name }}
      </template>
      <template #content>
        <InputText v-model="stock.name" autofocus class="stock-title" />
      </template>
    </Inplace>
    <div class="info-container">
      <div class="info-section">
        <span class="option-label"> Provider: </span>
        <ProviderDropdown v-model="stock.provider" />
        <span class="option-label"> Sector: </span>
        <Dropdown v-model="stock.sector" :options="sectors" editable />
        <span class="option-label"> Region: </span>
        <Dropdown v-model="stock.region" :options="regions" editable />
        <span class="option-label"> Fee: </span>
        <InputNumber
          v-model="stock.annual_fee"
          :min="0"
          :max="100"
          :max-fraction-digits="2"
          suffix="%"
        />
        <span class="option-label" style="display: flex; align-items: center">
          Needs attention:
        </span>
        <InputSwitch v-model="stock.needs_attention" style="margin-left: var(--inline-spacing)" />
        <div class="option-container control-container">
          <Button label="Merge into" severity="secondary" @click="mergeModal = true" />
        </div>
        <div class="option-container control-container">
          <SaveCancel @save="save" @cancel="router.back()" />
        </div>
      </div>
      <div class="holding-container">
        <h2>Holdings</h2>
        <HoldingTable :holdings="holding" :key-display="(x) => x" />
      </div>
    </div>
    <div class="graph-container" display="height: 100rem;">
      <PerformanceGraph :id="id" performance-type="stock" />
    </div>
    <Dialog v-model:visible="mergeModal" header="Merge stocks" modal :style="{ minWidth: '50rem' }">
      <div class="mergemodal-container">
        <span>Merge this stock into another stock, deleting this stock.</span>
        <span style="color: var(--warning-colour)">Warning: This action is irreversible.</span>
        <StockDropdown v-model="mergeInto" :exclude-ids="[stock.id]" />
        <div class="control-container option-container">
          <SaveCancel @save="merge" @cancel="mergeModal = false" save-label="Merge" />
        </div>
      </div>
    </Dialog>
  </div>
</template>

<style scoped>
.container {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  padding-left: 2rem;
  padding-right: 2rem;
  flex-grow: 1;
}

.stock-title {
  width: 100%;
  text-align: center;
}

.option-container {
  margin-top: 1rem;
}

.control-container {
  display: flex;
  column-gap: 1rem;
}

.btn {
  margin-right: 1rem;
}

.graph-container {
  flex-grow: 1;
  display: flex;
  flex-direction: column;
}

.mergemodal-container {
  display: flex;
  flex-direction: column;
  row-gap: 0.5rem;
}

.info-container {
  display: flex;
  justify-content: space-between;
  flex-direction: column;
}

@media screen and (min-width: 800px) {
  .info-container {
    flex-direction: row;
  }

  .holding-table {
    margin-right: 5rem;
  }
}
.holding-container {
  margin-left: var(--inline-spacing);
}
.info-section {
  margin: var(--inline-spacing);
  display: grid;
  grid-template-columns: auto auto;
  row-gap: 1rem;
  column-gap: 1rem;
}
.option-label {
  display: flex;
  align-items: center;
}
@media screen and (max-width: 500px) {
  .info-section {
    grid-template-columns: auto;
  }
}
</style>
