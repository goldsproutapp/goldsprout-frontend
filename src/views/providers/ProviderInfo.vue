<script setup lang="ts">
import SaveCancel from '@/components/buttons/SaveCancel.vue';
import TextInput from '@/components/select/TextInput.vue';
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
            <TextInput type="text" placeholder="Name" v-model="provider.name" />
        </div>
        <div class="input-item" style="width: 50%;">
            <TextInput type="text" placeholder="CSV Format" v-model="provider.csv_format" style="width: 100%;"/>
        </div>
        <div class="input-item">
            <SaveCancel @save="save" @cancel="router.back()"/>
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
