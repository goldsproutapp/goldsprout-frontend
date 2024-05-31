<script setup lang="ts">
import SaveCancel from "@/components/buttons/SaveCancel.vue";
import ProviderDropdown from "@/components/select/ProviderDropdown.vue";
import {stocks, providers, getUserByID, getUserDisplayName, formatDecimal} from "@/lib/data";
import {authenticatedRequest, getHoldings, getRegions, getSectors, getStockList} from "@/lib/requests";
import {type Provider, type Stock} from "@/lib/types";
import router from "@/router";
import Dropdown from "primevue/dropdown";
import InputSwitch from "primevue/inputswitch";
import Button from "primevue/button";
import {computed, onMounted, ref} from "vue";
import PerformanceGraph from "../performance/PerformanceGraph.vue";
import {dataState} from "@/lib/state";
import Inplace from "primevue/inplace";
import InputText from "primevue/inputtext";
import InputNumber from "primevue/inputnumber";
import Dialog from "primevue/dialog";
import StockDropdown from "@/components/select/StockDropdown.vue";
import {useToast} from "primevue/usetoast";
import {StatusCode, statusFrom, statusText} from "@/lib/formats/responses";
import {watch} from "vue";
import ProgressSpinner from "primevue/progressspinner";
const props = defineProps<{
    id: string,
}>();

const stock = ref<Stock | undefined | null>(undefined);
const providerList = ref<Provider[]>([]);
const regions = computed(() => dataState.regions);
const sectors = computed(() => dataState.sectors);

const mergeModal = ref(false);
const mergeInto = ref<Stock | null>(null);

const toast = useToast();

onMounted(async () => {
    stock.value = (await stocks()).find(({id}) => id.toString() == props.id) || null;
    providerList.value = await providers();
    getRegions();
    getSectors();
});

const holding = ref<any>(null);

watch(stock, async (v, _) => {
    if (!v) return;
    const info = dataState.stockHoldings[v.id];
    if (!info) await getHoldings();
    const data: any = [];
    await Promise.all(Object.entries(dataState.stockHoldings[v.id])
        .map(async ([uid, value]) =>
            data.push(
                [await getUserByID(Number.parseInt(uid)), value]
            )));
    holding.value = data;
});


const save = async () => {
    const obj = stock.value as Stock;
    const prov = providerList.value.find(provider => provider.name == obj.provider_name);
    obj.provider = prov ? prov : obj.provider;
    const payload = {
        stock: obj,
    };
    await authenticatedRequest('/stocks', {
        method: 'PUT',
        body: JSON.stringify(payload),
    });
    getStockList();
    router.push('/stocks');
}
const merge = async () => {
    mergeModal.value = false;
    if (mergeInto.value == null) {
        toast.add({
            summary: 'Error',
            detail: 'Please select a stock to merge into.',
            group: 'bl',
            severity: 'error',
            life: 2000,
        })
        return;
    }
    const payload = {
        stock: stock.value?.id ?? 0, // stock can't be null if we're getting here.
        merge_into: mergeInto.value.id,
    };
    const res = await authenticatedRequest('/stocks/merge', {
        method: 'POST',
        body: JSON.stringify(payload),
    });
    const status = statusFrom(res.status);
    if (status !== StatusCode.NoContent) {
        toast.add({
            summary: 'Error', detail: `An error occurred while attempting to merge stocks: ${statusText(status)}.`,
            group: 'bl',
            severity: 'error',
            life: 2000,
        });
        return;
    }
    toast.add({
        summary: 'Success',
        detail: 'Successfully merged stocks.',
        group: 'bl',
        severity: 'success',
        life: 2000,
    });
    getStockList().then(() => router.push('/stocks'));

};
</script>

<template>
    <div class="container" v-if="stock === null">
        Stock not found.
    </div>
    <div class="container" v-else-if="stock === undefined">
        Loading...
    </div>
    <div class="container" v-else>
        <Inplace :closable="true" class="stock-title">
            <template #display>
                {{ stock.name }}
            </template>
            <template #content>
                <InputText v-model="stock.name" autofocus class="stock-title" />
            </template>
        </Inplace>
        <div class="info-container">
            <div class="info-section">
                <div class="option-container">
                    Provider:
                    <ProviderDropdown v-model="stock.provider_name" />
                </div>
                <div class="option-container">
                    Sector:
                    <Dropdown v-model="stock.sector" :options="sectors" editable />
                </div>
                <div class="option-container">
                    Region:
                    <Dropdown v-model="stock.region" :options="regions" editable />
                </div>
                <div class="option-container">
                    Fee:
                    <InputNumber v-model="stock.annual_fee" :min="0" :max="100" :max-fraction-digits="2" suffix="%" />
                </div>
                <div class="option-container">
                    Needs attention:
                    <InputSwitch v-model="stock.needs_attention" />
                </div>
                <div class="option-container">
                    <Button label="Merge into" severity="secondary" @click="mergeModal = true" />
                </div>
                <div class="option-container control-container">
                    <SaveCancel @save="save" @cancel="router.back()" />
                </div>
            </div>
            <div class="holding-container">
                <h2>Holdings</h2>
                <table v-if="holding !== null" class="holding-table">
                    <tbody>
                        <tr v-for="[user, value] in holding" :key="user.id">
                            <td>{{ getUserDisplayName(user) }}</td>
                            <td v-if="value == '0'">
                                Previously held
                            </td>
                            <td v-else>£{{ formatDecimal(value) }}</td>
                        </tr>
                    </tbody>
                </table>
                <div v-else>
                </div>
            </div>
        </div>
        <div class="graph-container" display="height: 100rem;">
            <PerformanceGraph :id="id" performance-type="stock" />
        </div>
        <Dialog v-model:visible="mergeModal" header="Merge stocks" modal :style="{minWidth: '50rem'}">
            <div class="mergemodal-container">
                <span>Merge this stock into another stock, deleting this stock.</span>
                <span style="color: var(--warning-colour)">Warning: This action is irreversible.</span>
                <StockDropdown v-model="mergeInto" :exclude-ids="[stock.id]" />
                <div class="control-container option-container">
                    <SaveCancel @save="merge" @cancel="mergeModal = false" save-label="Merge" />
                </div>
            </div>
        </Dialog>
    </div>
</template>
    

<style scoped>
.container {
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    padding-left: 2rem;
    padding-right: 2rem;
    flex-grow: 1;
}

.stock-title {
    width: 100%;
    text-align: center;
}

.option-container {
    margin-top: 1rem;
}

.control-container {
    display: flex;
    column-gap: 1rem;
}

.btn {
    margin-right: 1rem;
}

.graph-container {
    flex-grow: 1;
    display: flex;
    flex-direction: column;
}

.mergemodal-container {
    display: flex;
    flex-direction: column;
    row-gap: .5rem;
}

.info-container {
    display: flex;
    justify-content: space-between;
    flex-direction: column;
}

@media screen and (min-width: 800px) {
    .info-container {
        flex-direction: row;
    }

    .holding-table {
        margin-right: 5rem;
    }
}
.holding-table td:first-child {
    padding-right: 1rem; 
}
</style>
