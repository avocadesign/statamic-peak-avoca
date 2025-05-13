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
    
    // Check for multiple columns (2 or more)
    // e.g. columns: 'custom hasMultipleColumns:true'
    Statamic.$conditions.add('hasMultipleColumns', ({ values }) => {
        if (!values.show_section_settings) return false;
        return values.columns && values.columns.length > 1;
    });

    // Columns columnCount condition
    // e.g. columns: 'custom columnCount:2'
    Statamic.$conditions.add('columnCount', ({ values, params }) => {
        // Check if section settings is enabled
        if (!values.show_section_settings) return false;
        
        // Check if columns exist
        if (!values.columns || !Array.isArray(values.columns)) return false;
        
        // Get the current column count
        const columnCount = values.columns.length;
        
        // Get the expected count
        const targetCount = parseInt(params[0], 10);
        
        // Check for exact match
        return columnCount === targetCount;
    });
});

