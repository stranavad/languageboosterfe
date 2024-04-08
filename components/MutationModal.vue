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
const keepOpen = useCookie(
  'keepOpen',
  {
    default: () => true,
  }
)
const defaultMutation: Mutation = {
  id: 0,
  key: "",
  status: statuses[0],
  values: []
}
const mutation = ref<Mutation>(defaultMutation);

const mutationData = ref<{[k: number | string]: string}>({});


const allFilled = computed(() => {
  return Object.keys(mutationData.value).filter(key => isNumeric(key)).every(key => mutationData.value[key] !== "")
})
watch(allFilled, (value) => {
  // if every numeric key is not empty then switch status to final one
  if(mutationData.value.status){
    mutationData.value.status =  value ? statuses[1] : statuses[0];
  }
}, {deep: true})

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

const loading = ref(false);
const toast = useToast();
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

  loading.value = true;
  try {
    await $fetch('/mutations', {
    baseURL: apiUrl,
    method: 'POST',
    body: data,
    ...getReqHeaders(),
  })
  toast.add({
    title: 'Mutation created',
  })
  loading.value = false;
  open.value = keepOpen.value;
  // save mutation key to cliipboard
  if(navigator?.clipboard){
    navigator.clipboard.writeText(key);
  }

  // clear mutatations language data

  Object.keys(mutationData.value).forEach(key => {

    if(isNumeric(key)){
      mutationData.value[key] = "";
    }
  })
  
  } catch (error) {
    loading.value = false;
    toast.add({
      title: 'Something went wrong',
      color: 'red'
    })
  }




}

async function init(){

  mutation.value = defaultMutation;
  mutationData.value = {};
  languages.value = await $fetch<Language[]>(`/languages/${props.projectId}`, {
    baseURL: apiUrl,
    ...getReqHeaders()
  });

  let found: Mutation | null = null;

  if(props.mutationId){
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

function isNumeric(str: any) {
  if (typeof str != "string") return false // we only process strings!  
  // @ts-ignore
  return !isNaN(str) && // use type coercion to parse the _entirety_ of the string (`parseFloat` alone does not do this)...
         !isNaN(parseFloat(str)) // ...and ensure strings of whitespace fail
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
        <div v-if="mode === 'create'" class="flex flex-col  gap-2 w-full">
        <UTooltip class="self-start" text="Keep modal open after saving mutation" >
          <UToggle
            v-model="keepOpen"
            class="mt-2"
          />
        </UTooltip> 
        <UButton

            block          
          :loading="loading"
          @click="createMutation()"
        >
          Create new mutation
        </UButton>
      </div>
      </div>
    </UModal>
  </div>
</template>

