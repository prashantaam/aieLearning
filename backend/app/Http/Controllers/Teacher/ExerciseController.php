```php
<?php

namespace App\Http\Controllers\Teacher;

use App\Http\Controllers\Controller;
use App\Models\Exercise;
use App\Models\Sublesson;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ExerciseController extends Controller
{
    /*
    |--------------------------------------------------------------------------
    | List Exercises
    |--------------------------------------------------------------------------
    */

    public function index(
        Request $request,
        Sublesson $sublesson
    ): JsonResponse {
        $this->ensureTeacherOwnsSublesson(
            $request,
            $sublesson
        );

        $exercises = $sublesson
            ->exercises()
            ->orderBy('sort_order')
            ->get();

        return response()->json([
            'success' => true,

            'data' => $exercises
                ->map(
                    fn (Exercise $exercise) =>
                        $exercise->toResponseArray(
                            $sublesson
                        )
                )
                ->values(),
        ]);
    }

    /*
    |--------------------------------------------------------------------------
    | Create Exercise
    |--------------------------------------------------------------------------
    */

    public function store(
        Request $request,
        Sublesson $sublesson
    ): JsonResponse {
        $this->ensureTeacherOwnsSublesson(
            $request,
            $sublesson
        );

        $validated = $request->validate([
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
                'in:multiple_choice,fill_blank,short_answer,ordering,matching,code',
            ],

            'question' => [
                'nullable',
                'string',
            ],

            'starter_code' => [
                'nullable',
                'string',
            ],

            'solution' => [
                'nullable',
                'string',
            ],

            'test_cases' => [
                'nullable',
                'array',
            ],

            'hints' => [
                'nullable',
                'array',
            ],

            'settings' => [
                'nullable',
                'array',
            ],

            'sort_order' => [
                'nullable',
                'integer',
                'min:1',
            ],

            'status' => [
                'nullable',
                'string',
                'in:draft,published',
            ],
        ]);

        /*
         * Automatically put a new exercise at
         * the end if sort_order is not supplied.
         */
        if (!isset($validated['sort_order'])) {
            $validated['sort_order'] =
                ($sublesson->exercises()->max('sort_order') ?? 0)
                + 1;
        }

        $validated['status'] ??= 'draft';

        $exercise = $sublesson
            ->exercises()
            ->create($validated);

        return response()->json([
            'success' => true,
            'message' =>
                'Exercise created successfully.',

            'data' =>
                $exercise->toResponseArray(
                    $sublesson
                ),
        ], 201);
    }

    /*
    |--------------------------------------------------------------------------
    | Show Exercise
    |--------------------------------------------------------------------------
    */

    public function show(
        Request $request,
        Exercise $exercise
    ): JsonResponse {
        $exercise->load(
            'sublesson.lesson.course'
        );

        $this->ensureTeacherOwnsExercise(
            $request,
            $exercise
        );

        return response()->json([
            'success' => true,

            'data' =>
                $exercise->toResponseArray(
                    $exercise->sublesson
                ),
        ]);
    }

    /*
    |--------------------------------------------------------------------------
    | Update Exercise
    |--------------------------------------------------------------------------
    */

    public function update(
        Request $request,
        Exercise $exercise
    ): JsonResponse {
        $exercise->load(
            'sublesson.lesson.course'
        );

        $this->ensureTeacherOwnsExercise(
            $request,
            $exercise
        );

        $validated = $request->validate([
            'title' => [
                'sometimes',
                'required',
                'string',
                'max:255',
            ],

            'instructions' => [
                'nullable',
                'string',
            ],

            'exercise_type' => [
                'sometimes',
                'required',
                'string',
                'in:multiple_choice,fill_blank,short_answer,ordering,matching,code',
            ],

            'question' => [
                'nullable',
                'string',
            ],

            'starter_code' => [
                'nullable',
                'string',
            ],

            'solution' => [
                'nullable',
                'string',
            ],

            'test_cases' => [
                'nullable',
                'array',
            ],

            'hints' => [
                'nullable',
                'array',
            ],

            'settings' => [
                'nullable',
                'array',
            ],

            'sort_order' => [
                'nullable',
                'integer',
                'min:1',
            ],

            'status' => [
                'nullable',
                'string',
                'in:draft,published',
            ],
        ]);

        $exercise->update($validated);

        $exercise->refresh();

        return response()->json([
            'success' => true,

            'message' =>
                'Exercise updated successfully.',

            'data' =>
                $exercise->toResponseArray(
                    $exercise->sublesson
                ),
        ]);
    }

    /*
    |--------------------------------------------------------------------------
    | Delete Exercise
    |--------------------------------------------------------------------------
    */

    public function destroy(
        Request $request,
        Exercise $exercise
    ): JsonResponse {
        $exercise->load(
            'sublesson.lesson.course'
        );

        $this->ensureTeacherOwnsExercise(
            $request,
            $exercise
        );

        $exercise->delete();

        return response()->json([
            'success' => true,
            'message' =>
                'Exercise deleted successfully.',
        ]);
    }

    /*
    |--------------------------------------------------------------------------
    | Ownership Checks
    |--------------------------------------------------------------------------
    */

    private function ensureTeacherOwnsSublesson(
        Request $request,
        Sublesson $sublesson
    ): void {
        $sublesson->loadMissing(
            'lesson.course'
        );

        abort_unless(
            $sublesson->lesson
                && $sublesson->lesson->course
                && $sublesson->lesson->course->teacher_id
                    === $request->user()->id,
            403,
            'You are not authorised to manage this sublesson.'
        );
    }

    private function ensureTeacherOwnsExercise(
        Request $request,
        Exercise $exercise
    ): void {
        abort_unless(
            $exercise->sublesson
                && $exercise->sublesson->lesson
                && $exercise->sublesson->lesson->course
                && $exercise
                    ->sublesson
                    ->lesson
                    ->course
                    ->teacher_id
                    === $request->user()->id,
            403,
            'You are not authorised to manage this exercise.'
        );
    }
}
```
