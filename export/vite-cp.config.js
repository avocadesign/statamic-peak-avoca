import { defineConfig } from 'vite';
import laravel from 'laravel-vite-plugin';
// import vue2 from '@vitejs/plugin-vue2';

export default defineConfig({
    plugins: [
        laravel({
            hotFile: 'public/hot-cp',
            buildDirectory: 'build-cp',
            input: [
                'resources/js/cp.js',
            ],
        }),
        // vue2(),
    ],
});