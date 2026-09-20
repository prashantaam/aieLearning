<?php

namespace App\Http\Controllers\Teacher;

use App\Http\Controllers\Controller;
use App\Models\InteractiveDemo;
use App\Models\Sublesson;
use App\Models\Teacher;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class InteractiveDemoController extends Controller
{
    /**
     * List all interactive demos for a sublesson.
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

        $demos = InteractiveDemo::query()
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

                'demos' => $demos,
            ],
        ]);
    }

    /**
     * Create an interactive demo.
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
            $this->demoValidationRules()
        );

        /*
        |--------------------------------------------------------------------------
        | Calculate Sort Order
        |--------------------------------------------------------------------------
        */

        $maxSortOrder = InteractiveDemo::query()
            ->where(
                'sublesson_id',
                $sublesson->id
            )
            ->max('sort_order');

        $nextSortOrder =
            ($maxSortOrder ?? 0) + 1;

        /*
        |--------------------------------------------------------------------------
        | Create Demo
        |--------------------------------------------------------------------------
        */
        $demo = InteractiveDemo::create([
            'sublesson_id' =>
                $sublesson->id,

            'created_by' =>
                $teacher->id,

            'title' =>
                $validated['title'],

            'instruction' =>
                $validated['instruction'],

            'code' =>
                $validated['code'],

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

        $demo->load('sublesson');

        return response()->json([
            'success' => true,

            'message' =>
                'Interactive demo created successfully.',

            'data' => [
                'demo' => $demo,
            ],
        ], 201);
    }

    /**
     * Show a single interactive demo.
     */
    public function show(
        Request $request,
        Sublesson $sublesson,
        InteractiveDemo $demo
    ): JsonResponse {
        $teacher = $this->getTeacher($request);

        $this->ensureTeacherOwnsSublesson(
            $teacher,
            $sublesson
        );

        $this->ensureDemoBelongsToSublesson(
            $demo,
            $sublesson
        );

        return response()->json([
            'success' => true,

            'data' => [
                'demo' => $demo,
            ],
        ]);
    }

    /**
     * Update an interactive demo.
     */
    public function update(
        Request $request,
        Sublesson $sublesson,
        InteractiveDemo $demo
    ): JsonResponse {
        $teacher = $this->getTeacher($request);

        $this->ensureTeacherOwnsSublesson(
            $teacher,
            $sublesson
        );

        $this->ensureDemoBelongsToSublesson(
            $demo,
            $sublesson
        );

        $validated = $request->validate(
            $this->demoValidationRules()
        );

        $demo->update([
            'title' =>
                $validated['title'],

            'instruction' =>
                $validated['instruction'],

            'code' =>
                $validated['code'],

            'settings' =>
                $validated['settings']
                    ?? null,

            'source_type' =>
                $validated['source_type']
                    ?? $demo->source_type,
        ]);

        $demo->refresh();

        return response()->json([
            'success' => true,

            'message' =>
                'Interactive demo updated successfully.',

            'data' => [
                'demo' => $demo,
            ],
        ]);
    }

    /**
     * Delete an interactive demo.
     */
    public function destroy(
        Request $request,
        Sublesson $sublesson,
        InteractiveDemo $demo
    ): JsonResponse {
        $teacher = $this->getTeacher($request);

        $this->ensureTeacherOwnsSublesson(
            $teacher,
            $sublesson
        );

        $this->ensureDemoBelongsToSublesson(
            $demo,
            $sublesson
        );

        $demoId = $demo->id;

        $demo->delete();

        return response()->json([
            'success' => true,

            'message' =>
                'Interactive demo deleted successfully.',

            'data' => [
                'demoId' => $demoId,
                'sublessonId' => $sublesson->id,
            ],
        ]);
    }

    /**
     * Publish an interactive demo.
     */
    public function publish(
        Request $request,
        Sublesson $sublesson,
        InteractiveDemo $demo
    ): JsonResponse {
        $teacher = $this->getTeacher($request);

        $this->ensureTeacherOwnsSublesson(
            $teacher,
            $sublesson
        );

        $this->ensureDemoBelongsToSublesson(
            $demo,
            $sublesson
        );

        $demo->update([
            'status' => 'published',
        ]);

        $demo->refresh();

        return response()->json([
            'success' => true,

            'message' =>
                'Interactive demo published successfully.',

            'data' => [
                'demo' => $demo,
            ],
        ]);
    }

    /**
     * Move an interactive demo back to draft.
     */
    public function unpublish(
        Request $request,
        Sublesson $sublesson,
        InteractiveDemo $demo
    ): JsonResponse {
        $teacher = $this->getTeacher($request);

        $this->ensureTeacherOwnsSublesson(
            $teacher,
            $sublesson
        );

        $this->ensureDemoBelongsToSublesson(
            $demo,
            $sublesson
        );

        $demo->update([
            'status' => 'draft',
        ]);

        $demo->refresh();

        return response()->json([
            'success' => true,

            'message' =>
                'Interactive demo moved back to draft.',

            'data' => [
                'demo' => $demo,
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
     * Check demo belongs to sublesson.
     */
    private function ensureDemoBelongsToSublesson(
        InteractiveDemo $demo,
        Sublesson $sublesson
    ): void {
        abort_unless(
            (int) $demo->sublesson_id
                === (int) $sublesson->id,
            404,
            'Interactive demo not found for this sublesson.'
        );
    }

    /**
     * Shared validation rules.
     */
    private function demoValidationRules(): array
    {
        return [
            'title' => [
                'required',
                'string',
                'max:255',
            ],

            'instruction' => [
                'required',
                'string',
            ],

            'code' => [
                'required',
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