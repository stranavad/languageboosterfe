<template>
  <div class="mt-12">
    <div class="flex justify-center w-full mb-10">
      <NuxtLink
        class="text-3xl font-semibold uppercase cursor-pointer"
        to="/spaces"
      >
        Language Boo🐮ooster 
      </NuxtLink>
    </div>
    <NuxtPage/>
    <UNotifications />
  
  </div>
</template>
<script lang="ts" setup>

import {useUser} from "~/store/user";

const userStore = useUser();

if(userStore.token && !userStore.user){
  userStore.loadUser();
}

</script>
<style lang="scss">
body {
  @apply bg-slate-900;
}
</style>
