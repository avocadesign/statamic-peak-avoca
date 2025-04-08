/**
 * When extending the control panel, be sure to uncomment the necessary code for your build process:
 * https://statamic.dev/extending/control-panel
 */

/** Example Fieldtype

import ExampleFieldtype from './components/fieldtypes/ExampleFieldtype.vue';

Statamic.booting(() => {
    Statamic.$components.register('example-fieldtype', ExampleFieldtype);
});

*/

// Check for specific number of columns

Statamic.booting(() => {
    // Check for specific number of columns (for single column layouts)
    Statamic.$conditions.add('columnCount', ({ values, params }) => {
        const count = parseInt(params[0]);
        return values.columns && values.columns.length === count;
    });

    // Check for multiple columns (2 or more)
    Statamic.$conditions.add('hasMultipleColumns', ({ values }) => {
        return values.columns && values.columns.length > 1;
    });
});

