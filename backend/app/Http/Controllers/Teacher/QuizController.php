<?php

namespace App\Http\Controllers\Teacher;

use App\Http\Controllers\Controller;
use App\Models\Quiz;
use App\Models\Sublesson;
use App\Models\Teacher;
use Illuminate\Http\Request;

class QuizController extends Controller
{
    /**
     * List all quizzes for a sublesson.
     */
    public function index(
        Request $request,
        Sublesson $sublesson
    ) {
        $teacher = $request->user();

        if (! $teacher instanceof Teacher) {
            return response()->json([
                'message' => 'Teacher access required.',
            ], 403);
        }

        /*
        |--------------------------------------------------------------------------
        | Load ownership hierarchy
        |--------------------------------------------------------------------------
        |
        | Sublesson
        |   → Lesson
        |       → Course
        |           → Teacher
        |
        */

        $sublesson->load('lesson.course');

        if (
            ! $this->teacherOwnsSublesson(
                $teacher,
                $sublesson
            )
        ) {
            return response()->json([
                'message' =>
                    'You are not authorised to view quizzes for this sublesson.',
            ], 403);
        }

        /*
        |--------------------------------------------------------------------------
        | Get Sublesson Quizzes
        |--------------------------------------------------------------------------
        */

        $quizzes = Quiz::where(
            'sublesson_id',
            $sublesson->id
        )
            ->orderBy('sort_order')
            ->latest('id')
            ->get();

        return response()->json([
            'success' => true,

            'data' => [
                'sublesson' => [
                    'id' => $sublesson->id,
                    'title' => $sublesson->title,
                ],

                'quizzes' => $quizzes
                    ->map(
                        fn ($quiz) =>
                            $quiz->toResponseArray(
                                $sublesson
                            )
                    )
                    ->values(),
            ],
        ]);
    }

    /**
     * View a single quiz.
     */
    public function show(
        Request $request,
        Quiz $quiz
    ) {
        $teacher = $request->user();

        if (! $teacher instanceof Teacher) {
            return response()->json([
                'message' => 'Teacher access required.',
            ], 403);
        }

        if (
            ! $this->teacherOwnsQuiz(
                $teacher,
                $quiz
            )
        ) {
            return response()->json([
                'message' =>
                    'You are not authorised to view this quiz.',
            ], 403);
        }

        $quiz->load('sublesson');

        return response()->json([
            'success' => true,

            'data' => [
                'quiz' =>
                    $quiz->toResponseArray(
                        $quiz->sublesson
                    ),
            ],
        ]);
    }

    /**
     * Create/save a quiz for a sublesson.
     */
    public function store(
        Request $request,
        Sublesson $sublesson
    ) {
        $teacher = $request->user();

        if (! $teacher instanceof Teacher) {
            return response()->json([
                'message' => 'Teacher access required.',
            ], 403);
        }

        $sublesson->load('lesson.course');

        if (
            ! $this->teacherOwnsSublesson(
                $teacher,
                $sublesson
            )
        ) {
            return response()->json([
                'message' =>
                    'You are not authorised to create a quiz for this sublesson.',
            ], 403);
        }

        $validated = $request->validate(
            $this->quizValidationRules()
        );

        /*
        |--------------------------------------------------------------------------
        | Build Questions
        |--------------------------------------------------------------------------
        */

        $questions = Quiz::buildQuestions(
            $validated['questions']
        );

        /*
        |--------------------------------------------------------------------------
        | Calculate Sort Order
        |--------------------------------------------------------------------------
        */

        $maxSortOrder = Quiz::where(
            'sublesson_id',
            $sublesson->id
        )->max('sort_order');

        $nextSortOrder =
            ($maxSortOrder ?? 0) + 1;

        /*
        |--------------------------------------------------------------------------
        | Save Quiz
        |--------------------------------------------------------------------------
        */

        $quiz = Quiz::create([
            'sublesson_id' =>
                $sublesson->id,

            'title' =>
                $validated['title'],

            'questions' =>
                $questions,

            'total_questions' =>
                count($questions),

            'source_type' =>
                $validated['source_type']
                    ?? 'ai',

            'sort_order' =>
                $nextSortOrder,

            'status' =>
                'draft',
        ]);

        $quiz->load('sublesson');

        return response()->json([
            'success' => true,

            'message' =>
                'Quiz saved successfully.',

            'data' => [
                'quiz' =>
                    $quiz->toResponseArray(
                        $quiz->sublesson
                    ),
            ],
        ], 201);
    }

    /**
     * Update quiz title and questions.
     */
    public function update(
        Request $request,
        Quiz $quiz
    ) {
        $teacher = $request->user();

        if (! $teacher instanceof Teacher) {
            return response()->json([
                'message' => 'Teacher access required.',
            ], 403);
        }

        if (
            ! $this->teacherOwnsQuiz(
                $teacher,
                $quiz
            )
        ) {
            return response()->json([
                'message' =>
                    'You are not authorised to update this quiz.',
            ], 403);
        }

        $validated = $request->validate(
            $this->quizValidationRules()
        );

        $questions = Quiz::buildQuestions(
            $validated['questions']
        );

        $quiz->update([
            'title' =>
                $validated['title'],

            'questions' =>
                $questions,

            'total_questions' =>
                count($questions),

            'source_type' =>
                $validated['source_type']
                    ?? $quiz->source_type,
        ]);

        $quiz->load('sublesson');

        return response()->json([
            'success' => true,

            'message' =>
                'Quiz updated successfully.',

            'data' => [
                'quiz' =>
                    $quiz->toResponseArray(
                        $quiz->sublesson
                    ),
            ],
        ]);
    }

