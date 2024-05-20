<script setup lang="ts">
import InfoIcon from '@/components/icons/InfoIcon.vue';
import {getUsers} from '@/lib/requests';
import {dataState} from '@/lib/state';
import type {User} from "@/lib/types";
import router from '@/router';
import Button from 'primevue/button';
import Column from "primevue/column";
import DataTable from "primevue/datatable";
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
</script>

<template>
    <div>
        <h1>Users</h1>
        <Button @click="router.push('users/create')" label="Invite user" severity="success" class="create-button" />
        <DataTable :value="users" selection-mode="single" @row-select="row => router.push(`/users/${row.data.id}`)">
            <Column v-for="[key, display] in Object.entries(headings)" :key="key" :field="key" :header="display"></Column>
            <Column>
                <template #body="row">
                    <div class="icon-container">
                        <InfoIcon v-if="row.data.is_admin" preset="admin" />
                        <InfoIcon v-if="!row.data.active" preset="invited" />
                        <i v-if="row.data.trusted" class="pi pi-lock-open" v-tooltip.top="'This user is trusted.'" />
                    </div>
                </template>
            </Column>
        </DataTable>
    </div>
</template>

<style scoped>
.create-button {
    margin-bottom: 1rem;
}

.icon-container {
    display: flex;
    gap: .5rem;
}
</style>
