import {createRouter, createWebHistory} from "vue-router";
import StockList from "../views/stock/StockList.vue";
import StockInfo from "../views/stock/StockInfo.vue";
import Snapshots from "../views/snapshot/Snapshots.vue";
import CreateSnapshot from "../views/snapshot/CreateSnapshot.vue";
import Login from "@/views/auth/Login.vue";
import Logout from "@/views/auth/Logout.vue";
import ProviderList from "@/views/providers/ProviderList.vue";
import ProviderInfo from "@/views/providers/ProviderInfo.vue";
import PerformanceVue from "@/views/performance/Performance.vue";
import HomeView from "@/views/HomeView.vue";
import Overview from "@/views/Overview.vue";

export const headerRoutes = [
        {
            path: '/',
            name: 'Home',
            component: Overview,
        },
        {
            path: '/stocks',
            name: 'Stocks',
            component: StockList,
        },
        {
            path: '/snapshots',
            name: 'Snapshots',
            component: Snapshots,
        },
        {
            path: '/providers',
            name: 'Providers',
            component: ProviderList,
            requireAdmin: true,
        },
        {
            path: '/performance',
            name: 'Performance',
            component: PerformanceVue,
        },
];

const routes = [
    {
        path: '/snapshots/create',
        name: 'Create snapshot',
        component: CreateSnapshot,
    },
    {
        path: '/providers/create',
        name: 'Create Provider',
        component: ProviderInfo,
    },
    {
        path: '/providers/:providerID',
        name: 'Update Provider',
        props: (route: any) => ({providerID: parseInt(route.params.providerID)}),
        component: ProviderInfo,
    },
];

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes: [
        ...headerRoutes,
        ...routes,
        {
            path: '/stocks/:id',
            props: true,
            name: 'Stock Info',
            component: StockInfo,
        },
        {
            path: '/login',
            name: 'Log in',
            component: Login,
        },
        {
            path: '/logout',
            name: 'Log out',
            component: Logout,
        },
    ]
});

export default router;
