
<script setup lang="ts">
import {dataState} from "@/lib/state";
import router from "@/router";
import {getHoldings, getRegions, getSectors, getStockList} from "@/lib/requests";
import {computed, onMounted, ref, watch} from "vue";
import DataTable from "primevue/datatable";
import Column from "primevue/column";
import InfoIcon from "@/components/icons/InfoIcon.vue";
import ProgressSpinner from "primevue/progressspinner";
import type {Stock} from "@/lib/types";
import {initialStockFilter} from "@/lib/presets/filters";
import InputText from "primevue/inputtext";
import MultiSelect from "primevue/multiselect";
import InputNumber from "primevue/inputnumber";
import IconField from "primevue/iconfield";
import InputIcon from "primevue/inputicon";
import Button from "primevue/button";

const loading = ref(true);
const stocks = computed(() => dataState.stocks);
onMounted(() => {
    loading.value = stocks.value.length == 0;
    getStockList().then(() => loading.value = false)
    getHoldings();
    getRegions();
    getSectors();
});
const selection = ref();
watch(selection, () => selection.value = null); // don't highlight the 'selection', we just want to identify a click.
const calculateFee = (x: Stock) => ((x.annual_fee ?? 0) + (x.provider.annual_fee ?? 0)).toFixed(2);

const filters = ref(initialStockFilter());
const resetFilter = () => filters.value = initialStockFilter();
const filterFields = computed(() => Object.keys(filters.value));

</script>

<template>
    <div>
        <h1>Stocks</h1>
        <DataTable filter-display="menu" v-model:filters="filters" :global-filter-fields="filterFields" :value="stocks"
            data-key="id" selection-mode="single" v-model:selection="selection"
            @row-select="row => router.push(`/stocks/${row.data.id}`)" removable-sort :loading="loading">
            <template #empty>No stocks found.</template>
            <template #loading>
                <ProgressSpinner />
            </template>
            <template #header>
                <div class="table-header">
                    <Button icon="pi pi-filter-slash" label="Clear" outlined @click="resetFilter" />
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
            <Column header="Provider" field="provider_name" :show-filter-match-modes="false">
                <template #body="{data}">
                    {{ data.provider_name }}
                </template>
                <template #filter="{filterModel}">
                    <MultiSelect v-model="filterModel.value" :options="dataState.providers.map(x => x.name)"
                        placeholder="Any">
                    </MultiSelect>
                </template>
            </Column>
            <Column header="Name" field="name">
                <template #body="{data}">
                    {{ data.name }}
                </template>
                <template #filter="{filterModel}">
                    <InputText v-model="filterModel.value" type="text" placeholder="Search by name" />
                </template>
            </Column>
            <Column header="Region" field="region" :show-filter-match-modes="false">
                <template #body="{data}">
                    {{ data.region }}
                </template>
                <template #filter="{filterModel}">
                    <MultiSelect v-model="filterModel.value" :options="dataState.regions" placeholder="Any" filter>
                    </MultiSelect>
                </template>
            </Column>
            <Column header="Sector" field="sector" :show-filter-match-modes="false">
                <template #body="{data}">
                    {{ data.sector }}
                </template>
                <template #filter="{filterModel}">
                    <MultiSelect v-model="filterModel.value" :options="dataState.sectors" placeholder="Any" filter>
                    </MultiSelect>
                </template>
            </Column>
            <Column header="Fee" field="total_fee" data-type="numeric" sortable :sort-field="calculateFee">
                <template #body="{data}">
                    {{ data.total_fee.toFixed(2) }}%
                </template>
                <template #filter="{filterModel}">
                    <InputNumber v-model="filterModel.value" mode="decimal" :max-fraction-digits="2" :min="0" :max="100"
                        suffix="%" />
                </template>
            </Column>
            <Column sortable :sort-field="x => (x.needs_attention ?? false).toString()">
                <template #body="row">
                    <InfoIcon v-if="row.data.needs_attention" preset="attention" />
                </template>
            </Column>
        </DataTable>
    </div>
</template>

<style scoped>
tr {
    border-bottom: 1px solid white;
}

.stock-table {
    width: 100%;
    border-collapse: collapse;
}

.stock-row {
    cursor: pointer;
}

.stock-row:hover {
    background-color: blue;
}

.table-header {
    display: flex;
    justify-content: space-between;
}
</style>

