<script setup lang="ts">
import Button from "@/components/buttons/Button.vue";
import Table from "@/components/Table.vue";
import {getProviderList} from "@/lib/requests";
import {dataState} from "@/lib/state";
import router from "@/router";
import {computed, onMounted} from "vue";
onMounted(getProviderList);
const providers = computed(() => dataState.providers);
const headings = {
    name: 'Name',
    csv_format: 'Snapshot format',
};
const styles = {
    name: 'text-align: left;'
}
const clickHandler = (row: any) => {
    router.push(`/providers/${row.id}`);
}
</script>

<template>
    <div>
        <h1>Snapshots</h1>
        <Button @click="router.push('providers/create')">Create provider</Button>
        <Table :headings="headings" :rows="providers" :styles="styles" :clickHandler="clickHandler"></Table>
    </div>
</template>