    /**
     * Delete a whole quiz.
     */
    public function destroy(
        Request $request,
        Quiz $quiz
    ) {
        $teacher = $request->user();

        if (! $teacher instanceof Teacher) {
            return response()->json([
                'message' => 'Teacher access required.',
            ], 403);
        }

        if (
            ! $this->teacherOwnsQuiz(
                $teacher,
                $quiz
            )
        ) {
            return response()->json([
                'message' =>
                    'You are not authorised to delete this quiz.',
            ], 403);
        }

        $sublessonId =
            $quiz->sublesson_id;

        $quiz->delete();

        return response()->json([
            'success' => true,

            'message' =>
                'Quiz deleted successfully.',

            'data' => [
                'sublessonId' =>
                    $sublessonId,
            ],
        ]);
    }

    /**
     * Publish a quiz.
     */
    public function publish(
        Request $request,
        Quiz $quiz
    ) {
        $teacher = $request->user();

        if (! $teacher instanceof Teacher) {
            return response()->json([
                'message' => 'Teacher access required.',
            ], 403);
        }

        if (
            ! $this->teacherOwnsQuiz(
                $teacher,
                $quiz
            )
        ) {
            return response()->json([
                'message' =>
                    'You are not authorised to publish this quiz.',
            ], 403);
        }

        $questions =
            $quiz->questions ?? [];

        if (count($questions) === 0) {
            return response()->json([
                'message' =>
                    'A quiz must contain at least one question before publishing.',
            ], 422);
        }

        $quiz->update([
            'status' => 'published',
        ]);

        $quiz->load('sublesson');

        return response()->json([
            'success' => true,

            'message' =>
                'Quiz published successfully.',

            'data' => [
                'quiz' =>
                    $quiz->toResponseArray(
                        $quiz->sublesson
                    ),
            ],
        ]);
    }

    /**
     * Move a published quiz back to draft.
     */
    public function unpublish(
        Request $request,
        Quiz $quiz
    ) {
        $teacher = $request->user();

        if (! $teacher instanceof Teacher) {
            return response()->json([
                'message' => 'Teacher access required.',
            ], 403);
        }

        if (
            ! $this->teacherOwnsQuiz(
                $teacher,
                $quiz
            )
        ) {
            return response()->json([
                'message' =>
                    'You are not authorised to unpublish this quiz.',
            ], 403);
        }

        $quiz->update([
            'status' => 'draft',
        ]);

        $quiz->load('sublesson');

        return response()->json([
            'success' => true,

            'message' =>
                'Quiz moved back to draft.',

            'data' => [
                'quiz' =>
                    $quiz->toResponseArray(
                        $quiz->sublesson
                    ),
            ],
        ]);
    }

    /**
     * Check whether the authenticated teacher
     * owns the Sublesson.
     */
    private function teacherOwnsSublesson(
        Teacher $teacher,
        Sublesson $sublesson
    ): bool {
        $sublesson->loadMissing(
            'lesson.course'
        );

        if (
            ! $sublesson->lesson ||
            ! $sublesson->lesson->course
        ) {
            return false;
        }

        return
            (int) $sublesson
                ->lesson
                ->course
                ->teacher_id
            ===
            (int) $teacher->id;
    }

    /**
     * Check whether the authenticated teacher
     * owns the course containing this quiz.
     */
    private function teacherOwnsQuiz(
        Teacher $teacher,
        Quiz $quiz
    ): bool {
        $quiz->loadMissing(
            'sublesson.lesson.course'
        );

        if (
            ! $quiz->sublesson ||
            ! $quiz->sublesson->lesson ||
            ! $quiz->sublesson->lesson->course
        ) {
            return false;
        }

        return
            (int) $quiz
                ->sublesson
                ->lesson
                ->course
                ->teacher_id
            ===
            (int) $teacher->id;
    }

    /**
     * Shared validation rules for create/update.
     */
    private function quizValidationRules(): array
    {
        return [
            'title' => [
                'required',
                'string',
                'max:255',
            ],

            'source_type' => [
                'nullable',
                'string',
                'in:ai,manual',
            ],

            'questions' => [
                'required',
                'array',
                'min:1',
            ],

            'questions.*.question' => [
                'required',
                'string',
            ],

            'questions.*.options' => [
                'required',
                'array',
                'min:2',
            ],

            'questions.*.options.*' => [
                'required',
                'string',
            ],

            'questions.*.correctAnswer' => [
                'required',
                'string',
            ],

            'questions.*.explanation' => [
                'nullable',
                'string',
            ],

            'questions.*.difficulty' => [
                'nullable',
                'string',
                'in:easy,medium,hard',
            ],
        ];
    }
}