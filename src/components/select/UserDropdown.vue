<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { users, getUserDisplayName } from '@/lib/data'
import { type User } from '@/lib/types'
import Dropdown from 'primevue/dropdown'

const userList = ref<User[]>([])
const userNames = computed(() => userList.value.map(getUserDisplayName))

onMounted(async () => {
  userList.value = await users()
})

const model = defineModel()
</script>
<template>
  <Dropdown v-model="model" :options="userNames" />
</template>
