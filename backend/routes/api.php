<?php

use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Teacher Controllers
|--------------------------------------------------------------------------
*/

use App\Http\Controllers\Teacher\AiController;
use App\Http\Controllers\Teacher\AuthController;
use App\Http\Controllers\Teacher\CourseController;
use App\Http\Controllers\Teacher\LessonController;
use App\Http\Controllers\Teacher\SublessonController;
use App\Http\Controllers\Teacher\SublessonContentController;
use App\Http\Controllers\Teacher\QuizController;
use App\Http\Controllers\Teacher\FlashcardController;
use App\Http\Controllers\Teacher\ExerciseController;
use App\Http\Controllers\Teacher\InteractiveDemoController;

/*
|--------------------------------------------------------------------------
| Student Controllers
|--------------------------------------------------------------------------
*/

use App\Http\Controllers\Student\AuthController as StudentAuthController;
use App\Http\Controllers\Student\CourseController as StudentCourseController;


/*
|--------------------------------------------------------------------------
| Student API Routes
|--------------------------------------------------------------------------
*/

Route::prefix('student')->group(function () {

    /*
    |--------------------------------------------------------------------------
    | Public Student Authentication
    |--------------------------------------------------------------------------
    */

    Route::post('/register', [
        StudentAuthController::class,
        'register',
    ]);

    Route::post('/login', [
        StudentAuthController::class,
        'login',
    ]);


    /*
    |--------------------------------------------------------------------------
    | Authenticated Student Routes
    |--------------------------------------------------------------------------
    */

    Route::middleware('auth:sanctum')->group(function () {

        /*
        |--------------------------------------------------------------------------
        | Student Authentication
        |--------------------------------------------------------------------------
        */

        Route::get('/me', [
            StudentAuthController::class,
            'me',
        ]);

        Route::post('/logout', [
            StudentAuthController::class,
            'logout',
        ]);


        /*
        |--------------------------------------------------------------------------
        | Student Courses
        |--------------------------------------------------------------------------
        |
        | Students can only access courses exposed through the
        | Student CourseController.
        |
        */

        Route::get('/courses', [
            StudentCourseController::class,
            'index',
        ]);

        Route::get('/courses/{slug}', [
            StudentCourseController::class,
            'show',
        ]);

    });
});


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

    Route::post('/register', [
        AuthController::class,
        'register',
    ]);

    Route::post('/login', [
        AuthController::class,
        'login',
    ]);


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

        Route::get('/me', [
            AuthController::class,
            'me',
        ]);

        Route::post('/logout', [
            AuthController::class,
            'logout',
        ]);


        /*
        |--------------------------------------------------------------------------
        | Course Management
        |--------------------------------------------------------------------------
        */

        Route::apiResource(
            'courses',
            CourseController::class
        );

        Route::patch(
            '/courses/{course}/publish',
            [
                CourseController::class,
                'publish',
            ]
        );

        Route::patch(
            '/courses/{course}/unpublish',
            [
                CourseController::class,
                'unpublish',
            ]
        );


        /*
        |--------------------------------------------------------------------------
        | Lesson Management
        |--------------------------------------------------------------------------
        */

        Route::post(
            '/courses/{course}/lessons',
            [
                LessonController::class,
                'store',
            ]
        );

        Route::get(
            '/lessons/{lesson}',
            [
                LessonController::class,
                'show',
            ]
        );

        Route::put(
            '/lessons/{lesson}',
            [
                LessonController::class,
                'update',
            ]
        );

        Route::delete(
            '/lessons/{lesson}',
            [
                LessonController::class,
                'destroy',
            ]
        );

        Route::patch(
            '/lessons/{lesson}/publish',
            [
                LessonController::class,
                'publish',
            ]
        );

        Route::patch(
            '/lessons/{lesson}/unpublish',
            [
                LessonController::class,
                'unpublish',
            ]
        );


        /*
        |--------------------------------------------------------------------------
        | Sublesson Management
        |--------------------------------------------------------------------------
        */

        // List all Sublessons belonging to a Lesson
        Route::get(
            '/lessons/{lesson}/sublessons',
            [
                SublessonController::class,
                'index',
            ]
        );

        // Create a Sublesson under a Lesson
        Route::post(
            '/lessons/{lesson}/sublessons',
            [
                SublessonController::class,
                'store',
            ]
        );

        // View a single Sublesson
        Route::get(
            '/sublessons/{sublesson}',
            [
                SublessonController::class,
                'show',
            ]
        );

        // Update a Sublesson
        Route::put(
            '/sublessons/{sublesson}',
            [
                SublessonController::class,
                'update',
            ]
        );

        // Delete a Sublesson
        Route::delete(
            '/sublessons/{sublesson}',
            [
                SublessonController::class,
                'destroy',
            ]
        );

        // Publish a Sublesson
        Route::patch(
            '/sublessons/{sublesson}/publish',
            [
                SublessonController::class,
                'publish',
            ]
        );

        // Move Sublesson back to draft
        Route::patch(
            '/sublessons/{sublesson}/unpublish',
            [
                SublessonController::class,
                'unpublish',
            ]
        );


        /*
        |--------------------------------------------------------------------------
        | Content Sublesson Management
        |--------------------------------------------------------------------------
        |
        | New authoring flow:
        |
        | Lesson
        |   └── Content Sublesson
        |         └── Sublesson Content
        |
        | The teacher creates the Sublesson and its first Content record
        | together from the Content creation page.
        |
        */

        // Create a Content Sublesson and its Content in one transaction
        Route::post(
            '/lessons/{lesson}/content',
            [
                SublessonContentController::class,
                'storeForLesson',
            ]
        );


        /*
        |--------------------------------------------------------------------------
        | Existing Sublesson Content Management
        |--------------------------------------------------------------------------
        |
        | These routes remain available for reading and managing content
        | after the Content Sublesson has been created.
        |
        */

        // List Content belonging to a Sublesson
        Route::get(
            '/sublessons/{sublesson}/contents',
            [
                SublessonContentController::class,
                'index',
            ]
        );

        // Create additional Content under an existing Sublesson
        Route::post(
            '/sublessons/{sublesson}/contents',
            [
                SublessonContentController::class,
                'store',
            ]
        );

        // View a single Content block
        Route::get(
            '/sublesson-contents/{sublessonContent}',
            [
                SublessonContentController::class,
                'show',
            ]
        );

        // Update Content
        Route::put(
            '/sublesson-contents/{sublessonContent}',
            [
                SublessonContentController::class,
                'update',
            ]
        );

        // Delete Content
        Route::delete(
            '/sublesson-contents/{sublessonContent}',
            [
                SublessonContentController::class,
                'destroy',
            ]
        );


        /*
        |--------------------------------------------------------------------------
        | Interactive Demo Management
        |--------------------------------------------------------------------------
        |
        | Sublesson
        |     └── Interactive Demos
        |
        */

        // List Interactive Demos belonging to a Sublesson
        Route::get(
            '/sublessons/{sublesson}/demos',
            [
                InteractiveDemoController::class,
                'index',
            ]
        );

        // Create Interactive Demo under a Sublesson
        Route::post(
            '/sublessons/{sublesson}/demos',
            [
                InteractiveDemoController::class,
                'store',
            ]
        );

        // View a single Interactive Demo
        Route::get(
            '/sublessons/{sublesson}/demos/{demo}',
            [
                InteractiveDemoController::class,
                'show',
            ]
        );

        // Update Interactive Demo
        Route::put(
            '/sublessons/{sublesson}/demos/{demo}',
            [
                InteractiveDemoController::class,
                'update',
            ]
        );

        // Delete Interactive Demo
        Route::delete(
            '/sublessons/{sublesson}/demos/{demo}',
            [
                InteractiveDemoController::class,
                'destroy',
            ]
        );

        // Publish Interactive Demo
        Route::patch(
            '/sublessons/{sublesson}/demos/{demo}/publish',
            [
                InteractiveDemoController::class,
                'publish',
            ]
        );

        // Move Interactive Demo back to draft
        Route::patch(
            '/sublessons/{sublesson}/demos/{demo}/unpublish',
            [
                InteractiveDemoController::class,
                'unpublish',
            ]
        );


        /*
        |--------------------------------------------------------------------------
        | Sublesson Quiz Management
        |--------------------------------------------------------------------------
        |
        | Sublesson
        |     └── Quiz
        |
        */

        // List all Quizzes belonging to a Sublesson
        Route::get(
            '/sublessons/{sublesson}/quizzes',
            [
                QuizController::class,
                'index',
            ]
        );

        // Save/Create a Quiz under a Sublesson
        Route::post(
            '/sublessons/{sublesson}/quizzes',
            [
                QuizController::class,
                'store',
            ]
        );

        // View a single Quiz
        Route::get(
            '/quizzes/{quiz}',
            [
                QuizController::class,
                'show',
            ]
        );

        // Update a Quiz
        Route::put(
            '/quizzes/{quiz}',
            [
                QuizController::class,
                'update',
            ]
        );

        // Delete a Quiz
        Route::delete(
            '/quizzes/{quiz}',
            [
                QuizController::class,
                'destroy',
            ]
        );

        // Publish a Quiz
        Route::patch(
            '/quizzes/{quiz}/publish',
            [
                QuizController::class,
                'publish',
            ]
        );

        // Move Quiz back to draft
        Route::patch(
            '/quizzes/{quiz}/unpublish',
            [
                QuizController::class,
                'unpublish',
            ]
        );


        /*
        |--------------------------------------------------------------------------
        | Sublesson Flashcard Management
        |--------------------------------------------------------------------------
        |
        | Sublesson
        |     └── Flashcards
        |
        */

        // List Flashcard sets belonging to a Sublesson
        Route::get(
            '/sublessons/{sublesson}/flashcards',
            [
                FlashcardController::class,
                'index',
            ]
        );

        // Save/Create Flashcards under a Sublesson
        Route::post(
            '/sublessons/{sublesson}/flashcards',
            [
                FlashcardController::class,
                'store',
            ]
        );

        // View a single Flashcard set
        Route::get(
            '/flashcards/{flashcard}',
            [
                FlashcardController::class,
                'show',
            ]
        );

        // Update a Flashcard set
        Route::put(
            '/flashcards/{flashcard}',
            [
                FlashcardController::class,
                'update',
            ]
        );

        // Delete a Flashcard set
        Route::delete(
            '/flashcards/{flashcard}',
            [
                FlashcardController::class,
                'destroy',
            ]
        );

        // Publish Flashcards
        Route::patch(
            '/flashcards/{flashcard}/publish',
            [
                FlashcardController::class,
                'publish',
            ]
        );

        // Move Flashcards back to draft
        Route::patch(
            '/flashcards/{flashcard}/unpublish',
            [
                FlashcardController::class,
                'unpublish',
            ]
        );


        /*
        |--------------------------------------------------------------------------
        | Sublesson Exercise Management
        |--------------------------------------------------------------------------
        |
        | Sublesson
        |     └── Exercises
        |
        */

        // List Exercises belonging to a Sublesson
        Route::get(
            '/sublessons/{sublesson}/exercises',
            [
                ExerciseController::class,
                'index',
            ]
        );

        // Create Exercise under a Sublesson
        Route::post(
            '/sublessons/{sublesson}/exercises',
            [
                ExerciseController::class,
                'store',
            ]
        );

        // View a single Exercise
        Route::get(
            '/sublessons/{sublesson}/exercises/{exercise}',
            [
                ExerciseController::class,
                'show',
            ]
        );

        // Update Exercise
        Route::put(
            '/sublessons/{sublesson}/exercises/{exercise}',
            [
                ExerciseController::class,
                'update',
            ]
        );

        // Delete Exercise
        Route::delete(
            '/sublessons/{sublesson}/exercises/{exercise}',
            [
                ExerciseController::class,
                'destroy',
            ]
        );

        // Publish Exercise
        Route::patch(
            '/sublessons/{sublesson}/exercises/{exercise}/publish',
            [
                ExerciseController::class,
                'publish',
            ]
        );

        // Move Exercise back to draft
        Route::patch(
            '/sublessons/{sublesson}/exercises/{exercise}/unpublish',
            [
                ExerciseController::class,
                'unpublish',
            ]
        );


        /*
        |--------------------------------------------------------------------------
        | AI Course Authoring
        |--------------------------------------------------------------------------
        */

        // Generate Lesson structure for a Course
        Route::post(
            '/ai/generate-course-lessons',
            [
                AiController::class,
                'generateCourseLessons',
            ]
        );

        // Generate short learning content for a Sublesson
        Route::post(
            '/ai/generate-learning-content',
            [
                AiController::class,
                'generateLearningContent',
            ]
        );

        // Generate Quiz preview using Sublesson Content
        Route::post(
            '/ai/generate-quiz',
            [
                AiController::class,
                'generateQuiz',
            ]
        );

        // Generate Flashcard preview using Sublesson Content
        Route::post(
            '/ai/generate-flashcards',
            [
                AiController::class,
                'generateFlashcards',
            ]
        );

    });
});