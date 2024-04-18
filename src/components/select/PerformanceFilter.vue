<script setup lang="ts">
import {getUserDisplayName} from '@/lib/data';
import {getProviderList, getRegions, getUsers} from '@/lib/requests';
import {dataState} from '@/lib/state';
import type {Provider, User} from '@/lib/types';
import Accordion from 'primevue/accordion';
import AccordionTab from 'primevue/accordiontab';
import Button from 'primevue/button';
import Listbox from 'primevue/listbox';
import {watch} from 'vue';
import {computed} from 'vue';
import {onMounted} from 'vue';
import {ref} from 'vue';

const selectedRegions = ref<string[]>([]);
const selectedProviders = ref<Provider[]>([]);
const selectedUsers = ref<User[]>([]);
const model = defineModel();
const emit = defineEmits(['update']);

onMounted(getRegions);
onMounted(getProviderList);
onMounted(getUsers);

const filterObj = computed(() => {
    const obj: any = {};
    if (selectedRegions.value.length > 0)
        obj.filter_regions = selectedRegions.value.join(',');
    if (selectedProviders.value.length > 0)
        obj.filter_providers = selectedProviders.value.map(p => p.id).join(',');
    if (selectedUsers.value.length > 0)
        obj.filter_users = selectedUsers.value.map(p => p.id).join(',');
    return obj;
})
watch(filterObj, (obj, _) => {
    model.value = obj;
});

</script>

<template>
    <div>
        <h2>Filters</h2>
        <Accordion multiple :active-index="[0]">
            <AccordionTab header="Regions">
                <Listbox v-model="selectedRegions" :options="dataState.regions" multiple list-style="max-height: 20rem" />
            </AccordionTab>
            <AccordionTab header="Providers">
                <Listbox v-model="selectedProviders" :options="dataState.providers" option-label="name" multiple
                    list-style="max-height: 20rem" />
            </AccordionTab>
            <AccordionTab header="Users">
                <Listbox v-model="selectedUsers" :options="dataState.users" :option-label="getUserDisplayName" multiple
                    filter list-style="max-height: 20rem" />
            </AccordionTab>
        </Accordion>
        <Button label="Update" severity="secondary" class="update-btn" @click="$emit('update')" />
    </div>
</template>

<style scoped>
.filter-group {
    display: flex;
    flex-wrap: wrap;
    gap: 1rem;
}

.update-btn {
    width: 100%;
    margin-top: 1rem;
}
</style>
