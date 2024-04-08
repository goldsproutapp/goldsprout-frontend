<script setup lang="ts">
import SaveCancel from '@/components/buttons/SaveCancel.vue';
import {getUserByID} from '@/lib/data';
import {dataState} from '@/lib/state';
import {type AccessPermission, type User} from '@/lib/types';
import router from '@/router';
import Checkbox from 'primevue/checkbox';
import {ref, watch} from 'vue';

const props = defineProps<{
    id: string,
}>();
const user = ref<User | null>();
watch(props, ({id}, _) => {
    if (id !== undefined)
        getUserByID(parseInt(id)).then(
            result => user.value = result ? result : user.value);
}, {
    immediate: true,
});
const perms = ref<{[key: string]: AccessPermission}>();
watch(user, (next, old) => {
    if (next == null) return;
    perms.value = generatePerms(next);
})
const generatePerms = (u: User): {[key: string]: AccessPermission} => {
    const out: {[key: string]: AccessPermission} = {};
    dataState.users.forEach(({id}) => out[id.toString()] = {
        access_for_id: id,
        read: false,
        write: false,
        user_id: u.id,
    });
    if (u.access_permissions) u.access_permissions.forEach((perm) => out[perm.access_for_id.toString()] = perm);
    return out;
}
const process = async () => {
}
</script>

<template>
    <div v-if="user">
        <h2>User info</h2>
        <div class="info-container">
            <span class="info-element">User ID:</span>
            <span class="info-element">{{ user.id }}</span>
            <span class="info-element">First name:</span>
            <span class="info-element">{{ user.first_name }}</span>
            <span class="info-element">Last name:</span>
            <span class="info-element">{{ user.last_name }}</span>
            <span class="info-element">Email address:</span>
            <span class="info-element">{{ user.email }}</span>
            <span class="info-element">Admin:</span>
            <span class="info-element">{{ user.is_admin }}</span>
            <span class="info-element">Account created:</span>
            <span class="info-element">{{ new Date(user.created_at).toLocaleDateString() }}</span>
        </div>
        <h2>Permissions</h2>
        <table>
            <thead>
                <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Read</th>
                    <th>Write</th>
                </tr>
            </thead>
            <tbody>
                <tr v-for="otherUser in dataState.users" :key="otherUser.id" v-show="otherUser.id != user.id">
                    <th>{{ otherUser.first_name }} {{ otherUser.last_name }}</th>
                    <th>{{ otherUser.email }}</th>
                    <th>
                        <Checkbox v-model="perms[otherUser.id].read" />
                    </th>
                    <th>
                        <Checkbox v-model="perms[otherUser.id].write" />
                    </th>
                </tr>
            </tbody>
        </table>
        <div class="save-cancel">
            <SaveCancel @cancel="router.back()"/>
        </div>
    </div>
    <div v-else>
        Loading...
    </div>
</template>

<style scoped>
.info-container {
    display: grid;
    grid-template-columns: auto auto;
    width: max-content;
    grid-column-gap: 1rem;
    margin-bottom: 1rem;
}

.info-element {
    display: inline-flex;
    align-items: center;
    margin-top: .2rem;
}
.save-cancel {
    margin-top: 1rem;
    display: flex;
    column-gap: 1rem;
}
</style>
