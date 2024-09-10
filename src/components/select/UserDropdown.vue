<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { users, getUserDisplayName } from '@/lib/data';
import { type User } from '@/lib/types';
import Dropdown from 'primevue/dropdown';

const userList = ref<User[]>([]);

onMounted(async () => {
  userList.value = await users();
});

const model = defineModel();
</script>
<template>
  <Dropdown
    v-model="model"
    :options="userList"
    :option-label="getUserDisplayName"
    placeholder="User"
  />
</template>
