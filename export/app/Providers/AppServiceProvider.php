<?php

namespace App\Providers;

use App\Policies\CustomUserPolicy;
use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\ServiceProvider;
use Statamic\Policies\UserPolicy;
use Studio1902\PeakSeo\Handlers\ErrorPage;
use Statamic\Statamic;

class AppServiceProvider extends ServiceProvider
{
    /**
     * The path to your application's "home" route.
     *
     * Typically, users are redirected here after authentication.
     *
     * @var string
     */
    public const HOME = '/home';

    /**
     * Register any application services.
     */
    public function register(): void
    {
        $this->app->bind(UserPolicy::class, CustomUserPolicy::class);
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        Statamic::vite('app', [ 
            'hotFile' => __DIR__.'/../../public/hot-cp',
            'buildDirectory' => 'build-cp',
            'input' => [
                'resources/js/cp.js',
            ],
            //'resources/css/cp.css'
        ]); 
        // Statamic::style('app', 'cp');

        ErrorPage::handle404AsEntry();

        $this->bootRoute();
    }

    public function bootRoute(): void
    {
        RateLimiter::for('api', function (Request $request) {
            return Limit::perMinute(60)->by($request->user()?->id ?: $request->ip());
        });
    }
}
