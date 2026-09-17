<?php

namespace App\Http\Controllers\Teacher;

use App\Http\Controllers\Controller;
use App\Models\Exercise;
use App\Models\Sublesson;
use App\Models\Teacher;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ExerciseController extends Controller
{
    /**
     * List all exercises for a sublesson.
     */
    public function index(
        Request $request,
        Sublesson $sublesson
    ): JsonResponse {
        $teacher = $this->getTeacher($request);

        $this->ensureTeacherOwnsSublesson(
            $teacher,
            $sublesson
        );

        $exercises = Exercise::query()
            ->where(
                'sublesson_id',
                $sublesson->id
            )
            ->orderBy('sort_order')
            ->orderBy('id')
            ->get();

        return response()->json([
            'success' => true,

            'data' => [
                'sublesson' => [
                    'id' => $sublesson->id,
                    'title' => $sublesson->title,
                ],

                'exercises' => $exercises,
            ],
        ]);
    }


    /**
     * Create an exercise.
     */
    public function store(
        Request $request,
        Sublesson $sublesson
    ): JsonResponse {
        $teacher = $this->getTeacher($request);

        $this->ensureTeacherOwnsSublesson(
            $teacher,
            $sublesson
        );

        $validated = $request->validate(
            $this->exerciseValidationRules()
        );

        /*
        |--------------------------------------------------------------------------
        | Calculate Sort Order
        |--------------------------------------------------------------------------
        */

        $maxSortOrder = Exercise::query()
            ->where(
                'sublesson_id',
                $sublesson->id
            )
            ->max('sort_order');

        $nextSortOrder =
            ($maxSortOrder ?? 0) + 1;

        /*
        |--------------------------------------------------------------------------
        | Create Exercise
        |--------------------------------------------------------------------------
        */

        $exercise = Exercise::create([
            'sublesson_id' =>
                $sublesson->id,

            'created_by' =>
                $teacher->id,

            'title' =>
                $validated['title'],

            'instructions' =>
                $validated['instructions']
                    ?? null,

            'exercise_type' =>
                $validated['exercise_type'],

            'language' =>
                $validated['language']
                    ?? null,

            'starter_code' =>
                $validated['starter_code']
                    ?? null,

            'solution_code' =>
                $validated['solution_code']
                    ?? null,

            'expected_output' =>
                $validated['expected_output']
                    ?? null,

            'settings' =>
                $validated['settings']
                    ?? null,

            'sort_order' =>
                $nextSortOrder,

            'source_type' =>
                $validated['source_type']
                    ?? 'manual',

            'status' => 'draft',
        ]);

        $exercise->load('sublesson');

        return response()->json([
            'success' => true,

            'message' =>
                'Exercise created successfully.',

            'data' => [
                'exercise' => $exercise,
            ],
        ], 201);
    }


    /**
     * Show a single exercise.
     */
public function show(
    Request $request,
    Sublesson $sublesson,
    Exercise $exercise
): JsonResponse {
    $teacher = $this->getTeacher($request);

    $this->ensureTeacherOwnsSublesson(
        $teacher,
        $sublesson
    );

    $this->ensureExerciseBelongsToSublesson(
        $exercise,
        $sublesson
    );

    return response()->json([
        'success' => true,

        'data' => [
            'exercise' => $exercise,
        ],
    ]);
}


    /**
     * Update an exercise.
     */
   public function update(
    Request $request,
    Sublesson $sublesson,
    Exercise $exercise
): JsonResponse {
    $teacher = $this->getTeacher($request);

    $this->ensureTeacherOwnsSublesson(
        $teacher,
        $sublesson
    );

    $this->ensureExerciseBelongsToSublesson(
        $exercise,
        $sublesson
    );

    $validated = $request->validate(
        $this->exerciseValidationRules()
    );

    $exercise->update([
        'title' =>
            $validated['title'],

        'instructions' =>
            $validated['instructions']
                ?? null,

        'exercise_type' =>
            $validated['exercise_type'],

        'language' =>
            $validated['language']
                ?? null,

        'starter_code' =>
            $validated['starter_code']
                ?? null,

        'solution_code' =>
            $validated['solution_code']
                ?? null,

        'expected_output' =>
            $validated['expected_output']
                ?? null,

        'settings' =>
            $validated['settings']
                ?? null,

        'source_type' =>
            $validated['source_type']
                ?? $exercise->source_type,
    ]);

    $exercise->refresh();

    return response()->json([
        'success' => true,

        'message' =>
            'Exercise updated successfully.',

        'data' => [
            'exercise' => $exercise,
        ],
    ]);
}

    /**
     * Delete an exercise.
     */
  public function destroy(
        Request $request,
        Sublesson $sublesson,
        Exercise $exercise
    ): JsonResponse {
        $teacher = $this->getTeacher($request);

        $this->ensureTeacherOwnsSublesson(
            $teacher,
            $sublesson
        );

        $this->ensureExerciseBelongsToSublesson(
            $exercise,
            $sublesson
        );

        $exerciseId = $exercise->id;

        $exercise->delete();

        return response()->json([
            'success' => true,

            'message' =>
                'Exercise deleted successfully.',

            'data' => [
                'exerciseId' => $exerciseId,
                'sublessonId' => $sublesson->id,
            ],
        ]);
    }

    /**
     * Publish an exercise.
     */
   public function publish(
    Request $request,
    Sublesson $sublesson,
    Exercise $exercise
): JsonResponse {
    $teacher = $this->getTeacher($request);

    $this->ensureTeacherOwnsSublesson(
        $teacher,
        $sublesson
    );

    $this->ensureExerciseBelongsToSublesson(
        $exercise,
        $sublesson
    );

    $exercise->update([
        'status' => 'published',
    ]);

    $exercise->refresh();

    return response()->json([
        'success' => true,

        'message' =>
            'Exercise published successfully.',

        'data' => [
            'exercise' => $exercise,
        ],
    ]);
}

    /**
     * Move an exercise back to draft.
     */
   public function unpublish(
    Request $request,
    Sublesson $sublesson,
    Exercise $exercise
): JsonResponse {
    $teacher = $this->getTeacher($request);

    $this->ensureTeacherOwnsSublesson(
        $teacher,
        $sublesson
    );

    $this->ensureExerciseBelongsToSublesson(
        $exercise,
        $sublesson
    );

    $exercise->update([
        'status' => 'draft',
    ]);

    $exercise->refresh();

    return response()->json([
        'success' => true,

        'message' =>
            'Exercise moved back to draft.',

        'data' => [
            'exercise' => $exercise,
        ],
    ]);
}

    /**
     * Get authenticated teacher.
     */
    private function getTeacher(
        Request $request
    ): Teacher {
        $teacher = $request->user();

        abort_unless(
            $teacher instanceof Teacher,
            403,
            'Teacher access required.'
        );

        return $teacher;
    }


    /**
     * Check teacher owns sublesson.
     */
    private function ensureTeacherOwnsSublesson(
        Teacher $teacher,
        Sublesson $sublesson
    ): void {
        $sublesson->loadMissing(
            'lesson.course'
        );

        abort_unless(
            $sublesson->lesson
                && $sublesson->lesson->course
                && (int) $sublesson
                    ->lesson
                    ->course
                    ->teacher_id
                    === (int) $teacher->id,
            403,
            'You are not authorised to manage this sublesson.'
        );
    }


    /**
     * Check teacher owns exercise.
     */
    private function ensureTeacherOwnsExercise(
        Teacher $teacher,
        Exercise $exercise
    ): void {
        $exercise->loadMissing(
            'sublesson.lesson.course'
        );

        abort_unless(
            $exercise->sublesson
                && $exercise->sublesson->lesson
                && $exercise
                    ->sublesson
                    ->lesson
                    ->course
                && (int) $exercise
                    ->sublesson
                    ->lesson
                    ->course
                    ->teacher_id
                    === (int) $teacher->id,
            403,
            'You are not authorised to manage this exercise.'
        );
    }

    private function ensureExerciseBelongsToSublesson(
        Exercise $exercise,
        Sublesson $sublesson
    ): void {
        abort_unless(
            (int) $exercise->sublesson_id
                === (int) $sublesson->id,
            404,
            'Exercise not found for this sublesson.'
        );
    }

    /**
     * Shared validation rules.
     */
    private function exerciseValidationRules(): array
    {
        return [
            'title' => [
                'required',
                'string',
                'max:255',
            ],

            'instructions' => [
                'nullable',
                'string',
            ],

            'exercise_type' => [
                'required',
                'string',
                'in:code,sql,terminal,project',
            ],

            'language' => [
                'nullable',
                'string',
                'max:50',
            ],

            'starter_code' => [
                'nullable',
                'string',
            ],

            'solution_code' => [
                'nullable',
                'string',
            ],

            'expected_output' => [
                'nullable',
                'string',
            ],

            'settings' => [
                'nullable',
                'array',
            ],

            'source_type' => [
                'nullable',
                'string',
                'in:manual,ai',
            ],
        ];
    }
}