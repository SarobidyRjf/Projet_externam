import tailwindcss from "@tailwindcss/vite";

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: "2025-05-15",
  devtools: { enabled: true },
  css: ["~/assets/css/tailwind.css"],
  modules: [
    "@nuxt/eslint",
    "@nuxt/fonts",
    "@nuxt/icon",
    "@nuxt/image",
    "shadcn-nuxt",
    "@pinia/nuxt",
  ],
  vite: {
    plugins: [tailwindcss()],
  },
  ssr: true,
  nitro: {
    preset: "vercel",
    experimental: {
      websocket: true
    },
    maxBodySize: 4 * 1024 * 1024 * 1024,
    routeRules: {
      '/api/academy/**': { maxBodySize: 4 * 1024 * 1024 * 1024 },
    },
  },

  shadcn: {
    /**
     * Prefix for all the imported component
     */
    prefix: "",
    /**
     * Directory that the component lives in.
     * @default "./components/ui"
     */
    componentDir: "./components/ui",
  },
  runtimeConfig: {
    apiKey: '',
    mongoUri: process.env.MONGO_URI || 'mongodb://admin:123456789@185.98.136.90:27017/externam?authSource=admin',
    jwtSecret: process.env.JWT_SECRET || 'lechatsur-secret',
    public: {
      meta_URL_API: process.env.META_API_URL || "https://graph.facebook.com",
      accessToken_META: process.env.ACCESS_TOKEN,
      
    }
  },
});