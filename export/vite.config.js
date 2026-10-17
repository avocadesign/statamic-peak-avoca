import laravel from 'laravel-vite-plugin'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig, loadEnv } from 'vite'

export default defineConfig(({ command, mode }) => {
    const env = loadEnv(mode, process.cwd(), 'VITE_')
    return {
        build: {
            buildDirectory: '_build',
            rollupOptions: {
                output: {
                    // Alpine's core in a chunk of its own, which every page loads and caches. Any other package goes
                    // with the entry that imports it, so a plugin only some pages need isn't in a chunk every page loads.
                    manualChunks: (id) => {
                        if (id.includes('/node_modules/alpinejs/')) return 'alpinejs';
                    }
                }
            }
        },
        plugins: [
            tailwindcss(),
            laravel({
                refresh: true,
                buildDirectory: '_build',
                input: [
                    'resources/css/site.css',
                    'resources/css/critical.css',
                    'resources/css/critical-forms.css',
                    'resources/js/site.js',
                    'resources/js/forms.js',
                    'resources/js/persist.js',
                    'resources/js/cp.js',
                ]
            })
        ],
        server: {
            watch: {
                ignored: [
                    '**/storage/framework/views/**',
                    '**/storage/statamic/**',
                ],
            },
            open: env.VITE_SITE_URL
        }
    }
});
