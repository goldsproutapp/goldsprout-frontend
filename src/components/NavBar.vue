
<script setup lang="ts">
import {computed, ref} from 'vue';
import {RouterLink} from 'vue-router';
import {authState} from '@/lib/state';
import {headerRoutes} from '@/router';
import {getUserDisplayName} from '@/lib/data';
import Menubar from 'primevue/menubar';
import type {MenuItem} from 'primevue/menuitem';
import Menu from 'primevue/menu';
import Button from 'primevue/button';
const visibleRoutes = computed(() => headerRoutes.filter(route => !route.meta?.requireAdmin || (authState.loggedIn && authState.userInfo.is_admin)));
const items = computed<MenuItem[]>(() => visibleRoutes.value.map(route => ({label: route.name, route: route.path})));
const profileMenuItems = ref([
    {
        label: 'Options',
        route: '/options',
    },
])
const adminMenuRoutes = ref([
    {
        label: 'User management',
        route: '/users',
    },
])
const logoutRoute = {
    label: 'Log out',
    route: '/logout',
};
const allMenuRoutes = computed(() => authState.userInfo.is_admin ?
    [...profileMenuItems.value, ...adminMenuRoutes.value, logoutRoute] :
    [...profileMenuItems.value, logoutRoute]);
const profileMenu = ref();
const toggle = (evt: any) => profileMenu.value.toggle(evt);
</script>

<template>
    <div>
        <Menubar :model="items" style="margin: 1rem;">
            <template #item="{item, props}">
                <router-link v-if="item.route" v-slot="{href, navigate}" :to="item.route" custom>
                    <a :href="href" v-bind="props.action" @click="navigate">
                        <span :class="item.icon" />
                        <span class="ml-2">{{ item.label }}</span>
                    </a>
                </router-link>
            </template>
            <template #end>
                <Button type="button" :label="getUserDisplayName(authState.userInfo)" @click="toggle"
                    severity="secondary" />
                <Menu :model="allMenuRoutes" :popup="true" ref="profileMenu">
                    <template #item="{item, props}">
                        <router-link v-if="item.route" v-slot="{href, navigate}" :to="item.route" custom>
                            <a :href="href" v-bind="props.action" @click="navigate">
                                <span :class="item.icon" />
                                <span class="ml-2">{{ item.label }}</span>
                            </a>
                        </router-link>
                    </template>
                </Menu>
            </template>
        </Menubar>
    </div>
</template>

<style scoped>
.background {
    background-color: var(--header-bg-colour);
    width: 100%;
    display: flex;
    justify-content: center;
}
</style>

