<?php

namespace App\Http\Controllers\Teacher;

use App\Http\Controllers\Controller;
use App\Models\Lesson;
use App\Models\LessonContent;
use App\Models\Teacher;
use Illuminate\Http\Request;

class LessonContentController extends Controller
{
    /**
     * Create lesson content.
     */
    public function store(
        Request $request,
        Lesson $lesson
    ) {
        $teacher = $request->user();

        if (! $teacher instanceof Teacher) {
            return response()->json([
                'success' => false,
                'message' => 'Teacher access required.',
            ], 403);
        }

        $lesson->load('course');

        if (! $lesson->course) {
            return response()->json([
                'success' => false,
                'message' => 'Course not found for this lesson.',
            ], 404);
        }

        if (
            (int) $lesson->course->teacher_id !==
            (int) $teacher->id
        ) {
            return response()->json([
                'success' => false,
                'message' =>
                    'You are not authorized to add content to this lesson.',
            ], 403);
        }

        $validated = $request->validate([
            'content' => [
                'required',
                'string',
            ],
            'status' => [
                'nullable',
                'in:draft,published',
            ],
            'source_type' => [
                'nullable',
                'string',
                'max:50',
            ],
        ]);

        $content = LessonContent::create([
            'lesson_id' => $lesson->id,
            'created_by' => $teacher->id,
            'content' => $validated['content'],
            'source_type' =>
                $validated['source_type'] ?? 'text',
            'status' =>
                $validated['status'] ?? 'draft',
        ]);

        return response()->json([
            'success' => true,
            'message' =>
                'Lesson content created successfully.',
            'data' => $content,
        ], 201);
    }

    /**
     * Update lesson content.
     */
    public function update(
        Request $request,
        LessonContent $lessonContent
    ) {
        $teacher = $request->user();

        if (! $teacher instanceof Teacher) {
            return response()->json([
                'success' => false,
                'message' => 'Teacher access required.',
            ], 403);
        }

        $lessonContent->load('lesson.course');

        if (
            ! $lessonContent->lesson ||
            ! $lessonContent->lesson->course
        ) {
            return response()->json([
                'success' => false,
                'message' => 'Lesson or course not found.',
            ], 404);
        }

        if (
            (int) $lessonContent->lesson
                ->course->teacher_id !==
            (int) $teacher->id
        ) {
            return response()->json([
                'success' => false,
                'message' =>
                    'You are not authorized to edit this content.',
            ], 403);
        }

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

        $lessonContent->update([
            'content' => $validated['content'],
            'status' =>
                $validated['status'] ??
                $lessonContent->status,
        ]);

        return response()->json([
            'success' => true,
            'message' =>
                'Lesson content updated successfully.',
            'data' => $lessonContent,
        ]);
    }

    /**
     * Delete lesson content.
     */
    public function destroy(
        Request $request,
        LessonContent $lessonContent
    ) {
        $teacher = $request->user();

        if (! $teacher instanceof Teacher) {
            return response()->json([
                'success' => false,
                'message' => 'Teacher access required.',
            ], 403);
        }

        $lessonContent->load('lesson.course');

        if (
            ! $lessonContent->lesson ||
            ! $lessonContent->lesson->course
        ) {
            return response()->json([
                'success' => false,
                'message' => 'Lesson or course not found.',
            ], 404);
        }

        if (
            (int) $lessonContent->lesson
                ->course->teacher_id !==
            (int) $teacher->id
        ) {
            return response()->json([
                'success' => false,
                'message' =>
                    'You are not authorized to delete this content.',
            ], 403);
        }

        $lessonContent->delete();

        return response()->json([
            'success' => true,
            'message' =>
                'Lesson content deleted successfully.',
        ]);
    }
}