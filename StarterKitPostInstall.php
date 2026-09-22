<?php

use App\Console\Commands\PostInstall\CollectAvailableLangLocales;
use Facades\Statamic\Console\Processes\Composer;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Storage;
use Laravel\Prompts\Prompt;
use Statamic\Support\Str;
use Symfony\Component\Process\Exception\ProcessFailedException;
use Symfony\Component\Process\Process;
use Symfony\Component\Yaml\Yaml;

use function Laravel\Prompts\confirm;
use function Laravel\Prompts\error;
use function Laravel\Prompts\info;
use function Laravel\Prompts\search;
use function Laravel\Prompts\select;
use function Laravel\Prompts\spin;
use function Laravel\Prompts\suggest;
use function Laravel\Prompts\text;
use function Laravel\Prompts\warning;

class StarterKitPostInstall
{
    public $registerCommands = [
        CollectAvailableLangLocales::class,
    ];

    protected string $app = '';

    protected string $system = '';

    protected string $contact = '';

    protected string $env = '';

    protected string $readme = '';

    protected string $sites = '';

    protected Collection $availableLanguages;

    protected bool $interactive = true;

    public function handle($console): void
    {
        $this->applyInteractivity($console);
        $this->loadFiles();
        $this->overwriteEnvWithPresets();
        $this->excludeBuildFolderFromGit();
        $this->excludeUsersFolderFromGit();
        $this->excludeFormsFolderFromGit();
        $this->installNodeDependencies();
        $this->installTranslations();
        $this->runPeakClearSite();
        $this->publishServerScript();
        $this->writeFiles();
        $this->cleanUp();
        $this->finish();
    }

    protected function applyInteractivity($console): void
    {
        $this->interactive = ! $console->option('no-interaction');

        /**
         * Interactivity should be inherited but seems like there is a bug in Prompts where it stays
         * without interaction when a command was run before with `--no-interaction` flag.
         */
        Prompt::interactive($this->interactive);
    }

    protected function loadFiles(): void
    {
        $this->env = app('files')->get(base_path('.env.example'));
        $this->readme = app('files')->get(base_path('README.md'));
        $this->app = app('files')->get(base_path('config/app.php'));
        $this->system = app('files')->get(base_path('config/statamic/system.php'));
        $this->contact = app('files')->get(base_path('resources/forms/contact.yaml'));
        $this->sites = app('files')->get(base_path('resources/sites.yaml'));
    }

    protected function overwriteEnvWithPresets(): void
    {
        $this->setAppName();
        $this->setAppUrl();
        $this->setAppKey();
        $this->setLicenseKey();
        $this->setLocale();
        $this->setMailFromAddress();
        $this->useDebugbar();
        $this->useImagick();
        $this->setLocalMailer();
        $this->writeEnv();

        info('[✓] `.env` file overwritten.');
    }

    protected function installNodeDependencies(): void
    {
        $this->run(
            command: 'npm i',
            processingMessage: 'Installing npm dependencies...',
            successMessage: 'npm dependencies installed.',
        );

        $this->installPuppeteerAndBrowsershot();
    }

    protected function installPuppeteerAndBrowsershot(): void
    {
        $this->installPuppeteer();
        $this->installBrowsershot();
    }

    protected function installTranslations(): void
    {
        // English only, unless a site needs more: AVOCA_TRANSLATIONS=1 brings back Peak's language picker.
        if (getenv('AVOCA_TRANSLATIONS') !== '1') {
            return;
        }

        if (! $this->installLaravelLang()) {
            error('Could not install Laravel Lang.');

            return;
        }

        if (! $this->collectAvailableLanguages()) {
            error('Could not collect available languages.');

            return;
        }

        $this->selectLanguagesToInstall();
    }

    protected function setLocale(): void
    {
        $this->replaceInSites('locale: en_US', 'locale: '.(getenv('AVOCA_LOCALE') ?: 'en_NZ'));
    }

    protected function setMailFromAddress(): void
    {
        // Mail leaves an Avoca site as Avoca, whatever address enquiries are sent to: the preset in
        // .env.example already says so, and AVOCA_MAIL_FROM changes it for a site that needs its own.
        if (! $email = getenv('AVOCA_MAIL_FROM')) {
            return;
        }

        $this->replaceInEnv('MAIL_FROM_ADDRESS="hosting@avoca.design"', "MAIL_FROM_ADDRESS=\"{$email}\"");
        $this->replaceInReadme('MAIL_FROM_ADDRESS=', "MAIL_FROM_ADDRESS=\"{$email}\"");
    }

