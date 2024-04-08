<script setup lang="ts">
import Table from "@/components/Table.vue";
import Button from "@/components/buttons/Button.vue";
import {getUsers} from '@/lib/requests';
import {dataState} from '@/lib/state';
import type {User} from "@/lib/types";
import router from '@/router';
import {computed, onMounted} from 'vue';

onMounted(getUsers);

const headings = {
    email: "Email",
    first_name: "First name",
    last_name: "Last name",
    created_at: "Created at",
};
const users = computed(() =>
    dataState.users.map((user: User) =>
        ({...user, created_at: new Date(user.created_at).toLocaleDateString()})
    ));
const icons = ({is_admin, active}: User) => is_admin ? 'admin' : !active ? 'pending' : 'none';
const clickHandler = (row: any) => router.push(`/users/${row.id}`);
</script>

<template>
    <div>
        <h1>Users</h1>
        <Button @click="router.push('users/create')">Invite user</Button>
        <Table :headings="headings" :rows="users" :styles="{}" :clickHandler="clickHandler" :icons="icons" />
    </div>
</template>

<style scoped>
/* code... */
</style>
