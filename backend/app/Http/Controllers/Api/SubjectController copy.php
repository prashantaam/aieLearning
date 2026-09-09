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
     * Teachers see only subjects they created.
     * Students can see all subjects.
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
            $subjects = Subject::with('teacher:id,username')
                ->withCount('chapters')
                ->latest()
                ->get();
        }

        return response()->json([
            'success' => true,
            'data' => $subjects,
        ]);
    }


    /**
     * Create a new subject.
     *
     * Only teachers should be able to create subjects.
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

        $subject = Subject::create([
            'title' => $validated['title'],
            'description' => $validated['description'] ?? null,
            'teacher_id' => $user->id,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Subject created successfully.',
            'data' => $subject->load('teacher:id,username'),
        ], 201);
    }


    /**
     * Show a single subject.
     */
    public function show(Request $request, Subject $subject)
    {
        $subject->load([
            'teacher:id,username',
            'chapters',
        ]);

        return response()->json([
            'success' => true,
            'data' => $subject,
        ]);
    }


    /**
     * Update a subject.
     *
     * Only the teacher who owns the subject can update it.
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

        $subject->update($validated);

        return response()->json([
            'success' => true,
            'message' => 'Subject updated successfully.',
            'data' => $subject->fresh()->load('teacher:id,username'),
        ]);
    }


    /**
     * Delete a subject.
     *
     * Only the teacher who owns the subject can delete it.
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
