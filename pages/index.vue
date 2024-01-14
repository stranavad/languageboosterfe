<script setup lang="ts">
import {z} from "zod";
import {useUser} from "~/store/user";
import type {FormSubmitEvent} from "#ui/types";


definePageMeta({
  middleware: async () => {
    const userStore = useUser();
    if(userStore.user){
      return navigateTo('/spaces')
    }

    if(userStore.token){
      try {
        await userStore.loadUser()
        if(userStore.user){
          return navigateTo('/spaces')
        }
      } catch {
        // pass
        console.log('unable to login')
      }
    }
  }
})

const userStore = useUser();

const createUserSchema = z.object({
  name: z.string().min(5, "Name must be longer than 5 characters").max(50, "Name must be shorter than 50 characters"),
  username: z.string().min(5, "Username must be longer than 5 characters").max(50, "Username must be shorter than 50 characters"),
  password: z.string().min(5, "Password must be longer than 5 characters").max(50, "Password must be shorter than 50 characters")
})

const loginUserSchema = z.object({
  username: z.string().min(5, "Username must be longer than 5 characters"),
  password: z.string().min(5, "Password must be longer than 5 characters")
})

type LoginUserSchema = z.infer<typeof loginUserSchema>

const loginUserState = reactive<LoginUserSchema>({
  username: '',
  password: ''
});

function onLoginUser(event: FormSubmitEvent<LoginUserSchema>){
  userStore.login(event.data.username, event.data.password)
}

type CreateUserSchema = z.infer<typeof createUserSchema>
const createUserState = reactive<CreateUserSchema>({
  name: '',
  username: '',
  password: ''
})

function onCreateUser(event: FormSubmitEvent<CreateUserSchema>){
  userStore.register(event.data.name, event.data.username, event.data.password)
}

const tabItems = [
  {
    label: 'Login',
    key: 'login'
  },
  {
    label: 'Register',
    key: 'register'
  }
]
</script>

<template>
<div class="max-w-md mx-auto">
  <UTabs
    :items="tabItems"
  >
    <template #item="{item}">
      <UForm
          v-if="item.key === 'login'"
          :schema="loginUserSchema"
          :state="loginUserState"
          class="space-y-4"
          @submit="onLoginUser"
      >
        <UFormGroup label="Username" name="username">
          <UInput
              v-model="loginUserState.username"
          />
        </UFormGroup>
        <UFormGroup label="Password" name="password">
          <UInput
              v-model="loginUserState.password"
          />
        </UFormGroup>
        <UButton
            type="submit"
            block
            variant="outline"
            :disabled="!loginUserSchema.safeParse(loginUserState).success"
        >
          Login!
        </UButton>
      </UForm>
      <UForm
        v-if="item.key === 'register'"
        :schema="createUserSchema"
        :state="createUserState"
        class="space-y-4"
        @submit="onCreateUser"
      >
       <UFormGroup label="Name" name="name">
         <UInput
             v-model="createUserState.name"
         />
       </UFormGroup>
        <UFormGroup label="Username" name="username">
          <UInput
              v-model="createUserState.username"
          />
        </UFormGroup>
        <UFormGroup label="Password" name="password">
          <UInput
              v-model="createUserState.password"
          />
        </UFormGroup>
        <UButton
          type="submit"
          block
          variant="outline"
          :disabled="!createUserSchema.safeParse(createUserState).success"
        >
          Register!
        </UButton>
      </UForm>
    </template>
  </UTabs>
</div>
</template>