    /**
     * The script the server runs to commit content edited in the control panel. It starts in the site, at
     * scripts/server-git.sh, rather than staying in the package: how a server handles a site's content is the site's
     * business, and a site that needs something different edits its own copy. Avoca Tools holds the one it starts from.
     */
    protected function publishServerScript(): void
    {
        $this->run(
            command: 'php artisan avoca:site:script',
            processingMessage: 'Adding the server git script...',
            successMessage: 'Server git script added at `scripts/server-git.sh`.',
        );
    }

    protected function runPeakClearSite(): void
    {
        if (! $this->interactive || ! Process::isTtySupported() || ! Composer::isInstalled('studio1902/statamic-peak-commands')) {
            return;
        }

        $this->run(
            command: 'php artisan statamic:peak:clear-site',
            tty: true,
            spinner: false,
        );
    }

    protected function writeEnv(): void
    {
        app('files')->put(base_path('.env'), $this->env);
    }

    protected function writeFiles(): void
    {
        $changelog = app('files')->get(__DIR__.'/CHANGELOG.md');

        app('files')->put(base_path('CHANGELOG.md'), $changelog);
        app('files')->put(base_path('README.md'), $this->readme);
        app('files')->put(base_path('config/app.php'), $this->app);
        app('files')->put(base_path('config/statamic/system.php'), $this->system);
        app('files')->put(base_path('resources/forms/contact.yaml'), $this->contact);
        app('files')->put(base_path('resources/sites.yaml'), $this->sites);
    }

    protected function cleanUp(): void
    {
        // Avoca: a fresh statamic/statamic project ships public/robots.txt, which shadows the
        // robots.txt route Peak SEO serves from the SEO global. Upstream Peak has the same gap.
        if (file_exists(base_path('public/robots.txt'))) {
            unlink(base_path('public/robots.txt'));
        }

        app('files')->exists(base_path('tailwind.config.js')) && app('files')->delete(base_path('tailwind.config.js'));
        app('files')->exists(base_path('postcss.config.js')) && app('files')->delete(base_path('postcss.config.js'));

        $this->withSpinner(
            fn () => $this->removePostInstallCommands(),
            'Removing post install commands...',
            'Post install commands removed.'
        );
    }

    protected function finish(): void
    {
        // Peak asks every installer whether they stand against fascism. Avoca's answer does not change,
        // so the kit says it rather than asking: https://1902.studio/en/journal/stop-fascism
        info('Avoca stands with Peak against fascism.');
        info('[✓] Peak is installed. Enjoy the view!');

        if (! Composer::isInstalled('studio1902/statamic-peak-commands')) {
            info('Consider buying the Peak Commands addon containing a set of CLI commands to make tedious and recurring tasks a lot easier.');
            warning('Read more here: https://peak.1902.studio/getting-started/commands.html#add-collection');

            return;
        }

        info("Thank you for install the Peak Commands addon.\n* Run `php please peak:install:preset` to install premade sets onto your website.\n* Run `php please peak:install:block` to install premade blocks onto your page builder.\n* Learn about more commands here: https://peak.1902.studio/getting-started/commands.html");
        warning("You need a valid license to use these commands.\nBuy one here: https://statamic.com/addons/studio1902/peak-commands");
    }

    protected function setAppName(): void
    {
        $appName = $this->siteName();
        if ($this->interactive) {
            $appName = text(label: 'What is the site called?', default: $appName, required: true);
        }

        $appName = preg_replace('/([\'|\"#])/m', '', $appName);

        // Both, because the kit's own preset renamed it and Peak's search string no longer matched.
        $this->replaceInEnv('APP_NAME="Statamic Peak - Avoca"', "APP_NAME=\"{$appName}\"");
        $this->replaceInEnv('APP_NAME="Statamic Peak"', "APP_NAME=\"{$appName}\"");
        $this->replaceInReadme('APP_NAME="Statamic Peak"', "APP_NAME=\"{$appName}\"");
        $this->replaceInReadme('site.ext', $appName);
    }

