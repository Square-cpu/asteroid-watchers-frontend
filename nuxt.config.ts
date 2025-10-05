// https://nuxt.com/docs/api/configuration/nuxt-config

const API_BASE_URL = process.env.API_URL || 'http://localhost:5000/'

export default defineNuxtConfig({
  compatibilityDate: '2025-05-15',
  devtools: { enabled: true },
  runtimeConfig: {
    public: {
      baseURL: API_BASE_URL,
    },
  },
  auth: {
    isEnabled: true,
    baseURL: API_BASE_URL,
    provider: {
      type: 'local',
      endpoints: {
        signIn: { path: '/auth/login', method: 'post' },
        signOut: { path: '/auth/logout', method: 'post' },
        getSession: { path: '/user/me', method: 'get' },
      },
      pages: {
        login: '/login',
      },
      token: {
        signInResponseTokenPointer: '/access_token',
        type: 'Bearer',
        headerName: 'Authorization',
        maxAgeInSeconds: 60 * 60 * 24,
      },
    },
  },
  modules: [
    '@nuxt/eslint',
    '@nuxt/image',
    '@nuxt/fonts',
    '@sidebase/nuxt-auth',
  ],
  components: {
    dirs: [
      {
        path: '~/components/global',
        prefix: '',
        pathPrefix: false,
      },
      '~/components',
    ],
  },
  css: ['@/assets/styles/global.scss'],
})
