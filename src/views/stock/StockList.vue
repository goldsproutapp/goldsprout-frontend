
<script setup lang="ts">
import {dataState} from "@/lib/state";
import router from "@/router";
import {getStockList} from "@/lib/requests";
import {computed, onMounted} from "vue";
import Table from "@/components/Table.vue";

const headings = {
    name: 'Name',
    provider_name: 'Provider',
    sector: 'Sector',
    region: 'Region',
    stock_code: 'Code',
};
const stocks = computed(() => dataState.stocks);
onMounted(getStockList);

const styles = {};

const clickHandler = (row: any) => router.push(`/stocks/${row.id}`);

</script>

<template>
    <div>
        <h1>Stocks</h1>
        <Table :headings="headings" :rows="stocks" :styles="styles" :click-handler="clickHandler"></Table>
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

