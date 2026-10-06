<?php

use App\Http\Controllers\PrototypeController;
use App\Http\Middleware\PrototypePassword;
use Illuminate\Support\Facades\Route;

// Route::statamic('example', 'example-view', [
//    'title' => 'Example'
// ]);

Route::statamic('llms.txt', 'llms', [
    'layout' => null,
    'content_type' => 'text/plain',
]);

// Discovery prototype: a 404 unless PROTOTYPE_ENABLED, then behind PROTOTYPE_PASSWORD when set.
Route::get('prototype', PrototypeController::class)->middleware(PrototypePassword::class);
