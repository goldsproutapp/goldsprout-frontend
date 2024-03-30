<script setup lang="ts">
import {getProviderByID} from '@/lib/data';
import {authenticatedRequest} from '@/lib/requests';
import {type Provider} from '@/lib/types';
import router from '@/router';
import {ref, watch} from 'vue';

const props = defineProps<{
    providerID?: number
}>();

const provider = ref<Provider>({
    id: 0,
    name: '',
    csv_format: '',
    csv_format_obj: {},
});

watch(props, ({providerID}, _) => {
    if (providerID !== undefined)
        getProviderByID(providerID).then(
            result => provider.value = result ? result : provider.value);
}, {
    immediate: true,
});
const save = async () => {
    const payload = {
        provider: provider.value,
    };
    await authenticatedRequest('/providers', {
        method: 'PUT',
        body: JSON.stringify(payload),
    });
    router.push('/providers');
}

</script>

<template>
    <div class="container">
        <div class="input-item">
            <input type="text" placeholder="Name" v-model="provider.name">
        </div>
        <div class="input-item">
            <input type="text" placeholder="CSV Format" v-model="provider.csv_format">
        </div>
        <div class="input-item">
            <button @click="save">Save</button>
        </div>
    </div>
</template>

<style scoped>
.container {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding-top: 2rem;
}

.input-item {
    padding-bottom: 1rem;
}
</style>
