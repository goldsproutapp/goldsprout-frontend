<script setup lang="ts">
import {cachedRequest, getSnapshots} from '@/lib/requests';
import Button from 'primevue/button';
import Dropdown from 'primevue/dropdown';
import {onMounted, ref} from 'vue';

const comparisonOptions = ['Performance', 'Weighted Performance', 'Holdings'];
const comparing = ref(comparisonOptions[0])

const targetOptions = ['Person', 'Provider', 'Sector', 'Region', 'Stock',];

const formats: any = {
    "Performance": "{}%",
    "Weighted Performance": "{}%",
    "Holdings": "£{}",
}
const target = ref(targetOptions[0]);
const against = ref(targetOptions[0]);
const timeOptions = ['Years', 'Quarters', 'Months'];
const time = ref(timeOptions[0]);

const showTable = ref(false);
const data: any = ref({});
const displayedOpts: any = ref({
    comparing: comparing.value,
    target: target.value,
    against: against.value,
    time: time.value,
});
const format = (str: string) => formats[displayedOpts.value.comparing].replace('{}', str);

onMounted(async () => {
    await getSnapshots('all');
})

const update = async () => {
    const query = new URLSearchParams();
    query.set('compare', comparing.value.toLowerCase().replace(' ', '_'));
    query.set('of', target.value.toLowerCase());
    query.set('for', against.value.toLowerCase());
    query.set('over', time.value.toLowerCase());
    const res = await cachedRequest(`/performance?${query.toString()}`);
    if (res.status === 200) {
        data.value = await res.json();
        showTable.value = true;
        displayedOpts.value = {
            comparing: comparing.value,
            target: target.value,
            against: against.value,
            time: time.value,
        }
    }
};

</script>

<template>
    <div class="container">
        <h1 class="title">Performance</h1>
        <span>
            Compare
                <Dropdown :options="comparisonOptions" v-model="comparing" />
            Of
                <Dropdown :options="targetOptions" v-model="target" />
            For
                <Dropdown :options="targetOptions" v-model="against" />
            Over
            <Dropdown :options="timeOptions" v-model="time" />
            <Button style="margin-left: 1rem;" type="button" label="Calculate" severity="primary" @click="update" />
        </span>
        <div class="comparison-container">
            <div class="table-container">
                <table class="comparison-table" v-if="showTable">
                    <thead>
                        <tr>
                            <th>{{displayedOpts.target}}</th>
                            <th>{{displayedOpts.against}}</th>
                            <th class="header-td" v-for="period in data.time_periods" :key="period">{{ period }}</th>
                        </tr>
                    </thead>
                    <tbody>
                        <template v-for="[col1, groupData] in Object.entries(data.data)">
                            <tr class="category-separator">
                                <td>
                                    <span>{{ col1 }}</span>
                                </td>
                                <td></td>
                                <td v-for="total in Object.values(groupData.totals)">{{ format(total) }}</td>
                            </tr>
                            <tr v-for="[item, values] in Object.entries(groupData.items)" :key="item">
                                <td></td>
                                <td>
                                    <span>{{ item }}</span>
                                </td>
                                <td v-for="period in data.time_periods" :key="period">
                                    <span v-if="Object.keys(values).includes(period)">{{ format(values[period]) }}</span>
                                </td>
                            </tr>
                        </template>
                    </tbody>
                </table>
            </div>
        </div>
    </div>
</template>

<style scoped>
.container {
    display: flex;
    flex-direction: column;
}

.comparison-container {
    display: flex;
    margin-top: 5rem;
}

.comparison-table {
    border-collapse: collapse;
}

tr {
    border-bottom: 1px solid white;
}

th,
td {
    padding-left: .5rem;
    padding-right: .5rem;
}

.header-td {
    border-left: 1px solid black;
}
table {
    border: 1px solid var(--border-colour);
}
.category-separator {
    border-top: 2px solid var(--border-colour);
}
</style>
