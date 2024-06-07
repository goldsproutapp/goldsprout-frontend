
<script setup lang="ts">
import {dataState} from "@/lib/state";
import router from "@/router";
import {getHoldings, getRegions, getSectors, getStockList, getUsers} from "@/lib/requests";
import {computed, onMounted, ref, watch} from "vue";
import DataTable from "primevue/datatable";
import Column from "primevue/column";
import InfoIcon from "@/components/icons/InfoIcon.vue";
import ProgressSpinner from "primevue/progressspinner";
import type {Stock, User} from "@/lib/types";
import {initialStockFilter} from "@/lib/filters/stocks";
import InputText from "primevue/inputtext";
import MultiSelect from "primevue/multiselect";
import InputNumber from "primevue/inputnumber";
import IconField from "primevue/iconfield";
import InputIcon from "primevue/inputicon";
import Button from "primevue/button";
import SelectButton from "primevue/selectbutton";
import {getCachedUser, getUserDisplayName} from "@/lib/data";
import {CustomFilter} from "@/lib/filters/methods";
import Tooltip from "@/components/layout/Tooltip.vue";

const loading = ref(true);
const stocks = computed(() => dataState.stocks);
onMounted(() => {
    loading.value = stocks.value.length == 0;
    getStockList().then(() => loading.value = false)
    getHoldings();
    getRegions();
    getSectors();
    getUsers();
});
const selection = ref();
watch(selection, () => selection.value = null); // don't highlight the 'selection', we just want to identify a click.
const calculateFee = (x: Stock) => ((x.annual_fee ?? 0) + (x.provider.annual_fee ?? 0)).toFixed(2);

const filters = ref(initialStockFilter());
const resetFilter = () => filters.value = initialStockFilter();
const filterFields = computed(() => Object.keys(filters.value));
const heldByMatchMode = ref<'Any' | 'All'>('Any');

watch(heldByMatchMode, (value, _) => {
    // @ts-expect-error the type system for the filters object is a bit of a mess.
    filters.value.users.matchMode = value == 'Any' ?
        CustomFilter.INCLUDES_ANY : CustomFilter.INCLUDES_ALL;
});
const filterAnyone = (filterModel: any) => {
    heldByMatchMode.value = 'Any';
    // @ts-expect-error the type system for the filters object is a bit of a mess.
    filters.value.users.value = dataState.users.map(x => x.id);
};

const filterNobody = (filterModel: any) => {
    filterModel.value = [-1];
};

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
            <Column header="Provider" field="provider_name" :show-filter-match-modes="false"
                filter-menu-class="filter-menu">
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
            <Column header="Region" field="region" :show-filter-match-modes="false" filter-menu-class="filter-menu">
                <template #body="{data}">
                    {{ data.region }}
                </template>
                <template #filter="{filterModel}">
                    <MultiSelect v-model="filterModel.value" :options="dataState.regions" placeholder="Any" filter>
                    </MultiSelect>
                </template>
            </Column>
            <Column header="Sector" field="sector" :show-filter-match-modes="false" filter-menu-class="filter-menu">
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
            <Column header="Held by" field="users" :show-filter-match-modes="false" filter-menu-class="filter-menu">
                <template #body="{data}">
                    <Tooltip position="left" :content="data.users.map(getCachedUser).map(getUserDisplayName).join(', ')"
                        v-if="data.users.length">
                        <i class="pi pi-users" />
                    </Tooltip>
                </template>
                <template #filter="{filterModel}">
                    <SelectButton :options="['Any', 'All']" v-model="heldByMatchMode" />
                    <div style="margin-bottom: 1rem;"></div>
                    <Button label="Anyone" @click="filterAnyone(filterModel)" />
                    <div style="margin-bottom: 1rem;"></div>
                    <Button label="Nobody" @click="filterNobody(filterModel)" severity="danger" />
                    <div style="margin-bottom: 1rem;"></div>
                    <MultiSelect v-if="filterModel.value === null || filterModel.value[0] !== -1"
                        v-model="filterModel.value" :options="dataState.users" :option-label="getUserDisplayName"
                        option-value="id" placeholder="Any" filter>
                    </MultiSelect>
                </template>
            </Column>
            <Column sortable :sort-field="x => (x.needs_attention ?? false).toString()">
                <template #body="row">
                    <InfoIcon v-if="row.data.needs_attention" preset="attention" tooltip-position="left" />
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
<style>
.filter-menu {
    max-width: 14rem;
}
</style>

