<script setup lang="ts">
import Table from '@/components/Table.vue';
import ProviderDropdown from '@/components/select/ProviderDropdown.vue';
import {parseCSV} from '@/lib/formats/csv';
import {authenticatedRequest} from '@/lib/requests';
import {authState, dataState} from '@/lib/state';
import router from '@/router';
import {computed, ref} from 'vue';


const headings = {
    stock_name: 'Name',
    units: 'Units',
    price: 'Price (pence)',
    value: 'Value (£)',
    cost: 'Cost (£)',
    absolute_change: 'Gain/loss (£)',
}

const replaceCommas = ['units', 'price', 'value', 'cost', 'absolute_change'];
const providerName = ref<string>();
const provider = computed(() => dataState.providers.find(provider => provider.name === providerName.value));

const entries = ref([]);
const inputDiv: any = ref(null);
const dateInput: any = ref(null);
const error = ref<string>("");

function process() {
    if (providerName.value === "" || providerName.value === undefined) {
        error.value = "Please select a provider.";
        return;
    }
    const raw = inputDiv.value.innerText;
    const rows = raw.split('\n')
    const parsedRows = rows.map(parseCSV);
    try {
        const objs = parsedRows.map((row: any) => {
            const obj: {[key: string]: string | number} = {};
            // @ts-ignore
            Object.entries(provider.value.csv_format_obj).forEach(([key, idx]) =>
                obj[key] = replaceCommas.includes(key) ?
                    row[idx].replace(',', '') : row[idx]
            );
            obj.provider_id = 1;
            return obj;
        });
        // @ts-ignore
        entries.value.push(...objs);
    } catch (e) {
        error.value = "The given data is not in the correct format for the selected provider.";
        return;
    }
    inputDiv.value.innerText = '';
}
const submit = async () => {
    const dateString = dateInput.value.value;
    const date = dateString == "" ? new Date() : new Date(dateString);
    const payload = {
        date: Math.floor(date.getTime() / 1000),
        user_id: authState.userInfo.id,
        entries: entries.value,
    };
    await authenticatedRequest('/snapshots', {
        method: 'POST',
        body: JSON.stringify(payload),
    });
    router.push('/snapshots');
};

</script>

<template>
    <div class="container">
        <h1>Create snapshot</h1>
        <div class="error-message" v-if="error">{{ error }}</div>
        <div class="misc-inputs">
            <input type="date" ref="dateInput" id="date-input">
            <ProviderDropdown v-model="providerName" />
        </div>
        <div contenteditable ref="inputDiv" class="csv-input"></div>
        <hr>
        <button @click="process">Add</button>
        <button @click="entries = []">Clear</button>
        <Table :headings="headings" :rows="entries" :styles="{}" />
        <hr>
        <button @click="submit">Submit</button>
        <button @click="router.push('/snapshots')">Cancel</button>
    </div>
</template>

<style scoped>
.csv-input {
    width: 100%;
    border: 1px solid grey;
    border-radius: .2rem;
    min-height: 2lh;
}

.container {
    height: 100%;
    flex-grow: 1;
}

.misc-inputs {
    display: flex;
    margin-bottom: 2rem;
}

#date-input {
    margin-right: 1rem;
}

.error-message {
    color: var(--failure-colour);
    width: 100%;
    text-align: center;
    margin-bottom: 1rem;
}
</style>
