<script setup lang="ts">
import {RouterView} from 'vue-router'
import NavBar from "./components/NavBar.vue"
import Footer from './components/Footer.vue';
import {authState, updateAuthState} from './lib/state';
import {onMounted} from 'vue';
import router from './router';
import {usePrimeVue} from 'primevue/config';

const primeVue = usePrimeVue();

onMounted(() => {
    primeVue.changeTheme('', 'lara-dark-green', 'theme-link', () => {});
    updateAuthState();
    if (router.currentRoute.value.meta?.requireAuth)
        router.push('login');
})
</script>
<template>
    <div class="root">
        <NavBar v-if="authState.loggedIn" />
        <div class="root-container">
            <RouterView v-slot="{Component, route}">
                    <component :is="Component" :key="route.path" />
            </RouterView>
        </div>
        <Footer class="footer" />
    </div>
</template>

<style scoped>
.slide-enter-active,
.slide-leave-active {
    transition: all 0.5s ease;
}

.slide-leave-active {
    position: absolute;
}

.slide-enter-from {
    transform: translateX(100%);
}

.slide-leave-to {
    transform: translateX(-100%);
}

.root-container {
    padding: 1rem;
    height: 100%;
    flex: 1;
    display: flex;
    flex-direction: column;
}

.footer {
    width: 100%;
    text-align: center;
    background-color: var(--header-bg-colour);
}

.root {
    min-height: 100vh;
    display: flex;
    flex-direction: column;
}
</style>
