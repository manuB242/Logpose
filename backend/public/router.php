<?php

declare(strict_types=1);

$path = parse_url($_SERVER['REQUEST_URI'] ?? '/', PHP_URL_PATH) ?: '/';
$assetsRoot = realpath(__DIR__ . '/assets');
$requested = realpath(__DIR__ . $path);

// Le serveur intégré PHP laisse les assets publics être servis directement.
if (
    str_starts_with($path, '/assets/')
    && $assetsRoot !== false
    && $requested !== false
    && str_starts_with($requested, $assetsRoot . DIRECTORY_SEPARATOR)
    && is_file($requested)
) {
    return false;
}

require __DIR__ . '/index.php';
