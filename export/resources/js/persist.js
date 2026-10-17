import Alpine from 'alpinejs'
import persist from '@alpinejs/persist'

// Alpine's persist plugin, for Peak's local toolbar and Peak SEO's consent banner: the layout adds this ahead of
// site.js only where one of them renders. Registered as the module runs, not on alpine:init, because the banner's
// own alpine:init listener calls Alpine.$persist and runs first. Alpine's core is a shared chunk, so this is the
// same Alpine site.js starts.
Alpine.plugin(persist)
