<?php

namespace App\Http\Controllers\Teacher;

use App\Http\Controllers\Controller;
use App\Models\Course;
use App\Models\Teacher;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class CourseController extends Controller
{
    /**
     * Get all courses belonging to the authenticated teacher.
     *
     * Includes both draft and published courses.
     */
    public function index(Request $request)
    {
        $teacher = $request->user();

        if (!$teacher instanceof Teacher) {
            return response()->json([
                'success' => false,
                'message' => 'Teacher access required.',
            ], 403);
        }

        $courses = Course::where('teacher_id', $teacher->id)
            ->withCount('lessons')
            ->latest()
            ->get();

        return response()->json([
            'success' => true,
            'data' => $courses,
        ]);
    }

    /**
     * Create a new course.
     *
     * Every new course is created as draft.
     */
    public function store(Request $request)
    {
           

        $teacher = $request->user();

        if (!$teacher instanceof Teacher) {
            return response()->json([
                'success' => false,
                'message' => 'Teacher access required.',
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

        $course = Course::create([
            'teacher_id' => $teacher->id,
            'title' => $validated['title'],
            'description' => $validated['description'] ?? null,

            // Important:
            // All newly created courses start as draft.
            'status' => 'draft',
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Course created successfully.',
            'data' => $course,
        ], 201);
    }

    /**
     * Show one course belonging to the authenticated teacher.
     */
    public function show(Request $request,Course $course): JsonResponse 
    {
        $teacher = $request->user();

        abort_unless(
            $teacher instanceof Teacher,
            403,
            'Teacher authentication required.'
        );

        abort_unless(
            (int) $course->teacher_id ===
                (int) $teacher->id,
            404,
            'Resource not found.'
        );

        $course->load([
            'lessons' => function ($query) {
                $query->with([
                    'sublessons' => function ($query) {
                        $query
                            ->orderBy('sort_order')
                            ->with([
                                'contents' => function ($query) {
                                    $query->orderBy(
                                        'sort_order'
                                    );
                                },
                                'quizzes' => function ($query) {
                                    $query->orderBy(
                                        'sort_order'
                                    );
                                },
                            ]);
                    },
                ]);
            },
        ]);

        return response()->json([
            'data' => $course,
        ]);
    }

    /**
     * Update a course.
     *
     * This does NOT change the publication status.
     * Publishing is handled separately.
     */
    public function update(Request $request, Course $course)
    {
        $teacher = $request->user();

        if (!$teacher instanceof Teacher) {
            return response()->json([
                'success' => false,
                'message' => 'Teacher access required.',
            ], 403);
        }

        if ($course->teacher_id !== $teacher->id) {
            return response()->json([
                'success' => false,
                'message' => 'You are not authorised to update this course.',
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

        $course->update([
            'title' => $validated['title'],
            'description' => $validated['description'] ?? null,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Course updated successfully.',
            'data' => $course->fresh(),
        ]);
    }

    /**
     * Publish a course.
     */
    public function publish(Request $request, Course $course)
    {
        $teacher = $request->user();

        if (!$teacher instanceof Teacher) {
            return response()->json([
                'success' => false,
                'message' => 'Teacher access required.',
            ], 403);
        }

        if ($course->teacher_id !== $teacher->id) {
            return response()->json([
                'success' => false,
                'message' => 'You are not authorised to publish this course.',
            ], 403);
        }

        /*
        |--------------------------------------------------------------------------
        | Basic publishing validation
        |--------------------------------------------------------------------------
        |
        | For now, require at least one lesson before publishing.
        |
        | Later we can make this stricter, for example:
        |
        | - course has at least one lesson
        | - all required lessons have content
        | - course title exists
        | - lesson ordering is valid
        |
        */

        if (!$course->lessons()->exists()) {
            return response()->json([
                'success' => false,
                'message' => 'Add at least one lesson before publishing this course.',
            ], 422);
        }

        $course->update([
            'status' => 'published',
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Course published successfully.',
            'data' => $course->fresh(),
        ]);
    }

    /**
     * Return a published course to draft status.
     */
    public function unpublish(Request $request, Course $course)
    {
        $teacher = $request->user();

        if (!$teacher instanceof Teacher) {
            return response()->json([
                'success' => false,
                'message' => 'Teacher access required.',
            ], 403);
        }

        if ($course->teacher_id !== $teacher->id) {
            return response()->json([
                'success' => false,
                'message' => 'You are not authorised to unpublish this course.',
            ], 403);
        }

        $course->update([
            'status' => 'draft',
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Course moved back to draft.',
            'data' => $course->fresh(),
        ]);
    }

    /**
     * Delete a course.
     */
    public function destroy(Request $request, Course $course)
    {
        $teacher = $request->user();

        if (!$teacher instanceof Teacher) {
            return response()->json([
                'success' => false,
                'message' => 'Teacher access required.',
            ], 403);
        }

        if ($course->teacher_id !== $teacher->id) {
            return response()->json([
                'success' => false,
                'message' => 'You are not authorised to delete this course.',
            ], 403);
        }

        $course->delete();

        return response()->json([
            'success' => true,
            'message' => 'Course deleted successfully.',
        ]);
    }
}