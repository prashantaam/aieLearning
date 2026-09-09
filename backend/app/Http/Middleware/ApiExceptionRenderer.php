<?php

namespace App\Http\Middleware;

use Illuminate\Auth\AuthenticationException;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\App;
use Illuminate\Validation\ValidationException;
use Symfony\Component\HttpKernel\Exception\HttpExceptionInterface;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;
use Throwable;

/**
 * Reproduces the response shape of the original Node/Express
 * `errorHandler` middleware:
 *
 *   { success: false, error: <message>, statusCode: <code> }
 */
class ApiExceptionRenderer
{
    public static function render(Throwable $e, $request): JsonResponse
    {
        [$statusCode, $message] = self::resolve($e);

        $payload = [
            'success' => false,
            'error' => $message,
            'statusCode' => $statusCode,
        ];

        if (App::environment('local', 'development') && config('app.debug')) {
            $payload['stack'] = collect($e->getTrace())->take(10)->toArray();
        }

        return response()->json($payload, $statusCode);
    }

    private static function resolve(Throwable $e): array
    {
        if ($e instanceof ValidationException) {
            $message = collect($e->errors())->flatten()->implode(', ');

            return [422, $message ?: 'Validation failed'];
        }

        if ($e instanceof AuthenticationException) {
            return [401, 'Not authorized, no token'];
        }

        if ($e instanceof ModelNotFoundException || $e instanceof NotFoundHttpException) {
            return [404, 'Resource not found'];
        }

        if ($e instanceof HttpExceptionInterface) {
            $status = $e->getStatusCode();
            $message = $e->getMessage() ?: match ($status) {
                404 => 'Route not found',
                405 => 'Method not allowed',
                default => 'Server Error',
            };

            return [$status, $message];
        }

        return [500, $e->getMessage() ?: 'Server Error'];
    }
}
