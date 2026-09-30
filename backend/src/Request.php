<?php

declare(strict_types=1);

namespace LogPose;

final class Request
{
    /** @param array<string, mixed> $query @param array<string, mixed> $body */
    private function __construct(
        public readonly string $method,
        public readonly string $path,
        public readonly array $query,
        public readonly array $body,
    ) {
    }

    public static function fromGlobals(): self
    {
        $method = strtoupper($_SERVER['REQUEST_METHOD'] ?? 'GET');
        $path = parse_url($_SERVER['REQUEST_URI'] ?? '/', PHP_URL_PATH) ?: '/';
        $body = [];

        if (in_array($method, ['POST', 'PUT', 'PATCH'], true)) {
            $raw = file_get_contents('php://input');
            if ($raw !== false && $raw !== '') {
                try {
                    $decoded = json_decode($raw, true, 512, JSON_THROW_ON_ERROR);
                } catch (\JsonException) {
                    throw new ApiException('JSON invalide.', 400);
                }

                if (!is_array($decoded)) {
                    throw new ApiException('Le corps JSON doit être un objet.', 400);
                }
                $body = $decoded;
            }
        }

        return new self($method, $path, $_GET, $body);
    }

    /** @return list<string> */
    public function list(string $key): array
    {
        $value = $this->query[$key] ?? '';
        if (!is_string($value) || trim($value) === '') {
            return [];
        }

        return array_values(array_filter(array_map('trim', explode(',', $value))));
    }

    public function integer(string $key, int $default, int $min, int $max): int
    {
        $value = filter_var($this->query[$key] ?? null, FILTER_VALIDATE_INT);
        if ($value === false || $value === null) {
            return $default;
        }

        return max($min, min($max, $value));
    }

    public function bodyString(string $key): string
    {
        $value = $this->body[$key] ?? null;
        if (!is_string($value) || trim($value) === '') {
            throw new ApiException(sprintf('Le champ « %s » est requis.', $key), 422);
        }

        return trim($value);
    }
}
