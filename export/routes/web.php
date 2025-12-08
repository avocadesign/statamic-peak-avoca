<?php

use Illuminate\Support\Facades\Route;

// Route::statamic('example', 'example-view', [
//    'title' => 'Example'
// ]);

Route::statamic('llms.txt', 'llms', [
    'layout' => null,
    'content_type' => 'text/plain',
]);

Route::statamic('robots.txt', 'robots', [
    'layout' => null,
    'content_type' => 'text/plain',
]);
