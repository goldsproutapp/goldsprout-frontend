<script setup lang="ts">
import {formatDecimal, pluralise} from '@/lib/data';
import {getOverview} from '@/lib/requests';
import type {Overview} from '@/lib/types';
import {onMounted, ref} from 'vue';
const overview = ref<Overview>();
onMounted(() => getOverview().then(res => overview.value = res));
</script>

<template>
    <div>
        <h1>Overview</h1>
        <div v-if="overview?.total_value">
            You have
            <b>£{{ formatDecimal(overview.total_value) }}</b>
            between
            {{ pluralise(overview.num_stocks, 'stock') }}
            across
            {{ pluralise(overview.num_providers, 'provider') }}.
            <br>
            Your last recorded snapshot was on {{ overview.last_snapshot.toLocaleDateString() }}.
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
</style>
