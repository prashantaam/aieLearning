<?php

use App\Http\Controllers\Api\AiController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\ChapterController;
use App\Http\Controllers\Api\ContentController;
use App\Http\Controllers\Api\DocumentController;
use App\Http\Controllers\Api\FlashcardController;
use App\Http\Controllers\Api\ProgressController;
use App\Http\Controllers\Api\QuizController;
use App\Http\Controllers\Api\SubjectController;
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
| Protected API Routes
|--------------------------------------------------------------------------
*/

Route::middleware('auth:sanctum')->group(function () {

    Route::post(
    '/ai/generate-learning-content',
    [AiController::class, 'generateLearningContent']
    );

    Route::post(
    '/ai/generate-course-chapters',
    [AiController::class, 'generateCourseChapters']
);
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
        | Create Subject
        |
        | Teacher only.
        */

        Route::post(
            '/',
            [SubjectController::class, 'store']
        );


        /*
        | Get Subject
        */

        Route::get(
            '/{subject}',
            [SubjectController::class, 'show']
        )->whereNumber('subject');


        /*
        | Update Subject
        */

        Route::put(
            '/{subject}',
            [SubjectController::class, 'update']
        )->whereNumber('subject');


        /*
        | Delete Subject
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
    */

    Route::get(
        '/subjects/{subject}/chapters',
        [ChapterController::class, 'index']
    )->whereNumber('subject');


    /*
    | Create Chapter
    |
    | Teacher owner only.
    */

    Route::post(
        '/subjects/{subject}/chapters',
        [ChapterController::class, 'store']
    )->whereNumber('subject');


    /*
    | Get Chapter
    */

    Route::get(
        '/chapters/{chapter}',
        [ChapterController::class, 'show']
    )->whereNumber('chapter');


    /*
    | Update Chapter
    */

    Route::put(
        '/chapters/{chapter}',
        [ChapterController::class, 'update']
    )->whereNumber('chapter');


    /*
    | Delete Chapter
    */

    Route::delete(
        '/chapters/{chapter}',
        [ChapterController::class, 'destroy']
    )->whereNumber('chapter');


    /*
    |--------------------------------------------------------------------------
    | Chapter Content
    |--------------------------------------------------------------------------
    |
    | Chapter content can be created in two ways:
    |
    | 1. Teacher writes/pastes text.
    | 2. Teacher uploads a PDF.
    |
    | PDF text is extracted and saved to contents.content.
    |
    | GET    /api/chapters/{chapter}/contents
    | POST   /api/chapters/{chapter}/contents
    | POST   /api/chapters/{chapter}/contents/upload
    |
    | PUT    /api/contents/{content}
    | DELETE /api/contents/{content}
    |
    */


    /*
    | Get Chapter Content
    */

    Route::get(
        '/chapters/{chapter}/contents',
        [ContentController::class, 'index']
    )->whereNumber('chapter');


    /*
    | Add Text Content
    */

    Route::post(
        '/chapters/{chapter}/contents',
        [ContentController::class, 'store']
    )->whereNumber('chapter');


    /*
    | Upload PDF Content
    |
    | PdfParserService extracts the PDF text.
    */

    Route::post(
        '/chapters/{chapter}/contents/upload',
        [ContentController::class, 'uploadPdf']
    )->whereNumber('chapter');


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
    | Chapter Quiz Generation
    |--------------------------------------------------------------------------
    |
    | Generates a quiz using all available content
    | belonging to the chapter.
    |
    | Example:
    |
    | POST /api/chapters/5/quizzes/generate
    |
    | Body:
    |
    | {
    |     "number_of_questions": 10
    | }
    |
    */

    Route::post(
        '/chapters/{chapter}/quizzes/generate',
        [AiController::class, 'generateQuizForChapter']
    )->whereNumber('chapter');


    /*
    |--------------------------------------------------------------------------
    | Chapter Flashcard Generation
    |--------------------------------------------------------------------------
    |
    | Generates flashcards using all available
    | chapter content.
    |
    | Example:
    |
    | POST /api/chapters/5/flashcards/generate
    |
    | Body:
    |
    | {
    |     "number_of_cards": 10
    | }
    |
    */

    Route::post(
        '/chapters/{chapter}/flashcards/generate',
        [FlashcardController::class, 'generateForChapter']
    )->whereNumber('chapter');


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
    | Subject
    |   └── Chapter
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
    | Later we can migrate Summary and Chat to Chapter too.
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
    | and later the Chapter quiz flow.
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
    | Subject
    |   ↓
    | Chapter
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