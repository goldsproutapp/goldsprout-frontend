
<script setup lang="ts">
import {computed, onMounted, ref} from 'vue';
import {RouterLink} from 'vue-router';
import {authState, updateAuthState} from '@/lib/state';
import {headerRoutes} from '@/router';
const showMobileNavbar = ref(false);
onMounted(updateAuthState)
const visibleRoutes = computed(() => headerRoutes.filter(route => !route.requireAdmin || (authState.loggedIn && authState.userInfo.is_admin)));
</script>

<template>
    <div>
        <nav class="desktop-navbar">
            <RouterLink v-for="route in visibleRoutes" class="link" :to="route.path">{{ route.name }}</RouterLink>
            <div class="float-right">
                <RouterLink class="link" :to="authState.loggedIn ? '/logout' : '/login'">Log {{ authState.loggedIn ? 'Out' :
                    'In' }}</RouterLink>
            </div>
        </nav>
        <nav class="mobile-only">
            <div class="background">
                <svg viewBox="0 0 100 80" width="40" height="40" @click="showMobileNavbar = !showMobileNavbar">
                    <rect width="100" height="20"></rect>
                    <rect y="30" width="100" height="20"></rect>
                    <rect y="60" width="100" height="20"></rect>
                </svg>
            </div>
            <Transition name="slide">
                <div class="mobile-navbar" v-if="showMobileNavbar">
                    <RouterLink v-for="route in visibleRoutes" class="link" :to="route.path">{{ route.name }}</RouterLink>
                    <RouterLink class="link" :to="authState.loggedIn ? '/logout' : '/login'">Log {{ authState.loggedIn ?
                        'Out' :
                        'In' }}</RouterLink>
                </div>
            </Transition>
        </nav>
    </div>
</template>

<style scoped>
.desktop-navbar {
    background-color: var(--header-bg-colour);
    padding: 1rem;
    display: flex;
}

.background {
    background-color: var(--header-bg-colour);
    width: 100%;
    display: flex;
    justify-content: center;
}

.mobile-only {
    display: none;
}

.link {
    color: var(--indigo-100);
    padding: 1rem;
    border: .1rem solid var(--border-colour);
    border-radius: 2px;
    margin: .5rem;
    text-decoration: none;

}

.float-right {
    flex-grow: 1;
    display: flex;
    justify-content: end;
    margin-right: 1rem;
}

.mobile-navbar {
    display: flex;
    flex-direction: column;
    width: 100%;
    text-align: center;
    background-color: var(--header-bg-colour);
}

@media screen and (max-width: 600px) {
    .desktop-navbar {
        display: none;
    }

    .mobile-only {
        display: flex;
        flex-direction: column;
        align-items: center;
    }
}

.slide-enter-active,
.slide-leave-active {
    transition: all 0.5s ease;
}

.slide-leave-active {
    position: absolute;
}

.slide-enter-from {
    transform: translateY(-100%);
}

.slide-leave-to {
    transform: translateY(-100%);
}
</style>

