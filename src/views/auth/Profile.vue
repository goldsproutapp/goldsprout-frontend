<script setup lang="ts">
import InfoIcon from '@/components/icons/InfoIcon.vue';
import {getUserDisplayName} from '@/lib/data';
import {getUserVisibility} from '@/lib/requests';
import {authState} from '@/lib/state';
import {type User} from '@/lib/types';
import {onMounted, ref} from 'vue';

const {userInfo} = authState;
const visibility = ref<User[]>();
onMounted(() => getUserVisibility().then(res => visibility.value = res));
</script>

<template>
    <div>
        <h1>Profile</h1>
        <div class="info-container">
            <span>User ID:</span>
            <span>{{ userInfo.id }}</span>
            <span>First name:</span>
            <span>{{ userInfo.first_name }}</span>
            <span>Last name:</span>
            <span>{{ userInfo.last_name }}</span>
            <span>Email address:</span>
            <span>{{ userInfo.email }}</span>
            <span>Admin:</span>
            <span>{{ userInfo.is_admin }}</span>
            <span>Account created:</span>
            <span>{{ new Date(userInfo.created_at).toLocaleDateString() }}</span>
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
</template>

<style scoped>
.info-container {
    display: grid;
    grid-template-columns: auto auto;
    width: max-content;
    grid-column-gap: 1rem;
    margin-bottom: 1rem;
}

.info-label {
    grid-column: 1;
}

.info-value {
    grid-column: 2;
}
</style>
