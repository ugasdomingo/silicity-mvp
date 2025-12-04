import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path';

// https://vite.dev/config/
export default defineConfig({
    plugins: [vue()],
    resolve: {
        alias: {
            '@': path.resolve(__dirname, './src'),
        },
    },
    css: {
        preprocessorOptions: {
            scss: {
                additionalData: `
                @use "@/assets/scss/abstracts/_variables.scss" as *;
                @use "@/assets/scss/abstracts/_mixins.scss" as *;
                `,
            },
        },
    },
})
