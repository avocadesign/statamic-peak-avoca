import precognition from 'laravel-precognition-alpine'

// Precognition ($form) for the Form block, which pushes this into the layout's head ahead of site.js: module scripts
// run in order, so the plugin registers before Alpine starts. As its own entry it downloads alongside site.js.
document.addEventListener('alpine:init', () => {
    window.Alpine.plugin(precognition)
})
