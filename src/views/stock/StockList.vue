
<script setup lang="ts">
import {dataState} from "@/lib/state";
import router from "@/router";
import {getStockList} from "@/lib/requests";
import {computed, onMounted, ref} from "vue";
import DataTable from "primevue/datatable";
import Column from "primevue/column";
import InfoIcon from "@/components/icons/InfoIcon.vue";
import ProgressSpinner from "primevue/progressspinner";

const headings = {
    name: 'Name',
    provider_name: 'Provider',
    sector: 'Sector',
    region: 'Region',
};
const loading = ref(true);
const stocks = computed(() => dataState.stocks);
onMounted(() => {
    loading.value = stocks.value.length == 0;
    getStockList().then(() => loading.value = false)
});
const selection = ref();

</script>

<template>
    <div>
        <h1>Stocks</h1>
        <DataTable :value="stocks" data-key="id" selection-mode="single" v-model:selection="selection"
            @row-select="row => router.push(`/stocks/${row.data.id}`)" removable-sort :loading="loading">
            <template #empty>No stocks found.</template>
            <template #loading>
                <ProgressSpinner />
            </template>
            <Column v-for="[key, display] in Object.entries(headings)" :key="key" :header="display" :field="key" sortable>
            </Column>
            <Column>
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
</style>

