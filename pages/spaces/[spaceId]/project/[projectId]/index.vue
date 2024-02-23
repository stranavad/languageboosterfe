<script setup lang="ts">
import type {Ref} from "vue";
import type {Language, Mutation, Project, Space} from "~/types";
import {definePageMeta} from "#imports";
import vi = CSS.vi;
import {filterStatuses, statuses} from "~/utils/statuses";

definePageMeta({
    middleware: 'auth'
})

const route = useRoute();

const projectId = computed(() => {
    return Number(route.params.projectId)
});

const spaceId = Number(route.params.spaceId);

const {apiUrl} = useRuntimeConfig().public;
const {data: space}: { data: Ref<Space> } = await useFetch(`/spaces/${spaceId}`, {
    baseURL: apiUrl,
    ...getReqHeaders()
})

const {data: project}: { data: Ref<Project> } = await useFetch(`/projects/by-id/${projectId.value}`, {
    baseURL: apiUrl,
    ...getReqHeaders()
})

if (project.value.spaceId !== space.value.id) {
    await navigateTo('/spaces')
}

const {data: mutations, refresh}: { data: Ref<Mutation[]> } = await useFetch(`/mutations/project/${projectId.value}`, {
    baseURL: apiUrl,
    ...getReqHeaders(),
})
const {data: languages}: { data: Ref<Language[]> } = await useFetch(`/languages/${projectId.value}`, {
    baseURL: apiUrl,
    ...getReqHeaders(),
})


const columns = [
    {
        key: 'actions',
    },
    {
      key: 'status',
      label: 'Status'
    },
    {
        key: 'key',
        label: 'Key'
    },
    ...languages.value.map((l) => ({
        key: `lang-${l.id}`,
        label: l.name
    })),
];

const searchData = ref<{key: string, status: string, languages: {[k: number]: string}}>({
  key: '',
  status: filterStatuses[0],
  languages: languages.value.reduce((acc: {[k: number]: string}, current) => {
    acc[current.id] = ''
    return acc
  }, {})
});
const selectedColumns = ref([...columns]);
const visibleLanguages = computed<number[]>(() => {
  const matchedColumns = selectedColumns.value.filter(c => c.key.includes('lang'));
  return matchedColumns.map(c => Number(c.key.split('-')[1]));
});

const loading = ref(false);

async function search(){
  loading.value = true;
  const data = {
    key: searchData.value.key,
    status: searchData.value.status === 'ALL' ? '' : searchData.value.status,
    languages: Object.entries(searchData.value.languages).filter(([id, value]) => visibleLanguages.value.includes(Number(id)) && !!value.trim()).map(([id, search]) => ({languageId: Number(id), search}))
  }

  const response = await $fetch<Mutation[]>(`/mutations/project/${projectId.value}/search`, {
    method: 'POST',
    baseURL: apiUrl,
    ...getReqHeaders(),
    body: data
  });

  if(response){
    mutations.value = response;
  } else {
    mutations.value = [];
  }

  loading.value = false;
}

const items = (row) => [
    [{
        label: 'Edit',
        icon: 'i-heroicons-pencil-square-20-solid',
        click: () => {
          console.log(row);
            editingMutationId.value = row.id;
            setTimeout(() => {
              openedMutationModal.value = true
            })
        }
    }, {
        label: 'Delete',
        icon: 'i-heroicons-trash-20-solid',
        click: async () => {
            await $fetch(`/mutations/${row.id}`, {
                method: 'DELETE',
                baseURL: apiUrl,
                ...getReqHeaders(),
            });
            refresh();
        }
    }]
]

const openedMutationModal = ref(false);
const editingMutationId = ref(0);

watch(() => openedMutationModal.value, (newValue) => {
    if (!newValue) {
        refresh();
    }
})

const values = computed(() => mutations.value.map(m => ({
    id: m.id,
    key: m.key,
    status: m.status,
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
              {{ space.name }}
            </NuxtLink>
            |
            <NuxtLink
                :to="`/spaces/${space.id}/project/${project.id}`"
            >
              {{ project.name }}
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
            <div class="flex gap-1 p-2 border-b border-slate-700">
              <USelectMenu
                v-model="searchData.status"
                :options="filterStatuses"
              />
              <USelectMenu v-model="selectedColumns" :options="columns.filter(column => !['key', 'actions'].includes(column.key))" multiple placeholder="Columns">
                <template #label>
                  <span class="whitespace-nowrap">
                    {{visibleLanguages.length}} selected
                  </span>
                </template>
              </USelectMenu>
              <UForm class="flex gap-1" @submit="search()">
                <UInput v-model="searchData.key" placeholder="Key"/>
                <div v-for="language in languages.filter(l => visibleLanguages.includes(l.id))">
                  <UInput v-model="searchData.languages[language.id]" :placeholder="language.name"/>
                </div>
                <UButton type="submit" class="ml-auto" size="xs" variant="outline">
                  Search
                </UButton>
              </UForm>
            </div>
            <UTable
                :loading="loading"
                :rows="values"
                :columns="selectedColumns"
                :loading-state="{ icon: 'i-heroicons-arrow-path-20-solid', label: 'Loading...' }"
                :progress="{ color: 'primary', animation: 'carousel' }"
            >
              <template
                v-for="column in columns.filter(i => !['key', 'status', 'actions'].includes(i.key))"
                #[`${column.key}-data`]="{row}"
              >
                <span class="max-w-[200px] inline-block text-ellipsis whitespace-nowrap overflow-x-hidden">
                  {{row[column.key]}}
                </span>
              </template>
              <template #status-data="{row}">
                <div class="w-3 h-3 rounded-full mx-auto" :class="row.status === 'DONE' ? 'bg-green-500' : 'bg-red-500'"/>
              </template>
              <template #key-data="{row}">
                {{row.key}}
              </template>
              <template #actions-data="{ row }">
                  <UDropdown :items="items(row)" class="max-w-min">
                      <UButton color="slate" variant="ghost" icon="i-heroicons-ellipsis-horizontal-20-solid"/>
                  </UDropdown>
              </template>
            </UTable>
        </div>
    </div>
</template>
