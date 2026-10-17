<?php

return [

    'picture' => [
        'default_widths' => [320, 480, 640, 768, 1024, 1280, 1440, 1536, 1680],
        // Avoca: WebP only. Every browser the build targets reads WebP, so a JPEG <source> is a second srcset in
        // every picture that nothing chooses. The <img> fallback is WebP already.
        'default_formats' => [
            'webp' => 'image/webp',
        ],
    ],

];
