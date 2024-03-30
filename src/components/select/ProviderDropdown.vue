<script setup lang="ts">
import {computed, onMounted, ref} from 'vue';
import {providers} from "@/lib/data";
import {type Provider} from "@/lib/types";
import Dropdown from "@/components/select/Dropdown.vue";

const providerList = ref<Provider[]>([]);
const providerNames = computed(() => providerList.value.map(({name}) => name));

onMounted(async () => {
    providerList.value = await providers();
})

const model = defineModel();
</script>
<template>
    <Dropdown l_id="stockinfo-provider" strict v-model="model" :options="providerNames" />
</template>
