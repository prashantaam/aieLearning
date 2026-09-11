<?php

namespace App\Http\Controllers\Teacher;

use App\Http\Controllers\Controller;
use App\Models\Lesson;
use App\Models\LessonContent;
use Illuminate\Http\Request;

class LessonContentController extends Controller
{
    /**
     * Create text content for a lesson.
     *
     * POST /api/lessons/{lesson}/contents
     */
    public function store(Request $request, Lesson $lesson)
    {
        $user = $request->user();

        /*
         * Load the course so we can check
         * whether this teacher owns the course.
         */
        $lesson->load('course');

        /*
         * Only teachers can create content.
         */
        if (($user->role ?? 'student') !== 'teacher') {
            return response()->json([
                'success' => false,
                'message' => 'Only teachers can create content.',
            ], 403);
        }

        /*
         * Teacher must own the Course
         * that this Lesson belongs to.
         */
        if ($lesson->course->teacher_id !== $user->id) {
            return response()->json([
                'success' => false,
                'message' => 'You are not authorized to add content to this lesson.',
            ], 403);
        }

        /*
         * Validate form data.
         */
        $validated = $request->validate([
          
            'content' => [
                'required',
                'string',
            ],

            'status' => [
                'nullable',
                'in:draft,published',
            ],
        ]);

        /*
         * Save LessonContent.
         */
        $content = LessonContent::create([
            'lesson_id' => $lesson->id,
            'created_by' => $user->id,
            'content' => $validated['content'],
            'source_type' => 'text',
            'status' => $validated['status'] ?? 'draft',
        ]);

        return response()->json([
            'success' => true,
            'message' => 'LessonContent created successfully.',
            'data' => $content,
        ], 201);
    }
}