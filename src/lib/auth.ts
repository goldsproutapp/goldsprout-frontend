import router from "@/router";
import {authState} from "./state";

export function logIn(data: any) {
    authState.loggedIn = true;
    authState.token = data.token;
    authState.userInfo = data.data;
    saveAuthState();
    router.push('/');
}

export function saveAuthState() {
    window.localStorage.setItem("userinfo", JSON.stringify(authState.userInfo));
    window.localStorage.setItem("token", authState.token);
}

export function logOut(require_login: boolean = false) {
    window.localStorage.removeItem("userinfo");
    window.localStorage.removeItem("token");
    authState.loggedIn = false;
    authState.token = "";
    authState.userInfo = {};
    if (require_login) {
        router.push("/login");
    }
}
