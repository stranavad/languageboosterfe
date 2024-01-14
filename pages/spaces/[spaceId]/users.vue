<script setup lang="ts">
import {definePageMeta} from "#imports";
import type {Ref} from "vue";
import type {Space} from "~/types";
import {useUser} from "~/store/user";

definePageMeta({
  middleware: 'auth'
})

const userStore = useUser();
const route = useRoute();
const spaceId = Number(route.params.spaceId)

const {apiUrl} = useRuntimeConfig().public;
const {data: space, refresh}: {data: Ref<Space>}  = await useFetch(`/spaces/${spaceId}`, {
  baseURL: apiUrl,
  ...getReqHeaders()
})

async function leaveSpace(){
  await $fetch(`/spaces/leave/${spaceId}`, {
    method: 'POST',
    baseURL: apiUrl,
    ...getReqHeaders()
  })
  await navigateTo('/spaces')
}

const addingUser = ref(false);
const newUserUsername = ref("");

async function addUser(){
  await $fetch(`/spaces/add-user/${spaceId}/${newUserUsername.value}`, {
    method: 'POST',
    baseURL: apiUrl,
    ...getReqHeaders()
  })

  await refresh();
  addingUser.value = false;
  newUserUsername.value = ""
}


</script>

<template>
  <div
      class="max-w-2xl mx-auto"
  >
    <div class="flex items-center mb-10 justify-between w-full">
      <div class="flex items-center">
        <h2 class="text-3xl font-semibold mr-5">{{ space.name }} | Users</h2>
        <NuxtLink
            :to="`/spaces/${spaceId}`"
        >
          <UButton
              size="xs"
              variant="outline"
          >
            Projects
          </UButton>
        </NuxtLink>
      </div>
      <UButton
          icon="i-heroicons-plus"
          variant="outline"
          size="xs"
          @click="addingUser = !addingUser"
      >
        User
      </UButton>
    </div>
    <div
      class="flex flex-col gap-2"
    >
      <div
          v-if="addingUser"
          class="flex gap-2 mb-5"
      >
        <UInput
            v-model="newUserUsername"
            placeholder="Username of EXISTING user"
            class="w-full"
        />
        <UButton
            variant="outline"
            @click="addUser()"
        >
          Create
        </UButton>
      </div>
      <div
          v-for="user in space.users"
          :key="user.id"
          class="rounded-md bg-slate-700 p-2 text-lg flex items-center"
      >
        <span class="text-sm text-slate-300 mr-2">
          #{{user.id}}/{{user.username}}
        </span>
        <span
        >
          {{user.name}}
        </span>
        <div class="ml-auto">
          <UButton
              v-if="user.id === userStore.user?.id"
              icon="i-heroicons-arrow-left-end-on-rectangle"
              variant="link"
              color="red"
              class="rounded-full"
              @click="leaveSpace()"
          />
        </div>
      </div>
    </div>
</div>
</template>
