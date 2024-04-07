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
import Overview from "@/views/Overview.vue";
import Profile from "@/views/auth/Profile.vue";
import Invitation from "@/views/auth/Invitation.vue";

export const headerRoutes = [
    {
        path: '/',
        name: 'Home',
        component: Overview,
        meta: {
            reuireAuth: true,
        },
    },
    {
        path: '/stocks',
        name: 'Stocks',
        component: StockList,
        meta: {
            reuireAuth: true,
        },
    },
    {
        path: '/snapshots',
        name: 'Snapshots',
        component: Snapshots,
        meta: {
            reuireAuth: true,
        },
    },
    {
        path: '/providers',
        name: 'Providers',
        component: ProviderList,
        meta: {
            reuireAuth: true,
            requireAdmin: true,
        },
    },
    {
        path: '/performance',
        name: 'Performance',
        component: PerformanceVue,
        meta: {
            requireAuth: true,
        }
    },
];

const routes = [
    {
        path: '/snapshots/create',
        name: 'Create snapshot',
        component: CreateSnapshot,
        meta: {
            requireAuth: true,
        }
    },
    {
        path: '/providers/create',
        name: 'Create Provider',
        component: ProviderInfo,
        meta: {
            requireAuth: true,
        }
    },
    {
        path: '/providers/:providerID',
        name: 'Update Provider',
        props: (route: any) => ({providerID: parseInt(route.params.providerID)}),
        component: ProviderInfo,
        meta: {
            requireAuth: true,
        }
    },
    {
        path: '/stocks/:id',
        props: true,
        name: 'Stock Info',
        component: StockInfo,
        meta: {
            requireAuth: true,
        }
    },
];

const authRoutes = [
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
    {
        path: '/invitation',
        name: 'Invitation',
        component: Invitation
    },
    {
        path: '/profile',
        name: 'Profile',
        component: Profile,
        meta: {
            requireAuth: true,
        }
    },
]

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes: [
        ...headerRoutes,
        ...routes,
        ...authRoutes,
    ]
});

export default router;