    protected function setAppUrl(): void
    {
        $appUrl = (string) (getenv('AVOCA_APP_URL') ?: env('APP_URL'));

        // Herd serves ~/Herd/<folder> at <folder>.test, and the installer hands over a URL with a port on it.
        if ($appUrl === '' || str_contains($appUrl, 'localhost') || preg_match('/:\d+$/', $appUrl)) {
            $appUrl = 'http://'.basename(base_path()).'.test';
        }

        $this->replaceInEnv('APP_URL=', "APP_URL=\"{$appUrl}\"");
    }

    /**
     * The site's name, from its own folder: stressless-massage becomes Stressless Massage. AVOCA_APP_NAME wins,
     * for a script that knows better, and a folder that is where sites live rather than the name of one is ignored.
     */
    protected function siteName(): string
    {
        if ($fromEnv = getenv('AVOCA_APP_NAME')) {
            return $fromEnv;
        }

        $folder = basename(base_path());
        $whereSitesLive = ['herd', 'sites', 'www', 'html', 'public_html', 'code', 'projects', 'dev', 'web', 'valet'];

        return in_array(strtolower($folder), $whereSitesLive, true)
            ? 'Statamic Peak - Avoca'
            : Str::of($folder)->replace(['-', '_'], ' ')->title()->toString();
    }

    protected function setAppKey(): void
    {
        $appKey = env('APP_KEY');

        $this->replaceInEnv('APP_KEY=', "APP_KEY=\"{$appKey}\"");
    }

    protected function setLicenseKey(): void
    {
        $statamicLicenseKey = env('STATAMIC_LICENSE_KEY');

        $this->replaceInEnv('STATAMIC_LICENSE_KEY=', "STATAMIC_LICENSE_KEY=\"{$statamicLicenseKey}\"");
    }

    protected function useDebugbar(): void
    {
        $this->replaceInEnv('DEBUGBAR_ENABLED=true', 'DEBUGBAR_ENABLED=false');
    }

    protected function useImagick(): void
    {
        $this->replaceInEnv('#IMAGE_MANIPULATION_DRIVER=imagick', 'IMAGE_MANIPULATION_DRIVER=imagick');
        $this->replaceInReadme('#IMAGE_MANIPULATION_DRIVER=imagick', 'IMAGE_MANIPULATION_DRIVER=imagick');
    }

    protected function setLocalMailer(): void
    {
        // Avoca develops on Herd. AVOCA_LOCAL_MAILER takes helo, herd, log, mailpit or mailtrap.
        $localMailer = getenv('AVOCA_LOCAL_MAILER') ?: 'herd';

        if ($localMailer === 'mailpit') {
            return;
        }

        if ($localMailer === 'helo' || $localMailer === 'herd') {
            $this->replaceInEnv('MAIL_HOST=localhost', 'MAIL_HOST=127.0.0.1');
            $this->replaceInEnv('MAIL_PORT=1025', 'MAIL_PORT=2525');
            $this->replaceInEnv('MAIL_USERNAME=null', 'MAIL_USERNAME="${APP_NAME}"');
        }

        if ($localMailer === 'mailhog') {
            $this->replaceInEnv('MAIL_HOST=localhost', 'MAIL_HOST=127.0.0.1');
            $this->replaceInEnv('MAIL_PORT=1025', 'MAIL_PORT=8025');
        }

        if ($localMailer === 'log') {
            $this->replaceInEnv('MAIL_MAILER=smtp', 'MAIL_MAILER=log');
        }
    }

    protected function excludeBuildFolderFromGit(): void
    {
        $this->appendToGitignore('/public/_build/');
    }

    protected function excludeUsersFolderFromGit(): void
    {
        // Users stay in git: a site's accounts travel with it, and their passwords are stored hashed.
    }

    protected function excludeFormsFolderFromGit(): void
    {
        // Form submissions stay in git too, so a deploy never loses one.
    }

    protected function run(string $command, string $processingMessage = '', string $successMessage = '', ?string $errorMessage = null, bool $tty = false, bool $spinner = true, int $timeout = 120): bool
    {
        $process = new Process(explode(' ', $command));
        $process->setTimeout($timeout);

        if ($tty) {
            $process->setTty(true);
        }

        try {
            $spinner ?
                $this->withSpinner(
                    fn () => $process->mustRun(),
                    $processingMessage,
                    $successMessage
                ) :
                $this->withoutSpinner(
                    fn () => $process->mustRun(),
                    $successMessage
                );

            return true;
        } catch (ProcessFailedException $exception) {
            error($errorMessage ?? $exception->getMessage());

            return false;
        }
    }

