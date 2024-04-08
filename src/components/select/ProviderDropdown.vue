<script setup lang="ts">
import {computed, onMounted, ref} from 'vue';
import {providers} from "@/lib/data";
import {type Provider} from "@/lib/types";
import Dropdown from 'primevue/dropdown';

const providerList = ref<Provider[]>([]);
const providerNames = computed(() => providerList.value.map(({name}) => name));

onMounted(async () => {
    providerList.value = await providers();
})

const model = defineModel();
defineProps<{
    l_id: string,
}>();
</script>
<template>
    <Dropdown v-model="model" :options="providerNames" placeholder="Provider" class="w-full md:w-14rem"/>
</template>
