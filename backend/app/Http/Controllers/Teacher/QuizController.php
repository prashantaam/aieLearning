<?php

namespace App\Http\Controllers\Teacher;

use App\Http\Controllers\Controller;
use App\Models\Lesson;
use App\Models\Quiz;
use App\Models\Teacher;
use Illuminate\Http\Request;

class QuizController extends Controller
{
    /**
     * List all quizzes for a lesson.
     */
    public function index(Request $request, Lesson $lesson)
    {
        $teacher = $request->user();

        if (! $teacher instanceof Teacher) {
            return response()->json([
                'message' => 'Teacher access required.',
            ], 403);
        }

        $lesson->load('course');

        if (! $lesson->course) {
            return response()->json([
                'message' => 'Course not found for this lesson.',
            ], 404);
        }

        if (
            (int) $lesson->course->teacher_id !==
            (int) $teacher->id
        ) {
            return response()->json([
                'message' => 'You are not authorised to view quizzes for this lesson.',
            ], 403);
        }

        $quizzes = Quiz::where(
            'lesson_id',
            $lesson->id
        )
            ->latest()
            ->get();

        return response()->json([
            'success' => true,
            'data' => [
                'lesson' => [
                    'id' => $lesson->id,
                    'title' => $lesson->title,
                ],

                'quizzes' => $quizzes
                    ->map(
                        fn ($quiz) =>
                            $quiz->toResponseArray()
                    )
                    ->values(),
            ],
        ]);
    }

    /**
     * View a single quiz.
     */
    public function show(Request $request, Quiz $quiz)
    {
        $teacher = $request->user();

        if (! $teacher instanceof Teacher) {
            return response()->json([
                'message' => 'Teacher access required.',
            ], 403);
        }

        if (! $this->teacherOwnsQuiz($teacher, $quiz)) {
            return response()->json([
                'message' => 'You are not authorised to view this quiz.',
            ], 403);
        }

        $quiz->load('lesson');

        return response()->json([
            'success' => true,
            'data' => [
                'quiz' => $quiz->toResponseArray(
                    $quiz->lesson
                ),
            ],
        ]);
    }

    /**
     * Create/save a quiz for a lesson.
     */
    public function store(Request $request, Lesson $lesson)
    {
        $teacher = $request->user();

        if (! $teacher instanceof Teacher) {
            return response()->json([
                'message' => 'Teacher access required.',
            ], 403);
        }

        $lesson->load('course');

        if (! $lesson->course) {
            return response()->json([
                'message' => 'Course not found for this lesson.',
            ], 404);
        }

        if (
            (int) $lesson->course->teacher_id !==
            (int) $teacher->id
        ) {
            return response()->json([
                'message' => 'You are not authorised to create a quiz for this lesson.',
            ], 403);
        }

        $validated = $request->validate(
            $this->quizValidationRules()
        );

        $questions = Quiz::buildQuestions(
            $validated['questions']
        );

        $quiz = Quiz::create([
            'lesson_id' => $lesson->id,
            'title' => $validated['title'],
            'questions' => $questions,
            'total_questions' => count($questions),
            'source_type' => $validated['source_type'] ?? 'ai',
            'status' => 'draft',
        ]);

        $quiz->load('lesson');

        return response()->json([
            'success' => true,
            'message' => 'Quiz saved successfully.',
            'data' => [
                'quiz' => $quiz->toResponseArray(
                    $quiz->lesson
                ),
            ],
        ], 201);
    }

    /**
     * Update quiz title and questions.
     */
    public function update(Request $request, Quiz $quiz)
    {
        $teacher = $request->user();

        if (! $teacher instanceof Teacher) {
            return response()->json([
                'message' => 'Teacher access required.',
            ], 403);
        }

        if (! $this->teacherOwnsQuiz($teacher, $quiz)) {
            return response()->json([
                'message' => 'You are not authorised to update this quiz.',
            ], 403);
        }

        $validated = $request->validate(
            $this->quizValidationRules()
        );

        $questions = Quiz::buildQuestions(
            $validated['questions']
        );

        $quiz->update([
            'title' => $validated['title'],
            'questions' => $questions,
            'total_questions' => count($questions),
        ]);

        $quiz->load('lesson');

        return response()->json([
            'success' => true,
            'message' => 'Quiz updated successfully.',
            'data' => [
                'quiz' => $quiz->toResponseArray(
                    $quiz->lesson
                ),
            ],
        ]);
    }

    /**
     * Delete a whole quiz.
     */
    public function destroy(Request $request, Quiz $quiz)
    {
        $teacher = $request->user();

        if (! $teacher instanceof Teacher) {
            return response()->json([
                'message' => 'Teacher access required.',
            ], 403);
        }

        if (! $this->teacherOwnsQuiz($teacher, $quiz)) {
            return response()->json([
                'message' => 'You are not authorised to delete this quiz.',
            ], 403);
        }

        $lessonId = $quiz->lesson_id;

        $quiz->delete();

        return response()->json([
            'success' => true,
            'message' => 'Quiz deleted successfully.',
            'data' => [
                'lessonId' => $lessonId,
            ],
        ]);
    }

    /**
     * Publish a quiz.
     */
    public function publish(Request $request, Quiz $quiz)
    {
        $teacher = $request->user();

        if (! $teacher instanceof Teacher) {
            return response()->json([
                'message' => 'Teacher access required.',
            ], 403);
        }

        if (! $this->teacherOwnsQuiz($teacher, $quiz)) {
            return response()->json([
                'message' => 'You are not authorised to publish this quiz.',
            ], 403);
        }

        $questions = $quiz->questions ?? [];

        if (count($questions) === 0) {
            return response()->json([
                'message' => 'A quiz must contain at least one question before publishing.',
            ], 422);
        }

        $quiz->update([
            'status' => 'published',
        ]);

        $quiz->load('lesson');

        return response()->json([
            'success' => true,
            'message' => 'Quiz published successfully.',
            'data' => [
                'quiz' => $quiz->toResponseArray(
                    $quiz->lesson
                ),
            ],
        ]);
    }

    /**
     * Move a published quiz back to draft.
     */
    public function unpublish(Request $request, Quiz $quiz)
    {
        $teacher = $request->user();

        if (! $teacher instanceof Teacher) {
            return response()->json([
                'message' => 'Teacher access required.',
            ], 403);
        }

        if (! $this->teacherOwnsQuiz($teacher, $quiz)) {
            return response()->json([
                'message' => 'You are not authorised to unpublish this quiz.',
            ], 403);
        }

        $quiz->update([
            'status' => 'draft',
        ]);

        $quiz->load('lesson');

        return response()->json([
            'success' => true,
            'message' => 'Quiz moved back to draft.',
            'data' => [
                'quiz' => $quiz->toResponseArray(
                    $quiz->lesson
                ),
            ],
        ]);
    }

    /**
     * Check whether the authenticated teacher owns
     * the course containing this quiz.
     */
    private function teacherOwnsQuiz(
        Teacher $teacher,
        Quiz $quiz
    ): bool {
        $quiz->loadMissing('lesson.course');

        if (
            ! $quiz->lesson ||
            ! $quiz->lesson->course
        ) {
            return false;
        }

        return
            (int) $quiz->lesson->course->teacher_id ===
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