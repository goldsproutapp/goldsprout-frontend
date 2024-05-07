<script setup lang="ts">
import SaveCancel from "@/components/buttons/SaveCancel.vue";
import ProviderDropdown from "@/components/select/ProviderDropdown.vue";
import {stocks, providers} from "@/lib/data";
import {authenticatedRequest, getRegions, getSectors, getStockList} from "@/lib/requests";
import {type Provider, type Stock} from "@/lib/types";
import router from "@/router";
import Dropdown from "primevue/dropdown";
import InputSwitch from "primevue/inputswitch";
import {computed, onMounted, ref} from "vue";
import PerformanceGraph from "../performance/PerformanceGraph.vue";
import {dataState} from "@/lib/state";
import Inplace from "primevue/inplace";
import InputText from "primevue/inputtext";
import InputNumber from "primevue/inputnumber";
const props = defineProps<{
    id: string,
}>();

const stock = ref<Stock | undefined | null>(undefined);
const providerList = ref<Provider[]>([]);
const regions = computed(() => dataState.regions);
const sectors = computed(() => dataState.sectors);

onMounted(async () => {
    stock.value = (await stocks()).find(({id}) => id.toString() == props.id) || null;
    providerList.value = await providers();
    getRegions();
    getSectors();
})
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
            <InputNumber v-model="stock.annual_fee" :min="0" :max="100" :max-fraction-digits="2" suffix="%"/>
        </div>
        <div class="option-container">
            Needs attention:
            <InputSwitch v-model="stock.needs_attention" />
        </div>
        <div class="option-container control-container">
            <SaveCancel @save="save" @cancel="router.back()" />
        </div>
        <div class="graph-container" display="height: 100rem;">
            <PerformanceGraph :id="id" performance-type="stock" />
        </div>
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
</style>
