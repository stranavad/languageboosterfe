<script setup lang="ts">
import type {Language, Mutation, MutationValue} from "~/types";
import {statuses } from '~/utils/statuses';

const {apiUrl} = useRuntimeConfig().public;
const open = defineModel<boolean>();
const props = defineProps<{
  mutationId: number;
  projectId: number
}>();

watch(() => open.value, async (newOpened) => {
  if(newOpened){
    await init();
  }
})

const mode = ref<'create' | 'edit'>('edit');
const languages = ref<Language[]>([]);
const defaultMutation: Mutation = {
  id: 0,
  key: "",
  status: statuses[0],
  values: []
}
const mutation = ref<Mutation>(defaultMutation);

const mutationData = ref<{[k: number | string]: string}>({});

function checkFieldChanged(languageId: number | string){
  if(mode.value === 'create'){
    return false
  }

  if(languageId === 'key'){
    return mutationData.value['key'] !== mutation.value.key || mutationData.value['status'] !== mutation.value.status;
  }

  return mutationData.value[languageId] !== mutation.value.values.find(mv => mv.languageId === languageId)?.value
}

async function updateMutation(){
  if(mode.value === 'create'){
    return;
  }

  const response = await $fetch<Mutation>(`/mutations/${mutation.value.id}`, {
    baseURL: apiUrl,
    method: 'PUT',
    body: {
      key: mutationData.value['key'],
      status: mutationData.value['status']
    },
    ...getReqHeaders(),
  });
  mutation.value.status = response.status;
  mutation.value.key = response.key;
}

async function updateMutationValue(languageId: number){
  if(mode.value === 'create'){
    return;
  }

  const value = mutationData.value[languageId];
  const mutationValue = mutation.value.values.find(mv => mv.languageId === languageId);

  if(!mutationValue){
    const newMutationValue = await $fetch<MutationValue>('/mutations/value', {
      baseURL: apiUrl,
      method: 'POST',
      body: {
        value,
        languageId,
        mutationId: mutation.value.id
      },
      ...getReqHeaders(),
    });
    mutation.value.values.push(newMutationValue)
    return;
  }

  const updated = await $fetch<MutationValue>(`/mutations/value/${mutationValue.id}`, {
    baseURL: apiUrl,
    method: 'PUT',
    body: {
      value,
    },
    ...getReqHeaders(),
  });

  const index = mutation.value.values.findIndex(mv => mv.languageId === languageId);
  mutation.value.values[index] = updated;
}

async function createMutation(){
  const {key, ...valuesData} = mutationData.value;
  const data = {
    projectId: props.projectId,
    key: key,
    status: 'NEEDS_TRANSLATION',
    values: Object.entries(valuesData).map(([languageId, value]) => {
      return {
        languageId: Number(languageId),
        value,
        status: 'NEEDS_TRANSLATION'
      }
    })
  }

  await $fetch('/mutations', {
    baseURL: apiUrl,
    method: 'POST',
    body: data,
    ...getReqHeaders(),
  })

  open.value = false;
}

async function init(){
  console.log('init', props);
  mutation.value = defaultMutation;
  mutationData.value = {};
  languages.value = await $fetch<Language[]>(`/languages/${props.projectId}`, {
    baseURL: apiUrl,
    ...getReqHeaders()
  });

  let found: Mutation | null = null;

  if(props.mutationId){
    console.log('have mutation ID');
    found = await $fetch<Mutation | null>(`/mutations/${props.mutationId}`, {
      baseURL: apiUrl,
      ...getReqHeaders()
    });
  }


  if(!found){
    mode.value = 'create'
    mutationData.value['status'] = statuses[0]
    mutationData.value['key'] = "";
    languages.value.forEach(language => {
      mutationData.value[language.id] = ""
    })
  } else {
    mode.value = 'edit'
    mutation.value = found
    mutationData.value['status'] = mutation.value.status
    mutationData.value['key'] = mutation.value.key;
    languages.value.forEach(language => {
      mutationData.value[language.id] = mutation.value.values.find(mv => mv.languageId === language.id)?.value || ""
    })
  }
}
</script>
<template>
  <div>
    <UModal v-model="open">
      <div class="flex flex-col gap-2 p-4">
        <span class="text-2xl">
          {{
            mode === 'create' ? 'Create new mutation' : 'Update mutation'
          }}
        </span>
        <UFormGroup
          label="Key"
        >
          <UInput
            v-model="mutationData['key']"
          />
        </UFormGroup>
        <UFormGroup
          label="Status"
        >
          <USelectMenu v-model="mutationData['status']" :options="statuses" class="mt-2"/>
        </UFormGroup>
        <UButton
            v-if="checkFieldChanged('key')"
            class="mt-2"
            size="xs"
            block
            variant="outline"
            @click="updateMutation()"
        >
          Save
        </UButton>
        <UFormGroup
          v-for="language in languages"
          :label="language.name"
        >
          <UTextarea
            v-model="mutationData[language.id]"
          />
          <UButton
            v-if="checkFieldChanged(language.id)"
            class="mt-2"
            size="xs"
            block
            variant="outline"
            @click="updateMutationValue(language.id)"
          >
            Save
          </UButton>
        </UFormGroup>
        <UButton
            v-if="mode === 'create'"
          block
          @click="createMutation()"
        >
          Create new mutation
        </UButton>
      </div>
    </UModal>
  </div>
</template>

