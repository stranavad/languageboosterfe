// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
    modules: ['@nuxt/ui'],
    colorMode: {
        preference: 'dark'
    },
    runtimeConfig: {
      public: {
          apiUrl: 'https://languageboostergo.fly.dev'
      }
    },
    devtools: {enabled: false}
})
