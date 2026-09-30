<?php

declare(strict_types=1);

namespace LogPose;

use RuntimeException;

final class ApiException extends RuntimeException
{
    public function __construct(string $message, private readonly int $status = 400)
    {
        parent::__construct($message);
    }

    public function status(): int
    {
        return $this->status;
    }
}
