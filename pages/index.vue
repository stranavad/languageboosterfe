<script lang="ts" setup>
import type {Project} from "~/types";
import type {Ref} from "vue";

const {apiUrl} = useRuntimeConfig().public;
const {data: projects, refresh}: {data: Ref<Project[]>} = await useFetch('/projects', {baseURL: apiUrl})

const editingProjectId = ref(0);
const addingProject = ref(false);
const newProjectName = ref("");

async function updateProject(project: Project){
  await $fetch(`/projects/${project.id}`, {
    method: 'PUT',
    baseURL: apiUrl,
    body: {
      name: project.name
    }
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
      name: newProjectName.value.trim()
    }
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
      <h2 class="text-3xl font-semibold">Projects</h2>
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
        v-for="project in projects"
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
            :to="`/${project.id}`"
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
