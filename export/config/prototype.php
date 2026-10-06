<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Prototype
    |--------------------------------------------------------------------------
    |
    | The discovery prototype in /prototype stays in git either way. Enabled,
    | it is served at /prototype; disabled, as on the live site, that is a
    | 404. With a password set it asks for it first, so always set one on a
    | public server.
    |
    */

    'enabled' => (bool) env('PROTOTYPE_ENABLED', false),

    'password' => env('PROTOTYPE_PASSWORD'),

];
