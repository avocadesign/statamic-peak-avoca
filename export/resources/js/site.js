import Alpine from 'alpinejs'
import collapse from '@alpinejs/collapse'
import focus from '@alpinejs/focus'
import morph from '@alpinejs/morph'
import persist from '@alpinejs/persist'

// Call Alpine. Precognition, for the forms, is loaded by resources/js/forms.js on pages with a form.
window.Alpine = Alpine
Alpine.plugin([collapse, focus, morph, persist])
Alpine.start()
