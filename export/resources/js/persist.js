import Alpine from 'alpinejs'
import persist from '@alpinejs/persist'

// Alpine's persist, for Peak's local toolbar and Peak SEO's consent banner, where the layout loads it. Registered
// now, not on alpine:init: the banner's alpine:init listener calls Alpine.$persist and runs first. Alpine's core is
// a shared chunk, so this is the Alpine site.js starts.
Alpine.plugin(persist)
