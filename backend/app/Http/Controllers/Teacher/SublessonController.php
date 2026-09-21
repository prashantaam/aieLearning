<?php

namespace App\Http\Controllers\Teacher;

use App\Http\Controllers\Controller;
use App\Models\Lesson;
use App\Models\Sublesson;
use App\Models\Teacher;
use Illuminate\Http\Request;

class SublessonController extends Controller
{
    /**
     * List all sublessons for a teacher-owned lesson.
     */
    public function index(Request $request, Lesson $lesson)
    {
        $teacher = $request->user();

        if (! $teacher instanceof Teacher) {
            return response()->json([
                'success' => false,
                'message' => 'Teacher access required.',
            ], 403);
        }

        $lesson->load('course');

        if (
            ! $lesson->course ||
            (int) $lesson->course->teacher_id !== (int) $teacher->id
        ) {
            return response()->json([
                'success' => false,
                'message' => 'You are not authorized to view these sublessons.',
            ], 403);
        }

        $sublessons = $lesson->sublessons()
            ->orderBy('sort_order')
            ->get();

        return response()->json([
            'success' => true,
            'data' => $sublessons,
        ]);
    }


    /**
     * Create a sublesson under a teacher-owned lesson.
     */
    public function store(Request $request, Lesson $lesson)
    {
        $teacher = $request->user();

        if (! $teacher instanceof Teacher) {
            return response()->json([
                'success' => false,
                'message' => 'Teacher access required.',
            ], 403);
        }

        $lesson->load('course');

        if (
            ! $lesson->course ||
            (int) $lesson->course->teacher_id !== (int) $teacher->id
        ) {
            return response()->json([
                'success' => false,
                'message' => 'You are not authorized to create sublessons for this lesson.',
            ], 403);
        }

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
            'sublesson_type' => [
                'nullable',
                'string',
                'in:content,interactive_demo,exercise,quiz,flashcard',
            ],
        ]);

        $maxSortOrder = $lesson->sublessons()
            ->max('sort_order');

        $nextSortOrder = ($maxSortOrder ?? 0) + 1;

        $sublesson = $lesson->sublessons()->create([
                'title' => $validated['title'],

                'description' =>
                    $validated['description'] ?? null,

                'sublesson_type' =>
                    $validated['sublesson_type'] ?? 'content',

                'sort_order' =>
                    $nextSortOrder,

                'status' => 'draft',
            ]);

        return response()->json([
            'success' => true,
            'message' => 'Sublesson created successfully.',
            'data' => $sublesson,
        ], 201);
    }


    /**
     * Show one sublesson.
     */
    public function show(Request $request, Sublesson $sublesson)
    {
        $teacher = $request->user();

        if (! $teacher instanceof Teacher) {
            return response()->json([
                'success' => false,
                'message' => 'Teacher access required.',
            ], 403);
        }

        $sublesson->load([
            'lesson.course',
        ]);

        if (! $this->teacherOwnsSublesson($teacher, $sublesson)) {
            return response()->json([
                'success' => false,
                'message' => 'You are not authorized to view this sublesson.',
            ], 403);
        }

        /*
         * For now we return the Sublesson itself.
         *
         * Later, as we fix each feature, this page can load:
         *
         * contents
         * exercises
         * quizzes
         * flashcards
         */
        return response()->json([
            'success' => true,
            'data' => $sublesson,
        ]);
    }


    /**
     * Update a sublesson.
     */
    public function update(Request $request, Sublesson $sublesson)
    {
        $teacher = $request->user();

        if (! $teacher instanceof Teacher) {
            return response()->json([
                'success' => false,
                'message' => 'Teacher access required.',
            ], 403);
        }

        $sublesson->load([
            'lesson.course',
        ]);

        if (! $this->teacherOwnsSublesson($teacher, $sublesson)) {
            return response()->json([
                'success' => false,
                'message' => 'You are not authorized to update this sublesson.',
            ], 403);
        }

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
             'sublesson_type' => [
                'required',
                'string',
                'in:content,interactive_demo,exercise,quiz,flashcard',
            ],
            'sort_order' => [
                'nullable',
                'integer',
                'min:1',
            ],
            'status' => [
                'nullable',
                'in:draft,published',
            ],
        ]);

        $sublesson->update([
            'title' => $validated['title'],
            'description' => $validated['description'] ?? null,
            'sublesson_type' => $validated['sublesson_type'],
            'sort_order' => $validated['sort_order']
                ?? $sublesson->sort_order,
            'status' => $validated['status']
                ?? $sublesson->status,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Sublesson updated successfully.',
            'data' => $sublesson->fresh(),
        ]);
    }


    /**
     * Delete a sublesson.
     */
    public function destroy(Request $request, Sublesson $sublesson)
    {
        $teacher = $request->user();

        if (! $teacher instanceof Teacher) {
            return response()->json([
                'success' => false,
                'message' => 'Teacher access required.',
            ], 403);
        }

        $sublesson->load([
            'lesson.course',
        ]);

        if (! $this->teacherOwnsSublesson($teacher, $sublesson)) {
            return response()->json([
                'success' => false,
                'message' => 'You are not authorized to delete this sublesson.',
            ], 403);
        }

        $sublesson->delete();

        return response()->json([
            'success' => true,
            'message' => 'Sublesson deleted successfully.',
        ]);
    }


    /**
     * Publish a sublesson.
     */
    public function publish(Request $request, Sublesson $sublesson)
    {
        $teacher = $request->user();

        if (! $teacher instanceof Teacher) {
            return response()->json([
                'success' => false,
                'message' => 'Teacher access required.',
            ], 403);
        }

        $sublesson->load([
            'lesson.course',
        ]);

        if (! $this->teacherOwnsSublesson($teacher, $sublesson)) {
            return response()->json([
                'success' => false,
                'message' => 'You are not authorized to publish this sublesson.',
            ], 403);
        }

        $sublesson->update([
            'status' => 'published',
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Sublesson published successfully.',
            'data' => $sublesson->fresh(),
        ]);
    }


    /**
     * Unpublish a sublesson.
     */
    public function unpublish(Request $request, Sublesson $sublesson)
    {
        $teacher = $request->user();

        if (! $teacher instanceof Teacher) {
            return response()->json([
                'success' => false,
                'message' => 'Teacher access required.',
            ], 403);
        }

        $sublesson->load([
            'lesson.course',
        ]);

        if (! $this->teacherOwnsSublesson($teacher, $sublesson)) {
            return response()->json([
                'success' => false,
                'message' => 'You are not authorized to unpublish this sublesson.',
            ], 403);
        }

        $sublesson->update([
            'status' => 'draft',
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Sublesson unpublished successfully.',
            'data' => $sublesson->fresh(),
        ]);
    }


    /**
     * Check whether a sublesson belongs to
     * the logged-in teacher.
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
}