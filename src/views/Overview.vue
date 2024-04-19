<script setup lang="ts">
import CountUp from '@/components/display/CountUp.vue';
import {formatDecimal, pluralise} from '@/lib/data';
import {getOverview} from '@/lib/requests';
import type {Overview} from '@/lib/types';
import Card from 'primevue/card';
import {onMounted, ref} from 'vue';

const overview = ref<Overview | null>();

onMounted(() => getOverview().then(res => overview.value = res));

</script>

<template>
    <div>
        <h1>Overview</h1>
        <div v-if="overview != null">
            <div class="summary-cards">
                <Card class="summary-card">
                    <template #title>
                        Portfolio value
                    </template>
                    <template #content>
                        <h1>
                            <b>
                                £<CountUp :value="parseFloat(overview.total_value)" :duration="750" :decimal-precision="2"/>
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
                                -£<CountUp :value="parseFloat(overview.all_time_change.slice(1))" :duration="750" :decimal-precision="2" />
                            </b>
                            <b v-else style="color: var(--text-colour-positive)">
                                +£<CountUp :value="parseFloat(overview.all_time_change)" :duration="1000" :decimal-precision="2" />
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
            <div v-if="overview.users">
                <br>
                You also have access to the following users:
                <ul>
                    <li v-for="[uid, info] in Object.entries(overview.users)">
                        {{ info.name }} with
                        £{{ formatDecimal(info.total_value) }}
                        between
                        {{ pluralise(info.num_stocks, 'stock') }}
                        across
                        {{ pluralise(info.num_providers, 'provider') }}
                        (last snapshot {{ info.last_snapshot.toLocaleDateString() }}).
                    </li>
                </ul>
            </div>
        </div>
    </div>
</template>

<style scoped>
.summary-cards {
    display: flex;
    flex-wrap: wrap;
}

.summary-card {
    margin: 1rem;
    min-width: 20rem;
}
</style>
<style>
.p-card-content {
    padding: 0;
}
</style>
