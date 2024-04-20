<script setup lang="ts">
import CountUp from '@/components/display/CountUp.vue';
import {getOverview} from '@/lib/requests';
import type {Overview} from '@/lib/types';
import Card from 'primevue/card';
import {onMounted, ref} from 'vue';
import PerformanceGraph from './performance/PerformanceGraph.vue';

const overview = ref<Overview | null>();

onMounted(() => getOverview().then(res => overview.value = res));

</script>

<template>
    <div class="container">
        <h1>Overview</h1>
        <div v-if="overview != null" class="overview">
            <div class="summary-cards">
                <Card class="summary-card">
                    <template #title>
                        Portfolio value
                    </template>
                    <template #content>
                        <h1>
                            <b>
                                £
                                <CountUp :value="parseFloat(overview.total_value)" :duration="750" :decimal-precision="2" />
                            </b>
                        </h1>
                    </template>
                </Card>
                <Card class="summary-card">
                    <template #title>
                        All time
                    </template>
                    <template #content>
                        <h1>
                            <b v-if="overview.all_time_change[0] == '-'" style="color: var(--text-colour-negative)">
                                -£
                                <CountUp :value="parseFloat(overview.all_time_change.slice(1))" :duration="750"
                                    :decimal-precision="2" />
                            </b>
                            <b v-else style="color: var(--text-colour-positive)">
                                +£
                                <CountUp :value="parseFloat(overview.all_time_change)" :duration="1000"
                                    :decimal-precision="2" />
                            </b>
                        </h1>
                    </template>
                </Card>
                <Card class="summary-card">
                    <template #title>
                        Last snapshot
                    </template>
                    <template #content>
                        <h1>
                            <b>{{ overview.last_snapshot.toLocaleDateString() }}</b>
                        </h1>
                    </template>
                </Card>
            </div>
            <div class="graph-container">
                <PerformanceGraph id="" performance-type="portfolio" style="flex-grow: 1;"/>
            </div>
        </div>
    </div>
</template>

<style scoped>
.container, .overview {
    flex-grow: 1;
    display: flex;
    flex-direction: column;
}
.summary-cards {
    display: flex;
    flex-wrap: wrap;
}

.summary-card {
    margin: var(--inline-spacing);
    min-width: 20rem;
}
</style>
<style>
.p-card-content {
    padding: 0;
}
.graph-container {
    flex-grow: 1;
    display: flex;
    flex-direction: column;
    border-radius: var(--border-radius);
    padding: 1rem;
    margin: var(--inline-spacing);
    background-color: var(--surface-card);
}
</style>
