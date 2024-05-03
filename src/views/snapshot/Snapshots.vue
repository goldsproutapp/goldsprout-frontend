
<script setup lang="ts">
import {getSnapshots} from "@/lib/requests";
import {dataState} from "@/lib/state";
import router from "@/router";
import Button from "primevue/button";
import Column from "primevue/column";
import DataTable from "primevue/datatable";
import ProgressSpinner from "primevue/progressspinner";
import {computed, onMounted, ref} from "vue";

const snapshots = computed(() => dataState.snapshots_latest.map(
    (snapshot) => ({
        ...snapshot,
        stock_name: snapshot.stock?.name,
        date: snapshot.date.toLocaleDateString(),
        user_name: snapshot.user.first_name,
    })
));
const loading = ref(true);
onMounted(() => {
    loading.value = snapshots.value.length == 0;
    getSnapshots().then(() => loading.value = false)
});
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
</script>

<template>
    <div>
        <h1>Snapshots</h1>
        <Button class="create-button" label="Create snapshot" severity="primary" @click="router.push('snapshots/create')" />
        <DataTable :value="snapshots" :loading="loading">
            <template #empty v-if="!loading">No snapshots found.</template>
            <template #loading>
                <ProgressSpinner />
            </template>
            <Column v-for="[key, display] in Object.entries(headings)" :key="key" :field="key" :header="display" sortable></Column>
        </DataTable>
    </div>
</template>

<style scoped>
.create-button {
    margin-bottom: 1rem;
}
</style>
