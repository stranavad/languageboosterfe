<script setup lang="ts">
import type {Ref} from "vue";
import type {Language, Mutation, Project, Space} from "~/types";
import {definePageMeta} from "#imports";

definePageMeta({
  middleware: 'auth'
})

const route = useRoute();

const projectId = computed(() => {
  return Number(route.params.projectId)
});

const spaceId = Number(route.params.spaceId);

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

const {data: mutations, refresh}: {data: Ref<Mutation[]>} = await useFetch(`/mutations/project/${projectId.value}`, {
  baseURL: apiUrl,
  ...getReqHeaders(),
})
const {data: languages}: {data: Ref<Language[]>} = await useFetch(`/languages/${projectId.value}`, {
  baseURL: apiUrl,
  ...getReqHeaders(),
})


const columns = computed(() => ([
  {
    key: 'key',
    label: 'Key'
  },
  ...languages.value.map((l) => ({
    key: `lang-${l.id}`,
    label: l.name
  })),
  {
    key: 'actions',
  }
]));

const items = (row) => [
  [{
    label: 'Edit',
    icon: 'i-heroicons-pencil-square-20-solid',
    click: () => {
      editingMutationId.value = row.id;
      openedMutationModal.value = true
    }
  }, {
    label: 'Delete',
    icon: 'i-heroicons-trash-20-solid',
    click: async () => {
      await $fetch(`/mutations/${row.id}`, {
        method: 'DELETE',
        baseURL: apiUrl
      });
      refresh();
    }
  }]
]

const openedMutationModal = ref(false);
const editingMutationId = ref(0);

watch(() => openedMutationModal.value, (newValue) => {
  if(!newValue){
    refresh();
  }
})

const values = computed(() => mutations.value.map(m => ({
  id: m.id,
  key: m.key,
  ...m.values.reduce((acc, current) => {
    acc[`lang-${current.languageId}`] = current.value
    return acc
  }, {})
})))
</script>

<template>
  <div class="max-w-6xl mx-auto">
    <div class="flex justify-between mb-5">
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
          Mutations
        </h2>
        <NuxtLink
            :to="`/spaces/${spaceId}/project/${projectId}/languages`"
        >
          <UButton
              size="xs"
              variant="outline"
          >
            Languages
          </UButton>
        </NuxtLink>
      </div>
      <UButton
          @click="editingMutationId = 0; openedMutationModal = true"
      >
        Create new
      </UButton>
    </div>
    <div class="border rounded-md border-slate-700">
      <MutationModal
          v-model="openedMutationModal"
          :project-id="projectId"
          :mutation-id="editingMutationId"
      />
      <UTable
          :rows="values"
          :columns="columns"
      >
        <template #actions-data="{ row }">
          <UDropdown :items="items(row)">
            <UButton color="slate" variant="ghost" icon="i-heroicons-ellipsis-horizontal-20-solid" />
          </UDropdown>
        </template>
      </UTable>
    </div>
  </div>
</template>
