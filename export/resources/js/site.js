import Alpine from 'alpinejs'
import collapse from '@alpinejs/collapse'
import focus from '@alpinejs/focus'

// Call Alpine. Focus is here for the mobile navigation's x-trap; Precognition loads with forms.js, persist with persist.js.
window.Alpine = Alpine
Alpine.plugin([collapse, focus])
Alpine.start()
