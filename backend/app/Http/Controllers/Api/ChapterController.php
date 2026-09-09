<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Chapter;
use App\Models\Subject;
use Illuminate\Http\Request;

class ChapterController extends Controller
{
    public function index(Request $request, Subject $subject)
    {
        $user = $request->user();

        if (($user->role ?? 'student') === 'teacher') {
            if ($subject->teacher_id !== $user->id) {
                return response()->json([
                    'success' => false,
                    'message' => 'You are not authorized to view these chapters.',
                ], 403);
            }

            $chapters = $subject->chapters()
                ->orderBy('chapter_order')
                ->get();
        } else {
            if ($subject->status !== 'published') {
                return response()->json([
                    'success' => false,
                    'message' => 'Subject not available.',
                ], 404);
            }

            $chapters = $subject->chapters()
                ->where('status', 'published')
                ->orderBy('chapter_order')
                ->get();
        }

        return response()->json([
            'success' => true,
            'data' => $chapters,
        ]);
    }

    public function store(Request $request, Subject $subject)
    {
        $user = $request->user();

        if (
            ($user->role ?? 'student') !== 'teacher' ||
            $subject->teacher_id !== $user->id
        ) {
            return response()->json([
                'success' => false,
                'message' => 'You are not authorized to create chapters for this subject.',
            ], 403);
        }

        $validated = $request->validate([
            'title' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'chapter_order' => ['nullable', 'integer', 'min:1'],
            'status' => ['nullable', 'in:draft,published'],
        ]);

        $chapterOrder = $validated['chapter_order'] ?? (
            $subject->chapters()->max('chapter_order') + 1
        );

        $chapter = Chapter::create([
            'subject_id' => $subject->id,
            'title' => $validated['title'],
            'description' => $validated['description'] ?? null,
            'chapter_order' => $chapterOrder,
            'status' => $validated['status'] ?? 'draft',
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Chapter created successfully.',
            'data' => $chapter,
        ], 201);
    }

    public function show(Request $request, Chapter $chapter)
    {
        $user = $request->user();

        $chapter->load('subject');

        if (($user->role ?? 'student') === 'teacher') {
            if ($chapter->subject->teacher_id !== $user->id) {
                return response()->json([
                    'success' => false,
                    'message' => 'You are not authorized to view this chapter.',
                ], 403);
            }
        } else {
            if (
                $chapter->status !== 'published' ||
                $chapter->subject->status !== 'published'
            ) {
                return response()->json([
                    'success' => false,
                    'message' => 'Chapter not available.',
                ], 404);
            }
        }

        $chapter->load('contents');

        return response()->json([
            'success' => true,
            'data' => $chapter,
        ]);
    }

    public function update(Request $request, Chapter $chapter)
    {
        $user = $request->user();

        $chapter->load('subject');

        if (
            ($user->role ?? 'student') !== 'teacher' ||
            $chapter->subject->teacher_id !== $user->id
        ) {
            return response()->json([
                'success' => false,
                'message' => 'You are not authorized to update this chapter.',
            ], 403);
        }

        $validated = $request->validate([
            'title' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'chapter_order' => ['nullable', 'integer', 'min:1'],
            'status' => ['nullable', 'in:draft,published'],
        ]);

        $chapter->update([
            'title' => $validated['title'],
            'description' => $validated['description'] ?? null,
            'chapter_order' => $validated['chapter_order']
                ?? $chapter->chapter_order,
            'status' => $validated['status']
                ?? $chapter->status,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Chapter updated successfully.',
            'data' => $chapter->fresh(),
        ]);
    }

    public function destroy(Request $request, Chapter $chapter)
    {
        $user = $request->user();

        $chapter->load('subject');

        if (
            ($user->role ?? 'student') !== 'teacher' ||
            $chapter->subject->teacher_id !== $user->id
        ) {
            return response()->json([
                'success' => false,
                'message' => 'You are not authorized to delete this chapter.',
            ], 403);
        }

        $chapter->delete();

        return response()->json([
            'success' => true,
            'message' => 'Chapter deleted successfully.',
        ]);
    }
}