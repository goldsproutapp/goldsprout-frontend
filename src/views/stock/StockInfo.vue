<script setup lang="ts">
import SaveCancel from "@/components/buttons/SaveCancel.vue";
import Dropdown from "@/components/select/Dropdown.vue";
import ProviderDropdown from "@/components/select/ProviderDropdown.vue";
import {stocks, providers} from "@/lib/data";
import {authenticatedRequest, getStockList} from "@/lib/requests";
import {type Provider, type Stock} from "@/lib/types";
import router from "@/router";
import {onMounted, ref} from "vue";
const props = defineProps<{
    id: number,
}>();

const stock = ref<Stock | undefined | null>(undefined);
const providerList = ref<Provider[]>([]);
const regions = ['UK', 'US', 'Global', 'Europe', 'Emerging', 'AsiaPacific'];
onMounted(async () => {
    stock.value = (await stocks()).find(({id}) => id == props.id) || null;
    providerList.value = await providers();
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
        <span class="stock-title">{{ stock.name }}</span>
        <div class="option-container">
            Provider:
            <ProviderDropdown l_id="stockinfo-provider" v-model="stock.provider_name" />
        </div>
        <div class="option-container">
            Sector:
            <Dropdown l_id="stockinfo-sector" v-model="stock.sector" :options="[]" />
        </div>
        <div class="option-container">
            Region:
            <Dropdown l_id="stockinfo-region" v-model="stock.region" :options="regions" />
        </div>
        <div class="option-container">
            <SaveCancel @save="save" @cancel="router.back()" />
        </div>
    </div>
</template>
    

<style scoped>
.container {
    width: 100%;
    display: flex;
    flex-direction: column;
    margin-left: 2rem;
    margin-right: 2rem;
}

.stock-title {
    width: 100%;
    text-align: center;
}

.option-container {
    margin-top: 1rem;
}

.btn {
    margin-right: 1rem;
}
</style>
