<?php

use App\Http\Controllers\Teacher\AiController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Teacher\LessonController;
use App\Http\Controllers\Teacher\ContentController;
use App\Http\Controllers\Teacher\DocumentController;
use App\Http\Controllers\Teacher\FlashcardController;
use App\Http\Controllers\Api\ProgressController;
use App\Http\Controllers\Teacher\QuizController;
use App\Http\Controllers\Teacher\CourseController;
use Illuminate\Support\Facades\Route;

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
| Teachers routes
|--------------------------------------------------------------------------
*/
Route::middleware('auth:sanctum')
    ->prefix('teacher')
    ->group(function () {

        Route::apiResource('courses', CourseController::class);

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

        Route::post(
            '/lessons/{lesson}/contents',
            [LessonContentController::class, 'store']
        );
    });



/*
|--------------------------------------------------------------------------
| Protected API Routes
|--------------------------------------------------------------------------
*/

Route::middleware('auth:sanctum')->group(function () {

   

    
    /*
    |--------------------------------------------------------------------------
    | Lessons
    |--------------------------------------------------------------------------
    |
    | GET    /api/courses/{course}/lessons
    | POST   /api/courses/{course}/lessons
    |
    | GET    /api/lessons/{lesson}
    | PUT    /api/lessons/{lesson}
    | DELETE /api/lessons/{lesson}
    |
    */

    Route::get(
        '/courses/{course}/lessons',
        [LessonController::class, 'index']
    )->whereNumber('course');


    /*
    | Create Lesson
    |
    | Teacher owner only.
    */

    Route::post(
        '/courses/{course}/lessons',
        [LessonController::class, 'store']
    )->whereNumber('course');


    /*
    | Get Lesson
    */

    Route::get(
        '/lessons/{lesson}',
        [LessonController::class, 'show']
    )->whereNumber('lesson');


    /*
    | Update Lesson
    */

    Route::put(
        '/lessons/{lesson}',
        [LessonController::class, 'update']
    )->whereNumber('lesson');


    /*
    | Delete Lesson
    */

    Route::delete(
        '/lessons/{lesson}',
        [LessonController::class, 'destroy']
    )->whereNumber('lesson');


    /*
    |--------------------------------------------------------------------------
    | Lesson Content
    |--------------------------------------------------------------------------
    |
    | Lesson content can be created in two ways:
    |
    | 1. Teacher writes/pastes text.
    | 2. Teacher uploads a PDF.
    |
    | PDF text is extracted and saved to contents.content.
    |
    | GET    /api/lessons/{lesson}/contents
    | POST   /api/lessons/{lesson}/contents
    | POST   /api/lessons/{lesson}/contents/upload
    |
    | PUT    /api/contents/{content}
    | DELETE /api/contents/{content}
    |
    */


    /*
    | Get Lesson Content
    */

    Route::get(
        '/lessons/{lesson}/contents',
        [ContentController::class, 'index']
    )->whereNumber('lesson');


    /*
    | Add Text Content
    */

    Route::post(
        '/lessons/{lesson}/contents',
        [ContentController::class, 'store']
    )->whereNumber('lesson');


    /*
    | Upload PDF Content
    |
    | PdfParserService extracts the PDF text.
    */

    Route::post(
        '/lessons/{lesson}/contents/upload',
        [ContentController::class, 'uploadPdf']
    )->whereNumber('lesson');


    /*
    | Update Content
    */

    Route::put(
        '/contents/{content}',
        [ContentController::class, 'update']
    )->whereNumber('content');


    /*
    | Delete Content
    */

    Route::delete(
        '/contents/{content}',
        [ContentController::class, 'destroy']
    )->whereNumber('content');


    /*
    |--------------------------------------------------------------------------
    | Lesson Quiz Generation
    |--------------------------------------------------------------------------
    |
    | Generates a quiz using all available content
    | belonging to the lesson.
    |
    | Example:
    |
    | POST /api/lessons/5/quizzes/generate
    |
    | Body:
    |
    | {
    |     "number_of_questions": 10
    | }
    |
    */

    Route::post(
        '/lessons/{lesson}/quizzes/generate',
        [AiController::class, 'generateQuizForLesson']
    )->whereNumber('lesson');


    /*
    |--------------------------------------------------------------------------
    | Lesson Flashcard Generation
    |--------------------------------------------------------------------------
    |
    | Generates flashcards using all available
    | lesson content.
    |
    | Example:
    |
    | POST /api/lessons/5/flashcards/generate
    |
    | Body:
    |
    | {
    |     "number_of_cards": 10
    | }
    |
    */

    Route::post(
        '/lessons/{lesson}/flashcards/generate',
        [FlashcardController::class, 'generateForLesson']
    )->whereNumber('lesson');


    /*
    |--------------------------------------------------------------------------
    | Documents
    |--------------------------------------------------------------------------
    |
    | Existing document functionality is being kept.
    |
    | We are NOT removing this yet because the current
    | Quiz and Flashcard functionality still uses Documents.
    |
    | Migration:
    |
    | OLD:
    |
    | Document
    |   ├── Quiz
    |   └── Flashcards
    |
    | NEW:
    |
    | Course
    |   └── Lesson
    |        ├── Content
    |        ├── Quiz
    |        └── Flashcards
    |
    */

    Route::prefix('documents')->group(function () {

        /*
        | Upload Document
        */

        Route::post(
            '/upload',
            [DocumentController::class, 'upload']
        );


        /*
        | Get Documents
        */

        Route::get(
            '/',
            [DocumentController::class, 'index']
        );


        /*
        | Get Document
        */

        Route::get(
            '/{id}',
            [DocumentController::class, 'show']
        )->whereNumber('id');


        /*
        | Delete Document
        */

        Route::delete(
            '/{id}',
            [DocumentController::class, 'destroy']
        )->whereNumber('id');
    });


    /*
    |--------------------------------------------------------------------------
    | Existing Document Flashcards
    |--------------------------------------------------------------------------
    |
    | Existing document-based functionality.
    |
    | DO NOT remove yet.
    |
    | GET    /api/flashcards
    | GET    /api/flashcards/{documentId}
    | POST   /api/flashcards/{cardId}/review
    | PUT    /api/flashcards/{cardId}/star
    | DELETE /api/flashcards/{id}
    |
    */

    Route::prefix('flashcards')->group(function () {

        /*
        | Get All Flashcard Sets
        */

        Route::get(
            '/',
            [FlashcardController::class, 'indexAll']
        );


        /*
        | Get Flashcards for Document
        */

        Route::get(
            '/{documentId}',
            [FlashcardController::class, 'indexForDocument']
        )->whereNumber('documentId');


        /*
        | Review Flashcard
        */

        Route::post(
            '/{cardId}/review',
            [FlashcardController::class, 'review']
        )->whereNumber('cardId');


        /*
        | Star / Unstar
        */

        Route::put(
            '/{cardId}/star',
            [FlashcardController::class, 'toggleStar']
        )->whereNumber('cardId');


        /*
        | Delete Flashcard / Set
        */

        Route::delete(
            '/{id}',
            [FlashcardController::class, 'destroy']
        )->whereNumber('id');
    });


    /*
    |--------------------------------------------------------------------------
    | Existing Document AI
    |--------------------------------------------------------------------------
    |
    | Existing AI functionality is kept so the current
    | Document learning workflow continues working.
    |
    | Later we can migrate Summary and Chat to Lesson too.
    |
    */

    Route::prefix('ai')->group(function () {

        /*
        | Generate Document Flashcards
        */

        Route::post(
            '/generate-flashcards',
            [AiController::class, 'generateFlashcards']
        );


        /*
        | Generate Document Quiz
        */

        Route::post(
            '/generate-quiz',
            [AiController::class, 'generateQuiz']
        );


        /*
        | Generate Document Summary
        */

        Route::post(
            '/generate-summary',
            [AiController::class, 'generateSummary']
        );


        /*
        | Document AI Chat
        */

        Route::post(
            '/chat',
            [AiController::class, 'chat']
        );


        /*
        | Explain Concept
        */

        Route::post(
            '/explain-concept',
            [AiController::class, 'explainConcept']
        );


        /*
        | Chat History
        */

        Route::get(
            '/chat-history/{documentId}',
            [AiController::class, 'chatHistory']
        )->whereNumber('documentId');
    });


    /*
    |--------------------------------------------------------------------------
    | Existing Quizzes
    |--------------------------------------------------------------------------
    |
    | Existing quiz functionality remains available.
    |
    | This supports both the current Document quiz flow
    | and later the Lesson quiz flow.
    |
    | GET    /api/quizzes/quiz/{id}
    | GET    /api/quizzes/{documentId}
    | POST   /api/quizzes/{id}/submit
    | GET    /api/quizzes/{id}/results
    | GET    /api/quizzes/{id}/attempts
    | GET    /api/quizzes/{id}/attempts/{attemptId}
    | DELETE /api/quizzes/{id}
    |
    */

    Route::prefix('quizzes')->group(function () {

        /*
        |--------------------------------------------------------------------------
        | Get Specific Quiz
        |--------------------------------------------------------------------------
        |
        | GET /api/quizzes/quiz/5
        |
        */

        Route::get(
            '/quiz/{id}',
            [QuizController::class, 'show']
        )->whereNumber('id');


        /*
        |--------------------------------------------------------------------------
        | Get Quizzes For Document
        |--------------------------------------------------------------------------
        |
        | Existing document route.
        |
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
        */

        Route::get(
            '/{id}/results',
            [QuizController::class, 'results']
        )->whereNumber('id');


        /*
        |--------------------------------------------------------------------------
        | Quiz Attempt History
        |--------------------------------------------------------------------------
        */

        Route::get(
            '/{id}/attempts',
            [QuizController::class, 'attempts']
        )->whereNumber('id');


        /*
        |--------------------------------------------------------------------------
        | Specific Quiz Attempt
        |--------------------------------------------------------------------------
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
        | quiz_attempts uses cascadeOnDelete().
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
    |
    | Later we will migrate progress tracking to:
    |
    | Course
    |   ↓
    | Lesson
    |   ↓
    | Content / Quiz / Flashcards
    |
    */

    Route::prefix('progress')->group(function () {

        Route::get(
            '/dashboard',
            [ProgressController::class, 'dashboard']
        );
    });
});