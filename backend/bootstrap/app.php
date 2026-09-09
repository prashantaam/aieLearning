<?php

use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        api: __DIR__.'/../routes/api.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware) {
        // The React SPA authenticates with a Bearer token (Sanctum personal
        // access token), the same way it previously sent a JWT — no cookies
        // or CSRF needed, so we do NOT enable statefulApi().
        $middleware->api(prepend: [
            \App\Http\Middleware\ForceJsonResponse::class,
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions) {
        $exceptions->shouldRenderJsonWhen(function () {
            return true;
        });

        // Match the original Express error handler's JSON shape:
        // { success: false, error: <message>, statusCode: <code> }
        $exceptions->render(function (\Throwable $e, $request) {
            return \App\Http\Middleware\ApiExceptionRenderer::render($e, $request);
        });
    })->create();
