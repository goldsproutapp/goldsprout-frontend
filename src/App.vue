<script setup lang="ts">
import { RouterView } from 'vue-router';
import NavBar from './components/NavBar.vue';
import Footer from './components/Footer.vue';
import { authState, updateAuthState } from './lib/state';
import { onMounted, watch } from 'vue';
import router, { allRoutes } from './router';
import Toast from 'primevue/toast';
import Unauthorised from './views/auth/Unauthorised.vue';
import { computed } from 'vue';
import DemoBanner from './components/layout/DemoBanner.vue';
import ConfirmDialog from 'primevue/confirmdialog';

watch(router.currentRoute, (newRoute, _) => {
  if (!authState.loggedIn && !newRoute.meta?.allowNoAuth) router.push('/login');
});
onMounted(() => {
  updateAuthState();
});
const includeKeepAlive = computed(() =>
  allRoutes
    .filter((route) => route.meta?.keepAlive ?? false)
    .filter((route) => route.component?.__name)
    .map((route) => route.component?.__name ?? '')
);
</script>
<template>
  <div class="root">
    <Toast position="bottom-left" group="bl" />
    <Toast position="bottom-right" group="br" />
    <Toast position="top-left" group="tl" />
    <Toast position="top-right" group="tr" />
    <ConfirmDialog></ConfirmDialog>
    <DemoBanner v-if="authState.loggedIn && authState.userInfo.is_demo_user" />
    <NavBar v-if="authState.loggedIn" />
    <div class="root-container">
      <RouterView v-slot="{ Component, route }">
        <keep-alive :max="10" :include="includeKeepAlive">
          <component
            :is="Component"
            :key="route.path"
            v-if="authState.userInfo?.is_admin || !route.meta.requireAdmin"
          />
          <Unauthorised v-else />
        </keep-alive>
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
