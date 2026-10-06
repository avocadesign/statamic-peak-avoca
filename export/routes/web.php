<?php

use App\Http\Controllers\PrototypeController;
use App\Http\Middleware\PrototypeEnabled;
use Illuminate\Support\Facades\Route;

// Route::statamic('example', 'example-view', [
//    'title' => 'Example'
// ]);

Route::statamic('llms.txt', 'llms', [
    'layout' => null,
    'content_type' => 'text/plain',
]);

// Discovery prototype: a 404 unless PROTOTYPE_ENABLED, then behind a sign-in page when PROTOTYPE_PASSWORD is set.
// /prototype opens the default version, /prototype/2 that version.
Route::middleware(PrototypeEnabled::class)->group(function () {
    Route::get('prototype', [PrototypeController::class, 'show']);
    Route::post('prototype', [PrototypeController::class, 'signIn'])->middleware('throttle:10,1');
    Route::get('prototype/sign-out', [PrototypeController::class, 'signOut']);
    Route::get('prototype/{version}', [PrototypeController::class, 'show'])->where('version', '[A-Za-z0-9-]+');
});
