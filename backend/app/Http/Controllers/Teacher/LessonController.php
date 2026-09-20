<?php

namespace App\Http\Controllers\Teacher;

use App\Http\Controllers\Controller;
use App\Models\Course;
use App\Models\Lesson;
use App\Models\Teacher;
use Illuminate\Http\Request;

class LessonController extends Controller
{
    /**
     * List lessons for a teacher-owned course.
     */
    public function index(Request $request, Course $course)
    {
        $teacher = $request->user();

        if (! $teacher instanceof Teacher) {
            return response()->json([
                'success' => false,
                'message' => 'Teacher access required.',
            ], 403);
        }

        if ((int) $course->teacher_id !== (int) $teacher->id) {
            return response()->json([
                'success' => false,
                'message' => 'You are not authorized to view these lessons.',
            ], 403);
        }

        $lessons = $course->lessons()
            ->latest()
            ->get();

        return response()->json([
            'success' => true,
            'data' => $lessons,
        ]);
    }

    /**
     * Create a lesson for a teacher-owned course.
     */
    public function store(Request $request, Course $course)
    {
        $teacher = $request->user();


        if (! $teacher instanceof Teacher) {
            return response()->json([
                'success' => false,
                'message' => 'Teacher access required.',
            ], 403);
        }

        if ((int) $course->teacher_id !== (int) $teacher->id) {
            return response()->json([
                'success' => false,
                'message' => 'You are not authorized to create lessons for this course.',
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
        ]);

        $lesson = $course->lessons()->create([
            'title' => $validated['title'],
            'description' => $validated['description'] ?? null,
            'status' => 'draft',
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Lesson created successfully.',
            'data' => $lesson,
        ], 201);
    }

    /**
     * Show one lesson.
     */
    public function show(Request $request, Lesson $lesson)
    {
        $teacher = $request->user();

        if (! $teacher instanceof Teacher) {
            return response()->json([
                'success' => false,
                'message' => 'Teacher access required.',
            ], 403);
        }

        /*
        * Load the course first so we can verify
        * that this lesson belongs to the teacher.
        */
        $lesson->load('course');

        if (
            ! $lesson->course ||
            (int) $lesson->course->teacher_id !== (int) $teacher->id
        ) {
            return response()->json([
                'success' => false,
                'message' => 'You are not authorized to view this lesson.',
            ], 403);
        }

        /*
        * A Lesson now contains Sublessons.
        *
        * Content, quizzes, flashcards and exercises
        * belong to a Sublesson, not directly to Lesson.
        */
        $lesson->load([
            'sublessons',
        ]);

        return response()->json([
            'success' => true,
            'data' => $lesson,
        ]);
    }

    /**
     * Update a lesson.
     */
    public function update(Request $request, Lesson $lesson)
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
                'message' => 'You are not authorized to update this lesson.',
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

            'status' => [
                'nullable',
                'in:draft,published',
            ],
        ]);

        $lesson->update([
            'title' => $validated['title'],
            'description' => $validated['description'] ?? null,
            'status' => $validated['status'] ?? $lesson->status,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Lesson updated successfully.',
            'data' => $lesson->fresh(),
        ]);
    }

    /**
     * Delete a lesson.
     */
    public function destroy(Request $request, Lesson $lesson)
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
                'message' => 'You are not authorized to delete this lesson.',
            ], 403);
        }

        $lesson->delete();

        return response()->json([
            'success' => true,
            'message' => 'Lesson deleted successfully.',
        ]);
    }

    /**
 * Publish a lesson.
 */
    public function publish(Request $request, Lesson $lesson)
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
                'message' => 'You are not authorized to publish this lesson.',
            ], 403);
        }

        $lesson->update([
            'status' => 'published',
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Lesson published successfully.',
            'data' => $lesson->fresh(),
        ]);
    }

    /**
     * Move a lesson back to draft.
     */
    public function unpublish(Request $request, Lesson $lesson)
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
                'message' => 'You are not authorized to unpublish this lesson.',
            ], 403);
        }

        $lesson->update([
            'status' => 'draft',
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Lesson moved back to draft.',
            'data' => $lesson->fresh(),
        ]);
    }
}