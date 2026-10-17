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

// Conditions on the Columns block's number of columns

Statamic.booting(() => {
    // Two or more, e.g. columns: 'custom hasMultipleColumns:true'
    Statamic.$conditions.add('hasMultipleColumns', ({ values }) => {
        if (!values.show_section_settings) return false;
        return values.columns && values.columns.length > 1;
    });

    // Exactly n, e.g. columns: 'custom columnCount:2'
    Statamic.$conditions.add('columnCount', ({ values, params }) => {
        if (!values.show_section_settings) return false;
        if (!values.columns || !Array.isArray(values.columns)) return false;

        const columnCount = values.columns.length;
        const targetCount = parseInt(params[0], 10);

        return columnCount === targetCount;
    });
});

