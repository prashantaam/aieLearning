<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Subject;
use Illuminate\Http\Request;

class SubjectController extends Controller
{
    /**
     * Get subjects.
     *
     * Teacher:
     * - sees all of their own subjects
     * - draft + published
     *
     * Student:
     * - sees published subjects only
     */
    public function index(Request $request)
    {
        $user = $request->user();

        if (($user->role ?? 'student') === 'teacher') {
            $subjects = Subject::where('teacher_id', $user->id)
                ->with('teacher:id,username')
                ->withCount('chapters')
                ->latest()
                ->get();
        } else {
            $subjects = Subject::where('status', 'published')
                ->with('teacher:id,username')
                ->withCount([
                    'chapters' => function ($query) {
                        $query->where('status', 'published');
                    }
                ])
                ->latest()
                ->get();
        }

        return response()->json([
            'success' => true,
            'data' => $subjects,
        ]);
    }

    /**
     * Create subject.
     *
     * Teacher only.
     */
    public function store(Request $request)
    {
        $user = $request->user();

        if (($user->role ?? 'student') !== 'teacher') {
            return response()->json([
                'success' => false,
                'message' => 'Only teachers can create subjects.',
            ], 403);
        }

        $validated = $request->validate([
            'title' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'status' => ['nullable', 'in:draft,published'],
        ]);

        $subject = Subject::create([
            'teacher_id' => $user->id,
            'title' => $validated['title'],
            'description' => $validated['description'] ?? null,
            'status' => $validated['status'] ?? 'draft',
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Subject created successfully.',
            'data' => $subject->load('teacher:id,username'),
        ], 201);
    }

    /**
     * Show one subject.
     */
    public function show(Request $request, Subject $subject)
    {
        $user = $request->user();

        /*
         * Teacher can see their own draft/published subjects.
         *
         * Student can only see published subjects.
         */
        if (($user->role ?? 'student') === 'teacher') {
            if ($subject->teacher_id !== $user->id) {
                return response()->json([
                    'success' => false,
                    'message' => 'You are not authorized to view this subject.',
                ], 403);
            }
        } else {
            if ($subject->status !== 'published') {
                return response()->json([
                    'success' => false,
                    'message' => 'Subject not available.',
                ], 404);
            }
        }

        /*
         * Students should only see published chapters.
         */
        if (($user->role ?? 'student') === 'teacher') {
            $subject->load([
                'teacher:id,username',
                'chapters' => function ($query) {
                    $query->orderBy('chapter_order');
                },
            ]);
        } else {
            $subject->load([
                'teacher:id,username',
                'chapters' => function ($query) {
                    $query
                        ->where('status', 'published')
                        ->orderBy('chapter_order');
                },
            ]);
        }

        return response()->json([
            'success' => true,
            'data' => $subject,
        ]);
    }

    /**
     * Update subject.
     *
     * Teacher owner only.
     */
    public function update(Request $request, Subject $subject)
    {
        $user = $request->user();

        if (
            ($user->role ?? 'student') !== 'teacher' ||
            $subject->teacher_id !== $user->id
        ) {
            return response()->json([
                'success' => false,
                'message' => 'You are not authorized to update this subject.',
            ], 403);
        }

        $validated = $request->validate([
            'title' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'status' => ['nullable', 'in:draft,published'],
        ]);

        $subject->update([
            'title' => $validated['title'],
            'description' => $validated['description'] ?? null,
            'status' => $validated['status'] ?? $subject->status,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Subject updated successfully.',
            'data' => $subject
                ->fresh()
                ->load('teacher:id,username'),
        ]);
    }

    /**
     * Delete subject.
     *
     * Teacher owner only.
     */
    public function destroy(Request $request, Subject $subject)
    {
        $user = $request->user();

        if (
            ($user->role ?? 'student') !== 'teacher' ||
            $subject->teacher_id !== $user->id
        ) {
            return response()->json([
                'success' => false,
                'message' => 'You are not authorized to delete this subject.',
            ], 403);
        }

        $subject->delete();

        return response()->json([
            'success' => true,
            'message' => 'Subject deleted successfully.',
        ]);
    }
}