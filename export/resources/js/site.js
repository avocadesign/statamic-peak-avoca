import Alpine from 'alpinejs'
import collapse from '@alpinejs/collapse'
import focus from '@alpinejs/focus'

// Call Alpine. Focus is here for the mobile navigation's x-trap, on every page. Precognition, for the forms, loads
// with resources/js/forms.js on pages with a form, and persist with resources/js/persist.js where something uses it.
window.Alpine = Alpine
Alpine.plugin([collapse, focus])
Alpine.start()
