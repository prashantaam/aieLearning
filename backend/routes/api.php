<?php

use Illuminate\Support\Facades\Route;

use App\Http\Controllers\Teacher\AiController;
use App\Http\Controllers\Teacher\AuthController;
use App\Http\Controllers\Teacher\CourseController;
use App\Http\Controllers\Teacher\LessonController;
use App\Http\Controllers\Teacher\LessonContentController;
use App\Http\Controllers\Teacher\FlashcardController;
use App\Http\Controllers\Teacher\QuizController;

/*
|--------------------------------------------------------------------------
| Teacher API Routes
|--------------------------------------------------------------------------
*/

Route::prefix('teacher')->group(function () {

    /*
    |--------------------------------------------------------------------------
    | Public Teacher Authentication
    |--------------------------------------------------------------------------
    */

    Route::post(
        '/register',
        [AuthController::class, 'register']
    );

    Route::post(
        '/login',
        [AuthController::class, 'login']
    );

    /*
    |--------------------------------------------------------------------------
    | Authenticated Teacher Routes
    |--------------------------------------------------------------------------
    */

    Route::middleware('auth:sanctum')->group(function () {

        /*
        |--------------------------------------------------------------------------
        | Teacher Authentication
        |--------------------------------------------------------------------------
        */

        Route::get(
            '/me',
            [AuthController::class, 'me']
        );

        Route::post(
            '/logout',
            [AuthController::class, 'logout']
        );

        /*
        |--------------------------------------------------------------------------
        | Course Management
        |--------------------------------------------------------------------------
        */

        Route::apiResource(
            'courses',
            CourseController::class
        );

        /*
        |--------------------------------------------------------------------------
        | Publish / Unpublish Course
        |--------------------------------------------------------------------------
        */

        Route::patch(
            '/courses/{course}/publish',
            [CourseController::class, 'publish']
        );

        Route::patch(
            '/courses/{course}/unpublish',
            [CourseController::class, 'unpublish']
        );

        /*
        |--------------------------------------------------------------------------
        | Lesson Management
        |--------------------------------------------------------------------------
        */

        Route::post(
            '/courses/{course}/lessons',
            [LessonController::class, 'store']
        );

        Route::get(
            '/lessons/{lesson}',
            [LessonController::class, 'show']
        );

        Route::put(
            '/lessons/{lesson}',
            [LessonController::class, 'update']
        );

        Route::delete(
            '/lessons/{lesson}',
            [LessonController::class, 'destroy']
        );

        /*
        |--------------------------------------------------------------------------
        | Lesson Content Management
        |--------------------------------------------------------------------------
        */

        Route::post(
            '/lessons/{lesson}/contents',
            [LessonContentController::class, 'store']
        );

        Route::put(
            '/lesson-contents/{lessonContent}',
            [LessonContentController::class, 'update']
        );

        Route::delete(
            '/lesson-contents/{lessonContent}',
            [LessonContentController::class, 'destroy']
        );

        /*
        |--------------------------------------------------------------------------
        | AI Course Authoring
        |--------------------------------------------------------------------------
        */

        Route::post(
            '/ai/generate-course-lessons',
            [AiController::class, 'generateCourseLessons']
        );

        Route::post(
            '/ai/generate-learning-content',
            [AiController::class, 'generateLearningContent']
        );

        Route::post(
            '/ai/generate-quiz',
            [AiController::class, 'generateQuiz']
        );

        Route::post(
            '/ai/generate-flashcards',
            [AiController::class, 'generateFlashcards']
        );
    });
});