<?php

use App\Http\Controllers\Api\AiController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\ChapterController;
use App\Http\Controllers\Api\DocumentController;
use App\Http\Controllers\Api\FlashcardController;
use App\Http\Controllers\Api\ProgressController;
use App\Http\Controllers\Api\QuizController;
use App\Http\Controllers\Api\SubjectController;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\ContentController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
*/


/*
|--------------------------------------------------------------------------
| Authentication
|--------------------------------------------------------------------------
*/

Route::prefix('auth')->group(function () {

    Route::post(
        '/register',
        [AuthController::class, 'register']
    );

    Route::post(
        '/login',
        [AuthController::class, 'login']
    );

    Route::middleware('auth:sanctum')->group(function () {

        Route::get(
            '/profile',
            [AuthController::class, 'profile']
        );

        Route::put(
            '/profile',
            [AuthController::class, 'updateProfile']
        );

        Route::post(
            '/change-password',
            [AuthController::class, 'changePassword']
        );
    });
});


/*
|--------------------------------------------------------------------------
| Protected API Routes
|--------------------------------------------------------------------------
*/

Route::middleware('auth:sanctum')->group(function () {

    /*
    |--------------------------------------------------------------------------
    | Subjects
    |--------------------------------------------------------------------------
    |
    | GET    /api/subjects
    | POST   /api/subjects
    | GET    /api/subjects/{subject}
    | PUT    /api/subjects/{subject}
    | DELETE /api/subjects/{subject}
    |
    */

    Route::prefix('subjects')->group(function () {

        /*
        | List subjects
        |
        | Teacher:
        | Returns subjects created by the logged-in teacher.
        |
        | Student:
        | Returns published subjects only.
        */

        Route::get(
            '/',
            [SubjectController::class, 'index']
        );


        /*
        | Create subject
        |
        | Teacher only.
        */

        Route::post(
            '/',
            [SubjectController::class, 'store']
        );


        /*
        | Get a specific subject
        */

        Route::get(
            '/{subject}',
            [SubjectController::class, 'show']
        )->whereNumber('subject');


        /*
        | Update subject
        |
        | Teacher owner only.
        */

        Route::put(
            '/{subject}',
            [SubjectController::class, 'update']
        )->whereNumber('subject');


        /*
        | Delete subject
        |
        | Teacher owner only.
        */

        Route::delete(
            '/{subject}',
            [SubjectController::class, 'destroy']
        )->whereNumber('subject');
    });


    /*
    |--------------------------------------------------------------------------
    | Chapters
    |--------------------------------------------------------------------------
    |
    | GET    /api/subjects/{subject}/chapters
    | POST   /api/subjects/{subject}/chapters
    |
    | GET    /api/chapters/{chapter}
    | PUT    /api/chapters/{chapter}
    | DELETE /api/chapters/{chapter}
    |
    | Teacher:
    | - Can see draft + published chapters belonging to their subject.
    | - Can create, update and delete chapters.
    |
    | Student:
    | - Can only see published chapters.
    |
    */

    Route::get(
        '/subjects/{subject}/chapters',
        [ChapterController::class, 'index']
    )->whereNumber('subject');


    /*
    | Create chapter
    |
    | Teacher owner only.
    */

    Route::post(
        '/subjects/{subject}/chapters',
        [ChapterController::class, 'store']
    )->whereNumber('subject');


    /*
    | Get a specific chapter
    */

    Route::get(
        '/chapters/{chapter}',
        [ChapterController::class, 'show']
    )->whereNumber('chapter');


    /*
    | Update chapter
    |
    | Teacher owner only.
    */

    Route::put(
        '/chapters/{chapter}',
        [ChapterController::class, 'update']
    )->whereNumber('chapter');


    /*
    | Delete chapter
    |
    | Teacher owner only.
    */

    Route::delete(
        '/chapters/{chapter}',
        [ChapterController::class, 'destroy']
    )->whereNumber('chapter');


    /*
    |--------------------------------------------------------------------------
    | Documents
    |--------------------------------------------------------------------------
    |
    | Existing document functionality is being kept temporarily while
    | the application is migrated to Subject -> Chapter -> Content.
    |
    */

    Route::prefix('documents')->group(function () {

        Route::post(
            '/upload',
            [DocumentController::class, 'upload']
        );

        Route::get(
            '/',
            [DocumentController::class, 'index']
        );

        Route::get(
            '/{id}',
            [DocumentController::class, 'show']
        )->whereNumber('id');

        Route::delete(
            '/{id}',
            [DocumentController::class, 'destroy']
        )->whereNumber('id');
    });


    /*
    |--------------------------------------------------------------------------
    | Flashcards
    |--------------------------------------------------------------------------
    |
    | Currently document-based.
    | Later this will be migrated to chapter-level flashcards.
    |
    */

    Route::prefix('flashcards')->group(function () {

        Route::get(
            '/',
            [FlashcardController::class, 'indexAll']
        );

        Route::get(
            '/{documentId}',
            [FlashcardController::class, 'indexForDocument']
        )->whereNumber('documentId');

        Route::post(
            '/{cardId}/review',
            [FlashcardController::class, 'review']
        )->whereNumber('cardId');

        Route::put(
            '/{cardId}/star',
            [FlashcardController::class, 'toggleStar']
        )->whereNumber('cardId');

        Route::delete(
            '/{id}',
            [FlashcardController::class, 'destroy']
        )->whereNumber('id');
    });


    /*
    |--------------------------------------------------------------------------
    | AI
    |--------------------------------------------------------------------------
    |
    | Currently document-based.
    |
    | Later these features will operate at Chapter level:
    |
    | Chapter
    |   ├── AI Summary
    |   ├── Flashcards
    |   ├── Quiz
    |   └── AI Chat
    |
    */

    Route::prefix('ai')->group(function () {

        Route::post(
            '/generate-flashcards',
            [AiController::class, 'generateFlashcards']
        );

        Route::post(
            '/generate-quiz',
            [AiController::class, 'generateQuiz']
        );

        Route::post(
            '/generate-summary',
            [AiController::class, 'generateSummary']
        );

        Route::post(
            '/chat',
            [AiController::class, 'chat']
        );

        Route::post(
            '/explain-concept',
            [AiController::class, 'explainConcept']
        );

        Route::get(
            '/chat-history/{documentId}',
            [AiController::class, 'chatHistory']
        )->whereNumber('documentId');
    });


    /*
    |--------------------------------------------------------------------------
    | Quizzes
    |--------------------------------------------------------------------------
    |
    | Current quiz structure:
    |
    | GET    /api/quizzes/{documentId}
    | GET    /api/quizzes/quiz/{id}
    | POST   /api/quizzes/{id}/submit
    | GET    /api/quizzes/{id}/results
    | GET    /api/quizzes/{id}/attempts
    | GET    /api/quizzes/{id}/attempts/{attemptId}
    | DELETE /api/quizzes/{id}
    |
    | Existing functionality is being preserved while we migrate quizzes
    | from document-level to chapter-level.
    |
    */

    Route::prefix('quizzes')->group(function () {

        /*
        |--------------------------------------------------------------------------
        | Get a specific quiz
        |--------------------------------------------------------------------------
        |
        | Example:
        | GET /api/quizzes/quiz/5
        |
        */

        Route::get(
            '/quiz/{id}',
            [QuizController::class, 'show']
        )->whereNumber('id');


        /*
        |--------------------------------------------------------------------------
        | Get all quizzes for a document
        |--------------------------------------------------------------------------
        |
        | Example:
        | GET /api/quizzes/10
        |
        */

        Route::get(
            '/{documentId}',
            [QuizController::class, 'indexForDocument']
        )->whereNumber('documentId');


        /*
        |--------------------------------------------------------------------------
        | Submit Quiz
        |--------------------------------------------------------------------------
        |
        | Every submission creates a new quiz attempt.
        |
        | Example:
        | POST /api/quizzes/5/submit
        |
        */

        Route::post(
            '/{id}/submit',
            [QuizController::class, 'submit']
        )->whereNumber('id');


        /*
        |--------------------------------------------------------------------------
        | Latest Quiz Results
        |--------------------------------------------------------------------------
        |
        | Returns the logged-in user's latest attempt.
        |
        | Example:
        | GET /api/quizzes/5/results
        |
        */

        Route::get(
            '/{id}/results',
            [QuizController::class, 'results']
        )->whereNumber('id');


        /*
        |--------------------------------------------------------------------------
        | Quiz Attempt History
        |--------------------------------------------------------------------------
        |
        | Returns all attempts for the logged-in user.
        |
        | Example:
        | GET /api/quizzes/5/attempts
        |
        */

        Route::get(
            '/{id}/attempts',
            [QuizController::class, 'attempts']
        )->whereNumber('id');


        /*
        |--------------------------------------------------------------------------
        | Specific Quiz Attempt
        |--------------------------------------------------------------------------
        |
        | Example:
        | GET /api/quizzes/5/attempts/12
        |
        */

        Route::get(
            '/{id}/attempts/{attemptId}',
            [QuizController::class, 'attemptResults']
        )
            ->whereNumber('id')
            ->whereNumber('attemptId');


        /*
        |--------------------------------------------------------------------------
        | Delete Quiz
        |--------------------------------------------------------------------------
        |
        | quiz_attempts uses cascadeOnDelete(), therefore deleting a quiz
        | also removes its associated attempts.
        |
        */

        Route::delete(
            '/{id}',
            [QuizController::class, 'destroy']
        )->whereNumber('id');
    });


    /*
    |--------------------------------------------------------------------------
    | Progress
    |--------------------------------------------------------------------------
    |
    | Existing progress functionality.
    | This will later be expanded to track Subject and Chapter progress.
    |
    */

    Route::prefix('progress')->group(function () {

        Route::get(
            '/dashboard',
            [ProgressController::class, 'dashboard']
        );
    });
});