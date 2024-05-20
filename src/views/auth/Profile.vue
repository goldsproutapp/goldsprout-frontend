<script setup lang="ts">
import InfoIcon from '@/components/icons/InfoIcon.vue';
import {saveAuthState} from '@/lib/auth';
import {getUserDisplayName} from '@/lib/data';
import {authenticatedRequest, getUserVisibility} from '@/lib/requests';
import {authState} from '@/lib/state';
import {type User} from '@/lib/types';
import {onMounted, ref} from 'vue';
import PasswordChangeModal from '@/components/modals/PasswordChangeModal.vue';
import InputText from 'primevue/inputtext';
import Button from 'primevue/button';
import {useToast} from 'primevue/usetoast';
import TabMenu from 'primevue/tabmenu';
import router from '@/router';
import Tooltip from '@/components/layout/Tooltip.vue';
import Dialog from 'primevue/dialog';
import Checkbox from 'primevue/checkbox';

const toast = useToast();

const {userInfo} = authState;
const editingInfo = ref(Object.assign({}, userInfo));
const visibility = ref<User[]>();
onMounted(() => getUserVisibility().then(res => visibility.value = res));
const editing = ref(false);

const changingPassword = ref(false);

const cancel = () => {
    editing.value = false;
    editingInfo.value = Object.assign({}, userInfo);
}
const update = async () => {
    editing.value = false;
    const payload = editingInfo.value;
    const res = await authenticatedRequest('/user', {
        method: 'PATCH',
        body: JSON.stringify(payload)
    });
    if (res.status !== 200) {
        toast.add({
            summary: 'Error',
            detail: 'Failed to update profile',
            group: 'br',
            severity: 'error',
            life: 2000,
        })
        editingInfo.value = authState.userInfo;
        return;
    }
    const {data} = await res.json();
    authState.userInfo = data;
    saveAuthState();
    toast.add({
        summary: 'Success',
        detail: 'Successfully updated profile',
        group: 'br',
        severity: 'success',
        life: 2000,
    })
}
const menuIdx = ref(0);
const menu = ref([
    {
        label: 'Profile',
    },
    {
        label: 'Data options'
    }
]);

const showDeleteModal = ref(false);
const deleteInfo = ref<any>({
    snapshots: true,
    stocks: false,
});
const confirmDelete = async () => {
    showDeleteModal.value = false;
    if (!deleteInfo.value.snapshots && !deleteInfo.value.stock) {
        return;
    }
    const res = await authenticatedRequest('/massdelete', {
        method: 'POST',
        body: JSON.stringify({stocks: deleteInfo.value.stocks}),
    })
    if (res.status != 200) {
        toast.add({
            summary: 'Error',
            detail: 'Failed to delete data',
            group: 'br',
            severity: 'error',
            life: 2000,
        });
        return;
    }
    toast.add({
        summary: 'Success',
        detail: 'Successfully deleted data',
        group: 'br',
        severity: 'success',
        life: 2000,
    });
    return;
}

</script>

<template>
    <div>
        <h1>Options</h1>
        <div style="background-color: var(--);">
            <TabMenu :model="menu" v-model:activeIndex="menuIdx" />
        </div>
        <div v-if="menuIdx == 0" class="menu-container">
            <div class="info-container">
                <span class="info-element">User ID:</span>
                <span class="info-element">{{ editingInfo.id }}</span>
                <span class="info-element">First name:</span>
                <InputText v-model="editingInfo.first_name" :readonly="!editing" />
                <span class="info-element">Last name:</span>
                <InputText v-model="editingInfo.last_name" :readonly="!editing" />
                <span class="info-element">Email address:</span>
                <span class="info-element">{{ editingInfo.email }}</span>
                <span class="info-element">Admin:</span>
                <span class="info-element">{{ editingInfo.is_admin }}</span>
                <span class="info-element">Trusted:</span>
                <span class="info-element">{{ editingInfo.trusted ?? 'false' }}</span>
                <span class="info-element">Account created:</span>
                <span class="info-element">{{ new Date(editingInfo.created_at).toLocaleDateString() }}</span>
                <Button v-if="!editing" @click="editing = true" severity="secondary" label="Edit" />
                <template v-else>
                    <Button severity="danger" @click="cancel" label="Cancel" />
                    <Button severity="success" @click="update" label="Save" />
                </template>
                <Button severity="danger" style="grid-column: 1; margin-top: 1rem;" @click="changingPassword = true"
                    label="Change password" />
            </div>
            <div class="access-info" v-if="visibility?.length">
                The following people have access to your data:
                <ul>
                    <li v-for="user in visibility" :key="user.id">
                        <InfoIcon preset="admin" v-if="user.is_admin" />
                        {{ getUserDisplayName(user) }} ({{ user.email }})
                    </li>
                </ul>
            </div>
        </div>
        <div v-else class="menu-container data-options">
            <h2>Manage your data.</h2>
            <Button style="margin-bottom: 1rem;" label="Import snapshots" @click="router.push('/snapshots/import')" />
            <br>
            <Tooltip content="Not available yet" position="right">
                <Button label="Export data" disabled />
            </Tooltip>
            <br>
            <Button v-if="authState.userInfo.is_admin" style="margin-top: 1rem;" label="Delete data" severity="danger"
                @click="showDeleteModal = true" />
        </div>
        <PasswordChangeModal v-model="changingPassword" />
        <Dialog v-model:visible="showDeleteModal" header="Mass Delete">
            <div class="delete-container">
                <span>Snapshots</span>
                <Checkbox v-model="deleteInfo.snapshots" :binary="true" disabled></Checkbox>
                <span>Stocks</span>
                <Checkbox v-model="deleteInfo.stocks" :binary="true"></Checkbox>
                <Button label="Delete" severity="danger" @click="confirmDelete" />
                <Button label="Cancel" severity="success" @click="showDeleteModal = false" />
            </div>
        </Dialog>
    </div>
</template>

<style scoped>
.info-container {
    display: grid;
    grid-template-columns: auto auto;
    width: max-content;
    grid-column-gap: 2rem;
    grid-row-gap: 1rem;
    margin-bottom: 1rem;
}

.info-element {
    display: inline-flex;
    align-items: center;
    margin-top: .2rem;
}

.info-label {
    grid-column: 1;
}

.info-value {
    grid-column: 2;
}

.input {
    margin-top: .2rem;
    margin-bottom: .2rem;
}

.message {
    grid-column: 1 / span 2;
}

.menu-container {
    margin-top: 2rem;
}

.delete-container {
    margin-bottom: 1rem;
    display: grid;
    grid-template-columns: auto auto;
    grid-column-gap: 1rem;
    grid-row-gap: 1rem;
}
</style>
