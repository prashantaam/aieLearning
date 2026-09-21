<?php

namespace App\Http\Controllers\Teacher;

use App\Http\Controllers\Controller;
use App\Models\Lesson;
use App\Models\Sublesson;
use App\Models\SublessonContent;
use App\Models\Teacher;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class SublessonContentController extends Controller
{
    /**
     * List content for a sublesson.
     */
    public function index(
        Request $request,
        Sublesson $sublesson
    ) {
        $teacher = $request->user();

        if (! $teacher instanceof Teacher) {
            return response()->json([
                'success' => false,
                'message' => 'Teacher access required.',
            ], 403);
        }

        $sublesson->load('lesson.course');

        if (! $this->teacherOwnsSublesson(
            $teacher,
            $sublesson
        )) {
            return response()->json([
                'success' => false,
                'message' =>
                    'You are not authorized to view this content.',
            ], 403);
        }

        $contents = $sublesson
            ->contents()
            ->orderBy('sort_order')
            ->get();

        return response()->json([
            'success' => true,
            'data' => $contents,
        ]);
    }

    /**
     * Create a new Content sublesson
     * and its SublessonContent record
     * in one transaction.
     *
     * Used by:
     *
     * POST /api/teacher/lessons/{lesson}/content
     */
    public function storeForLesson(
        Request $request,
        Lesson $lesson
    ) {
        $teacher = $request->user();

        /*
        |--------------------------------------------------------------------------
        | Teacher Check
        |--------------------------------------------------------------------------
        */

        if (! $teacher instanceof Teacher) {
            return response()->json([
                'success' => false,
                'message' => 'Teacher access required.',
            ], 403);
        }

        /*
        |--------------------------------------------------------------------------
        | Ownership Check
        |--------------------------------------------------------------------------
        */

        $lesson->load('course');

        if (
            ! $lesson->course ||
            (int) $lesson->course->teacher_id !==
                (int) $teacher->id
        ) {
            return response()->json([
                'success' => false,
                'message' =>
                    'You are not authorized to add content to this lesson.',
            ], 403);
        }

        /*
        |--------------------------------------------------------------------------
        | Validate Request
        |--------------------------------------------------------------------------
        */

        $validated = $request->validate([
            'title' => [
                'required',
                'string',
                'max:255',
            ],

            'description' => [
                'nullable',
                'string',
            ],

            'content' => [
                'required',
                'string',
            ],

            'type' => [
                'nullable',
                'string',
                'max:50',
            ],

            'settings' => [
                'nullable',
                'array',
            ],

            'source_type' => [
                'nullable',
                'string',
                'max:50',
            ],
        ]);

        /*
        |--------------------------------------------------------------------------
        | Create Sublesson + Content
        |--------------------------------------------------------------------------
        */

        $result = DB::transaction(
            function () use (
                $validated,
                $lesson,
                $teacher
            ) {
                /*
                |--------------------------------------------------------------------------
                | Determine Next Sublesson Sort Order
                |--------------------------------------------------------------------------
                */

                $maxSortOrder = $lesson
                    ->sublessons()
                    ->max('sort_order');

                $nextSortOrder =
                    ($maxSortOrder ?? 0) + 1;

                /*
                |--------------------------------------------------------------------------
                | Create Sublesson
                |--------------------------------------------------------------------------
                */

                $sublesson = $lesson
                    ->sublessons()
                    ->create([
                        'title' =>
                            $validated['title'],

                        'description' =>
                            $validated['description']
                                ?? null,

                        'sublesson_type' =>
                            'content',

                        'sort_order' =>
                            $nextSortOrder,

                        'status' =>
                            'draft',
                    ]);

                /*
                |--------------------------------------------------------------------------
                | Create Sublesson Content
                |--------------------------------------------------------------------------
                */

                $content = $sublesson
                    ->contents()
                    ->create([
                        'created_by' =>
                            $teacher->id,

                        'type' =>
                            $validated['type']
                                ?? 'markdown',

                        'content' =>
                            $validated['content'],

                        'settings' =>
                            $validated['settings']
                                ?? null,

                        'sort_order' =>
                            1,

                        'source_type' =>
                            $validated['source_type']
                                ?? 'manual',

                        'status' =>
                            'draft',
                    ]);

                return [
                    'sublesson' =>
                        $sublesson,

                    'content' =>
                        $content,
                ];
            }
        );

        /*
        |--------------------------------------------------------------------------
        | Response
        |--------------------------------------------------------------------------
        */

        return response()->json([
            'success' => true,

            'message' =>
                'Content sublesson created successfully.',

            'data' => [
                'sublesson' =>
                    $result['sublesson'],

                'content' =>
                    $result['content'],
            ],
        ], 201);
    }

    /**
     * Create content for an existing sublesson.
     *
     * Kept for the existing application flow.
     */
    public function store(
        Request $request,
        Sublesson $sublesson
    ) {
        $teacher = $request->user();

        if (! $teacher instanceof Teacher) {
            return response()->json([
                'success' => false,
                'message' => 'Teacher access required.',
            ], 403);
        }

        $sublesson->load('lesson.course');

        if (! $this->teacherOwnsSublesson(
            $teacher,
            $sublesson
        )) {
            return response()->json([
                'success' => false,
                'message' =>
                    'You are not authorized to add content to this sublesson.',
            ], 403);
        }

        $validated = $request->validate([
            'type' => [
                'nullable',
                'string',
                'max:50',
            ],

            'content' => [
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
                'max:50',
            ],

            'status' => [
                'nullable',
                'in:draft,published',
            ],
        ]);

        $maxSortOrder = $sublesson
            ->contents()
            ->max('sort_order');

        $nextSortOrder =
            ($maxSortOrder ?? 0) + 1;

        $content = $sublesson
            ->contents()
            ->create([
                'created_by' =>
                    $teacher->id,

                'type' =>
                    $validated['type']
                        ?? 'text',

                'content' =>
                    $validated['content'],

                'settings' =>
                    $validated['settings']
                        ?? null,

                'sort_order' =>
                    $nextSortOrder,

                'source_type' =>
                    $validated['source_type']
                        ?? 'manual',

                'status' =>
                    $validated['status']
                        ?? 'draft',
            ]);

        return response()->json([
            'success' => true,
            'message' =>
                'Sublesson content created successfully.',
            'data' => $content,
        ], 201);
    }

    /**
     * Show a single sublesson content record.
     */
    public function show(
        Request $request,
        SublessonContent $sublessonContent
    ) {
        $teacher = $request->user();

        if (! $teacher instanceof Teacher) {
            return response()->json([
                'success' => false,
                'message' => 'Teacher access required.',
            ], 403);
        }

        /*
        |--------------------------------------------------------------------------
        | Load Ownership Hierarchy
        |--------------------------------------------------------------------------
        |
        | Content
        |   → Sublesson
        |       → Lesson
        |           → Course
        |               → Teacher
        |
        */

        $sublessonContent->load(
            'sublesson.lesson.course'
        );

        if (! $this->teacherOwnsContent(
            $teacher,
            $sublessonContent
        )) {
            return response()->json([
                'success' => false,
                'message' =>
                    'You are not authorized to view this content.',
            ], 403);
        }

        return response()->json([
            'success' => true,
            'data' => $sublessonContent,
        ]);
    }

    /**
     * Update sublesson content.
     */
    public function update(
        Request $request,
        SublessonContent $sublessonContent
    ) {
        $teacher = $request->user();

        if (! $teacher instanceof Teacher) {
            return response()->json([
                'success' => false,
                'message' => 'Teacher access required.',
            ], 403);
        }

        $sublessonContent->load(
            'sublesson.lesson.course'
        );

        if (! $this->teacherOwnsContent(
            $teacher,
            $sublessonContent
        )) {
            return response()->json([
                'success' => false,
                'message' =>
                    'You are not authorized to edit this content.',
            ], 403);
        }

        $validated = $request->validate([
            'type' => [
                'nullable',
                'string',
                'max:50',
            ],

            'content' => [
                'required',
                'string',
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

            'source_type' => [
                'nullable',
                'string',
                'max:50',
            ],

            'status' => [
                'nullable',
                'in:draft,published',
            ],
        ]);

        $sublessonContent->update([
            'type' =>
                $validated['type']
                    ?? $sublessonContent->type,

            'content' =>
                $validated['content'],

            'settings' =>
                array_key_exists(
                    'settings',
                    $validated
                )
                    ? $validated['settings']
                    : $sublessonContent->settings,

            'sort_order' =>
                $validated['sort_order']
                    ?? $sublessonContent->sort_order,

            'source_type' =>
                $validated['source_type']
                    ?? $sublessonContent->source_type,

            'status' =>
                $validated['status']
                    ?? $sublessonContent->status,
        ]);

        return response()->json([
            'success' => true,
            'message' =>
                'Sublesson content updated successfully.',
            'data' =>
                $sublessonContent->fresh(),
        ]);
    }

    /**
     * Delete sublesson content.
     */
    public function destroy(
        Request $request,
        SublessonContent $sublessonContent
    ) {
        $teacher = $request->user();

        if (! $teacher instanceof Teacher) {
            return response()->json([
                'success' => false,
                'message' => 'Teacher access required.',
            ], 403);
        }

        $sublessonContent->load(
            'sublesson.lesson.course'
        );

        if (! $this->teacherOwnsContent(
            $teacher,
            $sublessonContent
        )) {
            return response()->json([
                'success' => false,
                'message' =>
                    'You are not authorized to delete this content.',
            ], 403);
        }

        $sublessonContent->delete();

        return response()->json([
            'success' => true,
            'message' =>
                'Sublesson content deleted successfully.',
        ]);
    }

    /**
     * Check whether the teacher owns the sublesson.
     */
    private function teacherOwnsSublesson(
        Teacher $teacher,
        Sublesson $sublesson
    ): bool {
        return $sublesson->lesson
            && $sublesson->lesson->course
            && (int) $sublesson
                ->lesson
                ->course
                ->teacher_id ===
                (int) $teacher->id;
    }

    /**
     * Check whether the teacher owns the content.
     */
    private function teacherOwnsContent(
        Teacher $teacher,
        SublessonContent $sublessonContent
    ): bool {
        return $sublessonContent->sublesson
            && $sublessonContent
                ->sublesson
                ->lesson
            && $sublessonContent
                ->sublesson
                ->lesson
                ->course
            && (int) $sublessonContent
                ->sublesson
                ->lesson
                ->course
                ->teacher_id ===
                (int) $teacher->id;
    }
}