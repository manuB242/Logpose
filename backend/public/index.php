<?php

declare(strict_types=1);

use LogPose\ApiException;
use LogPose\Database;
use LogPose\Request;
use LogPose\Response;
use LogPose\Api;

spl_autoload_register(static function (string $class): void {
    $prefix = 'LogPose\\';
    if (!str_starts_with($class, $prefix)) {
        return;
    }

    $file = dirname(__DIR__) . '/src/' . substr($class, strlen($prefix)) . '.php';
    if (is_file($file)) {
        require $file;
    }
});

LogPose\Env::load(dirname(__DIR__) . '/.env');
$config = require dirname(__DIR__) . '/config/app.php';

try {
    $request = Request::fromGlobals();

    // Le même point d’entrée sert le web PHP et l’API JSON.
    // Le document HTML peut donc être affiché même lorsqu’une base locale n’est
    // pas encore configurée ; les appels dynamiques signaleront alors l’erreur.
    if (!str_starts_with($request->path, '/api')) {
        if ($request->method !== 'GET') {
            throw new ApiException('Méthode non autorisée.', 405);
        }
        require dirname(__DIR__) . '/views/home.php';
        exit;
    }

    if ($request->method === 'OPTIONS') {
        Response::json([], 204);
    }

    $database = new Database($config['database']);
    $api = new Api($database->pdo());
    $api->dispatch($request);
} catch (ApiException $exception) {
    Response::json(['error' => $exception->getMessage()], $exception->status());
} catch (Throwable $exception) {
    error_log((string) $exception);
    $message = $config['debug'] ? $exception->getMessage() : 'Une erreur interne est survenue.';
    Response::json(['error' => $message], 500);
}
