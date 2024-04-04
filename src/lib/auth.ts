import router from "@/router";
import {authState} from "./state";

export function logIn(data: any) {
    window.localStorage.setItem("userinfo", JSON.stringify(data.data));
    window.localStorage.setItem("token", data.token);
    authState.loggedIn = true;
    authState.token = data.token;
    authState.userInfo = data.data;
    router.push('/');
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
