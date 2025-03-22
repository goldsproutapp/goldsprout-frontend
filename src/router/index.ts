import { createRouter, createWebHistory } from 'vue-router';
import type { RouteRecordRaw, RouteComponent } from 'vue-router';
import StockList from '../views/stock/StockList.vue';
import StockInfo from '../views/stock/StockInfo.vue';
import Snapshots from '../views/snapshot/Snapshots.vue';
import CreateSnapshot from '../views/snapshot/CreateSnapshot.vue';
import Login from '@/views/auth/Login.vue';
import Logout from '@/views/auth/Logout.vue';
import ProviderList from '@/views/providers/ProviderList.vue';
import ProviderInfo from '@/views/providers/ProviderInfo.vue';
import TrendsVue from '@/views/analysis/Trends.vue';
import Overview from '@/views/Overview.vue';
import Profile from '@/views/auth/Profile.vue';
import Invitation from '@/views/auth/Invitation.vue';
import UserList from '@/views/admin/UserList.vue';
import InviteUser from '@/views/admin/InviteUser.vue';
import EditUser from '@/views/admin/EditUser.vue';
import ImportSnapshots from '@/views/snapshot/ImportSnapshots.vue';
import CompositionVue from '@/views/analysis/Composition.vue';
import AccountList from '@/views/accounts/AccountList.vue';
import AccountInfo from '@/views/accounts/AccountInfo.vue';
import CreateAccount from '@/views/accounts/CreateAccount.vue';
import ReportPage from '@/views/analysis/ReportPage.vue';
import NotFound from '@/views/auth/NotFound.vue';

export type Route = RouteRecordRaw & {
  component: RouteComponent & { __name?: string };
  meta?: {
    requireAdmin?: boolean;
    allowNoAuth?: boolean;
    keepAlive?: boolean;
  };
};

export const headerRoutes: Route[] = [
  {
    path: '/',
    name: 'Home',
    component: Overview,
    meta: {
      keepAlive: true
    }
  },
  {
    path: '/stocks',
    name: 'Stocks',
    component: StockList,
    meta: {
      keepAlive: true
    }
  },
  {
    path: '/snapshots',
    name: 'Snapshots',
    component: Snapshots,
    meta: {
      keepAlive: true
    }
  },
  {
    path: '/trends',
    name: 'Trends',
    component: TrendsVue,
    meta: {
      keepAlive: true
    }
  },
  {
    path: '/composition',
    name: 'Composition',
    component: CompositionVue,
    meta: {
      keepAlive: true
    }
  },
  {
    path: '/accounts',
    name: 'Accounts',
    component: AccountList,
    meta: {
      keepAlive: true
    }
  },
  {
    path: '/reports',
    name: 'Reports',
    component: ReportPage,
    meta: {
      keepAlive: true
    }
  }
];

const routes = [
  {
    path: '/snapshots/create',
    name: 'Create snapshot',
    component: CreateSnapshot
  },
  {
    path: '/snapshots/import',
    name: 'Import snapshots',
    component: ImportSnapshots,
    meta: {
      requireAdmin: true
    }
  },
  {
    path: '/providers/create',
    name: 'Create Provider',
    component: ProviderInfo,
    meta: {
      requireAdmin: true
    }
  },
  {
    path: '/providers/:providerID',
    name: 'Update Provider',
    props: (route: any) => ({ providerID: parseInt(route.params.providerID) }),
    component: ProviderInfo,
    meta: {
      requireAdmin: true
    }
  },
  {
    path: '/accounts/create',
    name: 'Create Account',
    component: CreateAccount
  },
  {
    path: '/accounts/:accountID',
    name: 'Update Account',
    props: (route: any) => ({ accountID: parseInt(route.params.accountID) }),
    component: AccountInfo
  },
  {
    path: '/stocks/:id',
    props: true,
    name: 'Stock Info',
    component: StockInfo
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'Not Found',
    component: NotFound
  }
];

const authRoutes = [
  {
    path: '/login',
    name: 'Log in',
    component: Login,
    meta: {
      allowNoAuth: true
    }
  },
  {
    path: '/logout',
    name: 'Log out',
    component: Logout,
    meta: {
      allowNoAuth: true
    }
  },
  {
    path: '/invitation',
    name: 'Invitation',
    component: Invitation,
    meta: {
      allowNoAuth: true
    }
  },
  {
    path: '/options',
    name: 'Options',
    component: Profile
  }
];
const adminRoutes = [
  {
    path: '/users',
    name: 'Users',
    component: UserList,
    meta: {
      requireAdmin: true
    }
  },
  {
    path: '/users/create',
    name: 'Invite user',
    component: InviteUser,
    meta: {
      requireAdmin: true
    }
  },
  {
    path: '/users/:id',
    name: 'Edit user',
    component: EditUser,
    props: true,
    meta: {
      requireAdmin: true
    }
  },
  {
    path: '/providers',
    name: 'Providers',
    component: ProviderList,
    meta: {
      requireAdmin: true,
      keepAlive: true
    }
  }
];

export const allRoutes: Route[] = [...headerRoutes, ...routes, ...authRoutes, ...adminRoutes];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: allRoutes
});

export default router;
