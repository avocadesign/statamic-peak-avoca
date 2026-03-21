<?php

namespace App\Console\Commands;

use Studio1902\PeakCommands\Commands\ClearSite as BaseClearSite;

use function Laravel\Prompts\confirm;
use function Laravel\Prompts\info;

class ClearSite extends BaseClearSite
{
    public function handle(): void
    {
        $shouldClear = confirm(
            label: 'Do you want to clear all default Peak content?',
            default: false
        );

        if (! $shouldClear) {
            return;
        }

        $this->trashAssets();
        $this->clearHomePage();
        $this->trashPagesButHomeAnd404();
        $this->clearNavigation();

        info('[✓] Your view from the peak is clear.');

        $this->clearGlideCache();
        $this->clearCache();
    }
}
