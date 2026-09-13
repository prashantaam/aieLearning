<?php

namespace App\Http\Controllers\Teacher;

use App\Http\Controllers\Controller;
use App\Models\Flashcard;
use App\Models\Lesson;
use App\Models\Teacher;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class FlashcardController extends Controller
{
    /**
     * List all flashcard sets for a lesson.
     */
    public function index(Request $request, Lesson $lesson)
    {
        $teacher = $request->user();

        if (! $teacher instanceof Teacher) {
            return response()->json([
                'message' => 'Teacher access required.',
            ], 403);
        }

        $lesson->load('course');

        if (! $lesson->course) {
            return response()->json([
                'message' => 'Course not found for this lesson.',
            ], 404);
        }

        if (
            (int) $lesson->course->teacher_id !==
            (int) $teacher->id
        ) {
            return response()->json([
                'message' => 'You are not authorised to view flashcards for this lesson.',
            ], 403);
        }

        $flashcards = Flashcard::where(
            'lesson_id',
            $lesson->id
        )
            ->latest()
            ->get();

        return response()->json([
            'success' => true,
            'data' => [
                'lesson' => [
                    'id' => $lesson->id,
                    'title' => $lesson->title,
                ],

                'flashcards' => $flashcards
                    ->map(
                        fn ($flashcard) =>
                            $this->toResponseArray($flashcard)
                    )
                    ->values(),
            ],
        ]);
    }

    /**
     * View a single flashcard set.
     */
    public function show(
        Request $request,
        Flashcard $flashcard
    ) {
        $teacher = $request->user();

        if (! $teacher instanceof Teacher) {
            return response()->json([
                'message' => 'Teacher access required.',
            ], 403);
        }

        if (! $this->teacherOwnsFlashcard(
            $teacher,
            $flashcard
        )) {
            return response()->json([
                'message' => 'You are not authorised to view this flashcard set.',
            ], 403);
        }

        $flashcard->load('lesson');

        return response()->json([
            'success' => true,
            'data' => [
                'flashcard' =>
                    $this->toResponseArray(
                        $flashcard
                    ),
            ],
        ]);
    }

    /**
     * Create/save flashcards for a lesson.
     */
    public function store(
        Request $request,
        Lesson $lesson
    ) {
        $teacher = $request->user();

        if (! $teacher instanceof Teacher) {
            return response()->json([
                'message' => 'Teacher access required.',
            ], 403);
        }

        $lesson->load('course');

        if (! $lesson->course) {
            return response()->json([
                'message' => 'Course not found for this lesson.',
            ], 404);
        }

        if (
            (int) $lesson->course->teacher_id !==
            (int) $teacher->id
        ) {
            return response()->json([
                'message' => 'You are not authorised to create flashcards for this lesson.',
            ], 403);
        }

        $validated = $request->validate(
            $this->validationRules()
        );

        $cards = $this->buildCards(
            $validated['cards']
        );

        $flashcard = Flashcard::create([
            'lesson_id' => $lesson->id,
            'cards' => $cards,
            'source_type' =>
                $validated['source_type'] ?? 'ai',
            'status' => 'draft',
        ]);

        $flashcard->load('lesson');

        return response()->json([
            'success' => true,
            'message' => 'Flashcards saved successfully.',
            'data' => [
                'flashcard' =>
                    $this->toResponseArray(
                        $flashcard
                    ),
            ],
        ], 201);
    }

    /**
     * Update a flashcard set.
     */
    public function update(
        Request $request,
        Flashcard $flashcard
    ) {
        $teacher = $request->user();

        if (! $teacher instanceof Teacher) {
            return response()->json([
                'message' => 'Teacher access required.',
            ], 403);
        }

        if (! $this->teacherOwnsFlashcard(
            $teacher,
            $flashcard
        )) {
            return response()->json([
                'message' => 'You are not authorised to update this flashcard set.',
            ], 403);
        }

        $validated = $request->validate(
            $this->validationRules()
        );

        $cards = $this->buildCards(
            $validated['cards']
        );

        $flashcard->update([
            'cards' => $cards,
        ]);

        $flashcard->load('lesson');

        return response()->json([
            'success' => true,
            'message' => 'Flashcards updated successfully.',
            'data' => [
                'flashcard' =>
                    $this->toResponseArray(
                        $flashcard
                    ),
            ],
        ]);
    }

    /**
     * Delete a flashcard set.
     */
    public function destroy(
        Request $request,
        Flashcard $flashcard
    ) {
        $teacher = $request->user();

        if (! $teacher instanceof Teacher) {
            return response()->json([
                'message' => 'Teacher access required.',
            ], 403);
        }

        if (! $this->teacherOwnsFlashcard(
            $teacher,
            $flashcard
        )) {
            return response()->json([
                'message' => 'You are not authorised to delete this flashcard set.',
            ], 403);
        }

        $lessonId = $flashcard->lesson_id;

        $flashcard->delete();

        return response()->json([
            'success' => true,
            'message' => 'Flashcard set deleted successfully.',
            'data' => [
                'lessonId' => $lessonId,
            ],
        ]);
    }

    /**
     * Publish flashcards.
     */
    public function publish(
        Request $request,
        Flashcard $flashcard
    ) {
        $teacher = $request->user();

        if (! $teacher instanceof Teacher) {
            return response()->json([
                'message' => 'Teacher access required.',
            ], 403);
        }

        if (! $this->teacherOwnsFlashcard(
            $teacher,
            $flashcard
        )) {
            return response()->json([
                'message' => 'You are not authorised to publish this flashcard set.',
            ], 403);
        }

        $cards = $flashcard->cards ?? [];

        if (count($cards) === 0) {
            return response()->json([
                'message' => 'A flashcard set must contain at least one card before publishing.',
            ], 422);
        }

        $flashcard->update([
            'status' => 'published',
        ]);

        $flashcard->load('lesson');

        return response()->json([
            'success' => true,
            'message' => 'Flashcards published successfully.',
            'data' => [
                'flashcard' =>
                    $this->toResponseArray(
                        $flashcard
                    ),
            ],
        ]);
    }

    /**
     * Move flashcards back to draft.
     */
    public function unpublish(
        Request $request,
        Flashcard $flashcard
    ) {
        $teacher = $request->user();

        if (! $teacher instanceof Teacher) {
            return response()->json([
                'message' => 'Teacher access required.',
            ], 403);
        }

        if (! $this->teacherOwnsFlashcard(
            $teacher,
            $flashcard
        )) {
            return response()->json([
                'message' => 'You are not authorised to unpublish this flashcard set.',
            ], 403);
        }

        $flashcard->update([
            'status' => 'draft',
        ]);

        $flashcard->load('lesson');

        return response()->json([
            'success' => true,
            'message' => 'Flashcards moved back to draft.',
            'data' => [
                'flashcard' =>
                    $this->toResponseArray(
                        $flashcard
                    ),
            ],
        ]);
    }

    /**
     * Check whether teacher owns the course
     * containing this flashcard set.
     */
    private function teacherOwnsFlashcard(
        Teacher $teacher,
        Flashcard $flashcard
    ): bool {
        $flashcard->loadMissing('lesson.course');

        if (
            ! $flashcard->lesson ||
            ! $flashcard->lesson->course
        ) {
            return false;
        }

        return
            (int) $flashcard->lesson
                ->course
                ->teacher_id ===
            (int) $teacher->id;
    }

    /**
     * Build a clean flashcard structure.
     */
    private function buildCards(
        array $rawCards
    ): array {
        return array_map(
            function (array $card) {
                return [
                    'id' =>
                        $card['id'] ??
                        (string) Str::uuid(),

                    'front' =>
                        trim(
                            $card['front'] ?? ''
                        ),

                    'back' =>
                        trim(
                            $card['back'] ?? ''
                        ),
                ];
            },
            $rawCards
        );
    }

    /**
     * Validation rules.
     */
    private function validationRules(): array
    {
        return [
            'source_type' => [
                'nullable',
                'string',
                'in:ai,manual',
            ],

            'cards' => [
                'required',
                'array',
                'min:1',
            ],

            'cards.*.front' => [
                'required',
                'string',
            ],

            'cards.*.back' => [
                'required',
                'string',
            ],
        ];
    }

    /**
     * Standard API response.
     */
    private function toResponseArray(
        Flashcard $flashcard
    ): array {
        $lesson = $flashcard->relationLoaded(
            'lesson'
        )
            ? $flashcard->lesson
            : null;

        return [
            'id' => $flashcard->id,

            'lessonId' => $lesson
                ? [
                    'id' => $lesson->id,
                    'title' => $lesson->title,
                ]
                : $flashcard->lesson_id,

            'cards' =>
                $flashcard->cards ?? [],

            'totalCards' =>
                count(
                    $flashcard->cards ?? []
                ),

            'sourceType' =>
                $flashcard->source_type,

            'status' =>
                $flashcard->status,

            'createdAt' =>
                $flashcard->created_at
                    ?->toIso8601String(),

            'updatedAt' =>
                $flashcard->updated_at
                    ?->toIso8601String(),
        ];
    }
}