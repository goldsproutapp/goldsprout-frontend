<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { providers } from '@/lib/data';
import { type Provider } from '@/lib/types';
import Dropdown from 'primevue/dropdown';

const providerList = ref<Provider[]>([]);

onMounted(async () => {
  providerList.value = await providers();
});

const model = defineModel();
</script>
<template>
  <Dropdown
    v-model="model"
    :options="providerList"
    option-label="name"
    placeholder="Provider"
    class="w-full md:w-14rem"
  />
</template>
