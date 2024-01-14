<script setup lang="ts">
import type {Language, Project, Space} from "~/types";
import type {Ref} from "vue";
import {definePageMeta} from "#imports";

definePageMeta({
  middleware: 'auth'
})

const route = useRoute();

const projectId = computed(() => {
  return Number(route.params.projectId)
});
const spaceId = Number(route.params.spaceId)

const {apiUrl} = useRuntimeConfig().public;
const {data: space}: {data: Ref<Space>} = await useFetch(`/spaces/${spaceId}`, {
  baseURL: apiUrl,
  ...getReqHeaders()
})

const {data: project}: {data: Ref<Project>} = await useFetch(`/projects/by-id/${projectId.value}`, {
  baseURL: apiUrl,
  ...getReqHeaders()
})

if(project.value.spaceId !== space.value.id){
  await navigateTo('/spaces')
}

const {data: languages, refresh}: {data: Ref<Language[]>} = await useFetch(`/languages/${projectId.value}`, {
  baseURL: apiUrl,
  ...getReqHeaders(),
});

async function updateLanguage(language: Language){
  await $fetch(`/languages/${language.id}`, {
    method: 'PUT',
    baseURL: apiUrl,
    body: {
      name: language.name
    },
    ...getReqHeaders(),
  });

  await refresh();
  editingLanguageId.value = 0;
}

async function createLanguage(){
  await $fetch('/languages', {
    method: 'POST',
    baseURL: apiUrl,
    body: {
      name: newLanguageName.value,
      projectId: projectId.value
    },
    ...getReqHeaders(),
  })

  await refresh();
  newLanguageName.value = "";
  addingLanguage.value = false
}

const editingLanguageId = ref(0);
const addingLanguage = ref(false);
const newLanguageName = ref("");
</script>

<template>
  <div
      class="max-w-2xl mx-auto"
  >
    <div class="flex items-center mb-10 justify-between w-full">
      <div class="flex items-center">
        <h2 class="text-3xl font-semibold mr-5 flex items-center">
          <span class="text-xl text-slate-300 mr-2">
            <NuxtLink
              :to="`/spaces/${space.id}`"
            >
              {{space.name}}
            </NuxtLink>
            |
            <NuxtLink
              :to="`/spaces/${space.id}/project/${project.id}`"
            >
              {{project.name}}
            </NuxtLink>
            |
          </span>
          Languages
        </h2>
        <NuxtLink
            :to="`/spaces/${spaceId}/project/${projectId}`"
        >
          <UButton
              size="xs"
              variant="outline"
          >
            Mutations
          </UButton>
        </NuxtLink>
      </div>

      <UButton
          icon="i-heroicons-plus"
          variant="outline"
          size="xs"
          @click="addingLanguage = !addingLanguage"
      >
        Language
      </UButton>
    </div>
    <div
        class="flex flex-col gap-2"
    >
      <div
          v-if="addingLanguage"
          class="flex gap-2 mb-5"
      >
        <UInput
            v-model="newLanguageName"
            placeholder="New language's name"
            class="w-full"
        />
        <UButton
            variant="outline"
            @click="createLanguage()"
        >
          Create
        </UButton>
      </div>
      <div
          v-for="language in languages"
          :key="language.id"
          class="rounded-md bg-slate-700 p-2 text-lg flex items-center"
      >
        <span class="text-sm text-slate-300 mr-2">
          #{{language.id}}
        </span>
        <UInput
            v-if="editingLanguageId === language.id"
            v-model="language.name"
            variant="none"
            class="border-b border-b-green-500"
        />
        <span
            v-if="editingLanguageId !== language.id"
        >
          {{language.name}}
        </span>
        <div class="ml-auto">
          <UButton
              v-if="editingLanguageId !== language.id"
              icon="i-heroicons-pencil-square"
              variant="link"
              class="rounded-full"
              @click="editingLanguageId = language.id"
          />
          <UButton
              v-if="editingLanguageId === language.id"
              icon="i-heroicons-x-mark-solid"
              variant="link"
              color="red"
              @click="editingLanguageId = 0"
          />
          <UButton
              v-if="editingLanguageId === language.id"
              icon="i-heroicons-check"
              variant="link"
              color="green"
              @click="updateLanguage(language)"
          />
        </div>
      </div>
    </div>
  </div>
</template>
