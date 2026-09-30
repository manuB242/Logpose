<?php

declare(strict_types=1);

/**
 * Configuration sans framework. Les variables peuvent être fournies par le
 * serveur ou chargées par son mécanisme de gestion d'environnement.
 */
function config_env(string $key, ?string $default = null): ?string
{
    $value = getenv($key);

    return $value === false || $value === '' ? $default : $value;
}

return [
    'environment' => config_env('APP_ENV', 'development'),
    'debug' => filter_var(config_env('APP_DEBUG', 'false'), FILTER_VALIDATE_BOOL),
    'database' => [
        'host' => config_env('DB_HOST', '127.0.0.1'),
        'port' => (int) config_env('DB_PORT', '3306'),
        'name' => config_env('DB_DATABASE', 'logpose'),
        'username' => config_env('DB_USERNAME', 'logpose'),
        'password' => config_env('DB_PASSWORD', ''),
    ],
];
