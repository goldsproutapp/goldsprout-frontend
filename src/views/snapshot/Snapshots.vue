
<script setup lang="ts">
import Table from "@/components/Table.vue";
import {getSnapshots} from "@/lib/requests";
import {dataState} from "@/lib/state";
import router from "@/router";
import {computed, onMounted} from "vue";
onMounted(getSnapshots);
const snapshots = computed(() => dataState.snapshots_latest.map(
    (snapshot) => ({
        ...snapshot,
        stock_name: snapshot.stock?.name,
        date: snapshot.date.toLocaleDateString(),
        user_name: snapshot.user.first_name,
    })
));
const headings = {
    user_name: 'User',
    date: 'Date',
    stock_name: 'Name',
    units: 'Units',
    price: 'Price (£)',
    cost: 'Cost (£)',
    value: 'Value (£)',
    changeSinceLast: 'Change (£)',
    normalisedPerformance: 'Normalised performance (%)',
};
const styles = {
    stock_name: 'text-align: left;'
}
</script>

<template>
    <div>
        <h1>Snapshots</h1>
        <button @click="router.push('snapshots/create')">Create snapshot</button>
        <Table :headings="headings" :rows="snapshots" :styles="styles"></Table>
    </div>
</template>
