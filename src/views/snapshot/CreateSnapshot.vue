<script setup lang="ts">
import ProviderDropdown from '@/components/select/ProviderDropdown.vue';
import UserDropdown from '@/components/select/UserDropdown.vue';
import {getUserDisplayName} from '@/lib/data';
import {parseCSV} from '@/lib/formats/csv';
import {authenticatedRequest, getStockList} from '@/lib/requests';
import {authState, dataState} from '@/lib/state';
import {type Stock} from '@/lib/types';
import router from '@/router';
import {computed, onMounted, ref} from 'vue';
import SaveCancel from '@/components/buttons/SaveCancel.vue';
import DateInput from '@/components/select/DateInput.vue';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import Button from 'primevue/button';
import Dialog from 'primevue/dialog';


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
onMounted(getStockList);

const username = ref<string>(getUserDisplayName(authState.userInfo));
const user = computed(() => dataState.users.find(user => getUserDisplayName(user) === username.value));

const entries = ref<any>([]);
const inputDiv: any = ref(null);
const dateInput = ref<Date>(new Date());
const error = ref<string>("");

const missingStocks = ref<Stock[]>([]);
const showModal = ref(false);

function findMissingStocks(): boolean {
    const providers = new Set(entries.value.map((entry: any) => entry.provider_id));
    const snapshotsStocks = entries.value.map((entry: any) => `${entry.stock_name}:${entry.provider_id}`);
    const applicableStocks = dataState.stocks.filter(
        (stock) =>
            stock.currently_held &&
            stock.tracking_strategy === 'DATA_IMPORT' &&
            // @ts-ignore
            stock.users.includes(user.value.id) &&
            providers.has(stock.provider.id)
    );
    console.log(applicableStocks);
    console.log(snapshotsStocks);
    applicableStocks.forEach((stock) => console.log([stock.name, stock.provider.id]));
    missingStocks.value = applicableStocks.filter((stock) => !snapshotsStocks.includes(`${stock.name}:${stock.provider.id}`));
    const missing = missingStocks.value.length !== 0;
    if (missing) showModal.value = true;
    return missing;
}

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
            // @ts-ignore
            obj.provider_id = provider.value.id;
            return obj;
        });
        // @ts-ignore
        entries.value.push(...objs);
    } catch (e) {
        error.value = "The given data is not in the correct format for the selected provider.";
        return;
    }
    inputDiv.value.innerText = '';
    error.value = '';
}
const createSnapshots = async (deleteSoldStocks: boolean = true) => {
    const date = dateInput.value;
    const payload = {
        date: Math.floor(date.getTime() / 1000),
        user_id: user.value?.id || 0,
        entries: entries.value,
        delete_sold_stocks: deleteSoldStocks,
    };
    await authenticatedRequest('/snapshots', {
        method: 'POST',
        body: JSON.stringify(payload),
    });
    router.push('/snapshots');
};

const submit = () => {
    if (!findMissingStocks()) createSnapshots();
}

</script>

<template>
    <div class="container">
        <Dialog v-model:visible="showModal">
            You have not provided data for the following stocks:
            <ul>
                <li v-for="stock in missingStocks" :key="stock.id.toString()">{{ stock.name }} of {{ stock.provider_name }}</li>
            </ul>
            It looks like these stocks are no longer held, and will be marked as such.<br>
            <Button class="modal-button" severity="success" @click="() => createSnapshots()" label="These are no longer held, continue" />
            <Button class="modal-button" severity="danger" @click="showModal = false" label="Cancel" />
            <br>
            <Button class="modal-button" severity="secondary" @click="createSnapshots(false)" label="These are still held,
                            continue without updating them" />
        </Dialog>
        <h1>Create snapshot</h1>
        <div class="error-message" v-if="error">{{ error }}</div>
        <div class="misc-inputs">
            <DateInput id="date-input" v-model="dateInput" />
            <ProviderDropdown l_id="createsnapshot-provider" v-model="providerName" />
        </div>
        <div contenteditable ref="inputDiv" class="csv-input"></div>
        <hr>
        <Button class="button" @click="process" label="Add" severity="primary" />
        <Button class="button" @click="entries = []" label="Clear" severity="secondary" />
        <DataTable :value="entries">
            <Column v-for="[key, display] in Object.entries(headings)" :key="key" :field="key" :header="display"></Column>
        </DataTable>
        <hr>
        <div class="control-items">
            <UserDropdown v-model="username" />
            <SaveCancel @save="submit" @cancel="router.back()" />
        </div>
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

.button {
    margin-right: .5rem;
    margin-bottom: .5rem;
}

.savecancel-button {
    margin-right: .5rem;
}

.control-items {
    display: flex;
    justify-content: start;
    column-gap: 1rem;
}
.modal-button {
    margin: .5rem;
}
</style>
