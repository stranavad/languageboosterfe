<script lang="ts" setup>
import type {Project, Space} from "~/types";
import type {Ref} from "vue";
import {definePageMeta, getReqHeaders} from "#imports";

definePageMeta({
  middleware: 'auth'
})

const route = useRoute();
const spaceId = Number(route.params.spaceId)

const {apiUrl} = useRuntimeConfig().public;
const {data: space, refresh}: {data: Ref<Space>} = await useFetch(`/spaces/${spaceId}`, {
  baseURL: apiUrl,
  ...getReqHeaders()
})

const editingProjectId = ref(0);
const addingProject = ref(false);
const newProjectName = ref("");

async function updateProject(project: Project){
  await $fetch(`/projects/${project.id}`, {
    method: 'PUT',
    baseURL: apiUrl,
    body: {
      name: project.name.trim()
    },
    ...getReqHeaders(),
  });

  await refresh();
  editingProjectId.value = 0;
}

async function createProject(){
  if(!newProjectName.value.trim()){
    return;
  }

  await $fetch('/projects', {
    method: 'POST',
    baseURL: apiUrl,
    body: {
      name: newProjectName.value.trim(),
      spaceId,
    },
    ...getReqHeaders(),
  });

  await refresh();
  newProjectName.value = "";
  addingProject.value = false;
}
</script>
<template>
  <div
      class="max-w-2xl mx-auto"
  >
    <div class="flex items-center mb-10 justify-between w-full">
      <div class="flex items-center">
        <h2 class="text-3xl font-semibold mr-5">{{ space.name }} | Projects</h2>
        <NuxtLink
            :to="`/spaces/${spaceId}/users`"
        >
          <UButton
              size="xs"
              variant="outline"
          >
            Users
          </UButton>
        </NuxtLink>
      </div>
      <UButton
          icon="i-heroicons-plus"
          variant="outline"
          size="xs"
          @click="addingProject = !addingProject"
      >
        Project
      </UButton>
    </div>
    <div
        class="flex flex-col gap-2"
    >
      <div
          v-if="addingProject"
          class="flex gap-2 mb-5"
      >
        <UInput
            v-model="newProjectName"
            placeholder="New project's name"
            class="w-full"
        />
        <UButton
            variant="outline"
            @click="createProject()"
        >
          Create
        </UButton>
      </div>
      <div
          v-for="project in space.projects"
          :key="project.id"
          class="rounded-md bg-slate-700 p-2 text-lg flex items-center"
      >
        <span class="text-sm text-slate-300 mr-2">
          #{{project.id}}
        </span>
        <UInput
            v-if="editingProjectId === project.id"
            v-model="project.name"
            variant="none"
            class="border-b border-b-green-500"
        />
        <span
            v-if="editingProjectId !== project.id"
        >
          {{project.name}}
        </span>
        <div class="ml-auto">
          <NuxtLink
              :to="`/spaces/${spaceId}/project/${project.id}`"
          >
            <UButton
                icon="i-heroicons-arrow-top-right-on-square"
                variant="link"
                color="blue"
            />
          </NuxtLink>
          <UButton
              v-if="editingProjectId !== project.id"
              icon="i-heroicons-pencil-square"
              variant="link"
              class="rounded-full"
              @click="editingProjectId = project.id"
          />
          <UButton
              v-if="editingProjectId === project.id"
              icon="i-heroicons-x-mark-solid"
              variant="link"
              color="red"
              @click="editingProjectId = 0"
          />
          <UButton
              v-if="editingProjectId === project.id"
              icon="i-heroicons-check"
              variant="link"
              color="green"
              @click="updateProject(project)"
          />
        </div>
      </div>
    </div>
  </div>
</template>
