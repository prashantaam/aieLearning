<?php

return [

    'paths' => ['api/*', 'uploads/*', 'sanctum/csrf-cookie'],

    'allowed_methods' => ['*'],

    // '*' mirrors the original Express `cors({ origin: "*" })` config.
    // Tighten this to your real frontend URL(s) in production.
    'allowed_origins' => ['*'],

    'allowed_origins_patterns' => [],

    'allowed_headers' => ['*'],

    'exposed_headers' => [],

    'max_age' => 0,

    'supports_credentials' => false,

];
