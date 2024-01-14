import {useUser} from "~/store/user";

export default defineNuxtRouteMiddleware((to, from) => {
    const userStore = useUser();

    if (!userStore.token){
        return navigateTo('/');
    }
})
