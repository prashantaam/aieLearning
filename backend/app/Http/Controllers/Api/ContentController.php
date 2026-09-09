<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Chapter;
use App\Models\Content;
use Illuminate\Http\Request;

class ContentController extends Controller
{
    /**
     * Create text content for a chapter.
     *
     * POST /api/chapters/{chapter}/contents
     */
    public function store(Request $request, Chapter $chapter)
    {
        $user = $request->user();

        /*
         * Load the subject so we can check
         * whether this teacher owns the subject.
         */
        $chapter->load('subject');

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
         * Teacher must own the Subject
         * that this Chapter belongs to.
         */
        if ($chapter->subject->teacher_id !== $user->id) {
            return response()->json([
                'success' => false,
                'message' => 'You are not authorized to add content to this chapter.',
            ], 403);
        }

        /*
         * Validate form data.
         */
        $validated = $request->validate([
            'title' => [
                'required',
                'string',
                'max:255',
            ],

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
         * Save Content.
         */
        $content = Content::create([
            'chapter_id' => $chapter->id,
            'created_by' => $user->id,

            'title' => $validated['title'],

            'content' => $validated['content'],

            'source_type' => 'text',

            'status' => $validated['status'] ?? 'draft',
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Content created successfully.',
            'data' => $content,
        ], 201);
    }
}