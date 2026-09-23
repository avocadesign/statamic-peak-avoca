import precognition from 'laravel-precognition-alpine'

// Precognition gives the form handler its $form. Only a page with a form needs it, so the Form block loads this
// file, into the layout's head ahead of site.js: module scripts run in the order they appear, so this listener is
// in place before site.js starts Alpine, and the plugin is registered before any form initialises. Loaded as its
// own entry rather than imported from site.js, it downloads alongside site.js instead of after it, so Alpine
// starts as early as it does on any other page and the form doesn't appear late.
document.addEventListener('alpine:init', () => {
    window.Alpine.plugin(precognition)
})
