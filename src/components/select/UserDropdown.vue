<script setup lang="ts">

import {computed, onMounted, ref} from 'vue';
import {users, getUserDisplayName} from "@/lib/data";
import {type User} from "@/lib/types";
import Dropdown from "@/components/select/Dropdown.vue";

const userList = ref<User[]>([]);
const userNames = computed(() => userList.value.map(getUserDisplayName));

onMounted(async () => {
    userList.value = await users();
})

const model = defineModel();
defineProps<{
    l_id: string,
}>();
</script>
<template>
    <Dropdown :l_id="l_id" strict v-model="model" :options="userNames" />
</template>
