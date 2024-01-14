<script setup lang="ts">
import {definePageMeta, getReqHeaders} from "#imports";
import type {Ref} from "vue";
import type {Space} from "~/types";

definePageMeta({
  middleware: 'auth'
});

const {apiUrl} = useRuntimeConfig().public;
const {data: spaces, refresh}: {data: Ref<Space[]>} = await useFetch(`/spaces`, {
  baseURL: apiUrl,
  ...getReqHeaders()
})

async function createSpace(){
  await $fetch('/spaces', {
    method: 'POST',
    baseURL: apiUrl,
    ...getReqHeaders(),
    body: {
      name: newSpaceName.value
    }
  });

  await refresh()

  addingSpace.value = false;
  newSpaceName.value = "";
}

async function updateSpace(space: Space){
  await $fetch(`/spaces/${space.id}`, {
    method: 'PUT',
    baseURL: apiUrl,
    ...getReqHeaders(),
    body: {
      name: space.name
    }
  });

  await refresh();

  editingSpaceId.value = 0
}

const editingSpaceId = ref(0);
const addingSpace = ref(false);
const newSpaceName = ref("");
</script>

<template>
  <div class="max-w-2xl mx-auto">
    <div class="flex items-center mb-10 justify-between w-full">
      <h2 class="text-3xl font-semibold">Your Spaces</h2>
      <UButton
          icon="i-heroicons-plus"
          variant="outline"
          size="xs"
          @click="addingSpace = !addingSpace"
      >
        Space
      </UButton>
    </div>
    <div class="flex flex-col gap-2">
      <div
          v-if="addingSpace"
          class="flex gap-2 mb-5"
      >
        <UInput
            v-model="newSpaceName"
            placeholder="New space's name"
            class="w-full"
        />
        <UButton
            variant="outline"
            @click="createSpace()"
        >
          Create
        </UButton>
      </div>
      <div
          v-for="space in spaces"
          :key="space.id"
          class="rounded-md bg-slate-700 p-2 text-lg flex items-center"
      >
        <span class="text-sm text-slate-300 mr-2">
          #{{space.id}}
        </span>
        <UInput
            v-if="editingSpaceId === space.id"
            v-model="space.name"
            variant="none"
            class="border-b border-b-green-500"
        />
        <span
            v-if="editingSpaceId !== space.id"
        >
          {{space.name}}
        </span>
        <div class="ml-auto">
          <NuxtLink
              :to="`/spaces/${space.id}`"
          >
            <UButton
                icon="i-heroicons-arrow-top-right-on-square"
                variant="link"
                color="blue"
            />
          </NuxtLink>
          <UButton
              v-if="editingSpaceId !== space.id"
              icon="i-heroicons-pencil-square"
              variant="link"
              class="rounded-full"
              @click="editingSpaceId = space.id"
          />
          <UButton
              v-if="editingSpaceId === space.id"
              icon="i-heroicons-x-mark-solid"
              variant="link"
              color="red"
              @click="editingSpaceId = 0"
          />
          <UButton
              v-if="editingSpaceId === space.id"
              icon="i-heroicons-check"
              variant="link"
              color="green"
              @click="updateSpace(space)"
          />
        </div>
      </div>
    </div>
  </div>
</template>
