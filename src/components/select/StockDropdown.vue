<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { stocks } from '@/lib/data';
import { type Stock } from '@/lib/types';
import Dropdown from 'primevue/dropdown';

const allStocks = ref<Stock[]>([]);
const label = (stock: Stock) => `${stock.name} (${stock.provider_name})`;
const stockList = computed(() =>
  allStocks.value.filter(({ id }) => !props.excludeIds.includes(id))
);

onMounted(async () => {
  allStocks.value = await stocks();
});
const props = withDefaults(
  defineProps<{
    excludeIds: number[];
  }>(),
  {
    excludeIds: () => []
  }
);

const model = defineModel();
</script>
<template>
  <Dropdown
    v-model="model"
    :options="stockList"
    :option-label="label"
    placeholder="Stock"
    filter
    class="w-full md:w-14rem"
  />
</template>