    protected function installPuppeteer(): void
    {
        $this->run(
            command: 'npm i puppeteer',
            processingMessage: 'Installing Puppeteer...',
            successMessage: 'Puppeteer installed.',
            timeout: 240,
        );
    }

    protected function installBrowsershot(): void
    {
        $this->run(
            command: 'composer require spatie/browsershot',
            processingMessage: 'Installing Browsershot...',
            successMessage: 'Browsershot installed.',
        );

        $this->run(
            command: 'composer require spatie/image',
            processingMessage: 'Installing Image...',
            successMessage: 'Image installed.',
        );
    }

    protected function installLaravelLang(): bool
    {
        return $this->run(
            command: 'composer require laravel-lang/common --dev',
            processingMessage: 'Installing Laravel Lang...',
            successMessage: 'Laravel Lang installed.',
        );
    }

    protected function collectAvailableLanguages(): bool
    {
        $command = 'php artisan statamic:peak:collect-available-lang-locales';
        $process = new Process(explode(' ', $command));

        try {
            $process->mustRun();
            $this->availableLanguages = collect(json_decode($process->getOutput(), true, 512, JSON_THROW_ON_ERROR));

            return true;
        } catch (Exception) {
            return false;
        }
    }

    protected function selectLanguagesToInstall(): void
    {
        info('Enter the handles of the languages you want to install. Leave empty and press enter when you\'re done.');

        $installedLanguages = collect();

        do {
            if (($handle = $this->selectLanguageToInstall($installedLanguages)) && $this->installLanguage($handle)) {
                $installedLanguages->push($handle);
            }
        } while ($handle);
    }

    protected function replaceInSites(string $search, string $replace): void
    {
        $this->sites = str_replace($search, $replace, $this->sites);
    }

    protected function replaceInContact(string $search, string $replace): void
    {
        $this->contact = str_replace($search, $replace, $this->contact);
    }

    protected function replaceInEnv(string $search, string $replace): void
    {
        $this->env = str_replace($search, $replace, $this->env);
    }

    protected function replaceInSystem(string $search, string $replace): void
    {
        $this->system = str_replace($search, $replace, $this->system);
    }

    protected function replaceInReadme(string $search, string $replace): void
    {
        $this->readme = str_replace($search, $replace, $this->readme);
    }

    protected function appendToGitignore(string $toIgnore): void
    {
        app('files')->append(base_path('.gitignore'), "\n{$toIgnore}");
    }

    protected function withSpinner(callable $callback, string $processingMessage = '', string $successMessage = ''): void
    {
        spin($callback, $processingMessage);

        if ($successMessage) {
            info("[✓] $successMessage");
        }
    }

    protected function removePostInstallCommands(): void
    {
        Storage::build([
            'driver' => 'local',
            'root' => app_path(),
        ])->deleteDirectory('Console/Commands/PostInstall');

        usleep(500000);
    }

    protected function withoutSpinner(callable $callback, string $successMessage = ''): void
    {
        $callback();

        if ($successMessage) {
            info("[✓] $successMessage");
        }
    }

    protected function selectLanguageToInstall(Collection $installedLanguages): string
    {
        return suggest(
            label: 'Handle of language (submit empty when you\'re done)',
            options: fn ($value) => $this->availableLanguages
                ->filter(fn (string $language) => Str::contains($language, $value, true) && ! $installedLanguages->contains($language))
                ->values()
                ->toArray(),
            placeholder: 'en',
            validate: fn (string $value) => match (true) {
                $value && ! $this->availableLanguages->contains($value) => 'Not supported by Laravel Lang.',
                $value && $installedLanguages->contains($value) => "Language \"{$value}\" already installed.",
                default => null,
            },
            hint: $installedLanguages->isNotEmpty() ? 'Installed: '.$installedLanguages->join(', ', ' and ') : '',
        );
    }

    protected function installLanguage(string $handle): bool
    {
        return $this->run(
            command: "php artisan lang:add {$handle}",
            processingMessage: "Installing language \"{$handle}\"...",
            successMessage: "Language \"{$handle}\" installed.",
            errorMessage: "Installation of language \"{$handle}\" failed."
        );
    }
}
