import type {User} from "~/types";
import {getReqHeaders} from "~/utils";


export const useUser = defineStore('user', () => {
    const {apiUrl} = useRuntimeConfig().public;

    const user = ref<User | null>(null);
    const token = useCookie<string>('token', {maxAge: 60 * 60 * 24 * 30, default: () => ref("")});

    async function loadUser(){
        user.value = await $fetch(`/users/current`, {
            baseURL: apiUrl,
            ...getReqHeaders(),
        });
    }

    async function login(username: string, password: string){
        const response = await $fetch.raw('/users/login', {
            method: 'POST',
            baseURL: apiUrl,
            body: {
                username,
                password
            }
        });
        user.value = response._data;
        token.value = response.headers.get('authorization');
        await navigateTo('/spaces')
    }

    async function register(name: string, username: string, password: string){
        const response = await $fetch.raw('/users/create', {
            method: 'POST',
            baseURL: apiUrl,
            body: {
                name,
                username,
                password
            }
        });

        user.value = response._data;
        token.value = response.headers.get('authorization');
        await navigateTo('/spaces')
    }

    return {
        token,
        user,
        loadUser,
        register,
        login
    }
})
