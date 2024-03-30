import {reactive} from "vue";
import {type User, type Provider, type Stock, type Snapshot} from "./types";

export const authState = reactive({
    loggedIn: false,
    token: '',
    userInfo: {},
});


export const dataState = reactive({
    stocks: new Array<Stock>(),
    providers: new Array<Provider>,
    snapshots_latest: new Array<Snapshot>,
    snapshots_all: new Array<Snapshot>,
    users: new Array<User>,
})


export function updateAuthState() {
    const token = window.localStorage.getItem("token");
    const userInfo = JSON.parse(window.localStorage.getItem("userinfo") || "{}");
    authState.token = token || '';
    authState.loggedIn = token !== null;
    authState.userInfo = userInfo;
}
