<?php

namespace App\Http\Controllers\Teacher;

use App\Http\Controllers\Controller;
use App\Models\Sublesson;
use App\Models\SublessonContent;
use App\Models\Teacher;
use Illuminate\Http\Request;

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

        if (! $this->teacherOwnsSublesson($teacher, $sublesson)) {
            return response()->json([
                'success' => false,
                'message' => 'You are not authorized to view this content.',
            ], 403);
        }

        $contents = $sublesson->contents()
            ->orderBy('sort_order')
            ->get();

        return response()->json([
            'success' => true,
            'data' => $contents,
        ]);
    }


    /**
     * Create content for a sublesson.
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

        if (! $this->teacherOwnsSublesson($teacher, $sublesson)) {
            return response()->json([
                'success' => false,
                'message' => 'You are not authorized to add content to this sublesson.',
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

        $maxSortOrder = $sublesson->contents()
            ->max('sort_order');

        $nextSortOrder = ($maxSortOrder ?? 0) + 1;

        $content = $sublesson->contents()->create([
            'created_by' => $teacher->id,

            'type' => $validated['type']
                ?? 'text',

            'content' => $validated['content'],

            'settings' => $validated['settings']
                ?? null,

            'sort_order' => $nextSortOrder,

            'source_type' => $validated['source_type']
                ?? 'manual',

            'status' => $validated['status']
                ?? 'draft',
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Sublesson content created successfully.',
            'data' => $content,
        ], 201);
    }

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
    | Load ownership hierarchy
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
                'message' => 'You are not authorized to edit this content.',
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
            'type' => $validated['type']
                ?? $sublessonContent->type,

            'content' => $validated['content'],

            'settings' => array_key_exists(
                'settings',
                $validated
            )
                ? $validated['settings']
                : $sublessonContent->settings,

            'sort_order' => $validated['sort_order']
                ?? $sublessonContent->sort_order,

            'source_type' => $validated['source_type']
                ?? $sublessonContent->source_type,

            'status' => $validated['status']
                ?? $sublessonContent->status,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Sublesson content updated successfully.',
            'data' => $sublessonContent->fresh(),
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
                'message' => 'You are not authorized to delete this content.',
            ], 403);
        }

        $sublessonContent->delete();

        return response()->json([
            'success' => true,
            'message' => 'Sublesson content deleted successfully.',
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
            && (int) $sublesson->lesson->course->teacher_id
                === (int) $teacher->id;
    }


    /**
     * Check whether the teacher owns the content.
     */
    private function teacherOwnsContent(
        Teacher $teacher,
        SublessonContent $sublessonContent
    ): bool {
        return $sublessonContent->sublesson
            && $sublessonContent->sublesson->lesson
            && $sublessonContent->sublesson->lesson->course
            && (int) $sublessonContent
                ->sublesson
                ->lesson
                ->course
                ->teacher_id === (int) $teacher->id;
    }
}