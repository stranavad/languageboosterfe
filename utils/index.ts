import {useUser} from "~/store/user";

export function getReqHeaders(){
    const userStore = useUser();
    return {
        headers: {
            Authorization: userStore.token
        }
    }
}
