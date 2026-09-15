<?php

namespace App\Http\Controllers\Teacher;

use App\Http\Controllers\Controller;
use App\Models\Flashcard;
use App\Models\Sublesson;
use App\Models\Teacher;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class FlashcardController extends Controller
{
    /**
     * List all flashcard sets for a sublesson.
     */
    public function index(
        Request $request,
        Sublesson $sublesson
    ) {
        $teacher = $request->user();

        if (! $teacher instanceof Teacher) {
            return response()->json([
                'message' => 'Teacher access required.',
            ], 403);
        }

        $sublesson->load('lesson.course');

        if (
            ! $this->teacherOwnsSublesson(
                $teacher,
                $sublesson
            )
        ) {
            return response()->json([
                'message' =>
                    'You are not authorised to view flashcards for this sublesson.',
            ], 403);
        }

        /*
        |--------------------------------------------------------------------------
        | Get Flashcards
        |--------------------------------------------------------------------------
        */

        $flashcards = Flashcard::where(
            'sublesson_id',
            $sublesson->id
        )
            ->orderBy('sort_order')
            ->latest('id')
            ->get();

        return response()->json([
            'success' => true,

            'data' => [
                'sublesson' => [
                    'id' =>
                        $sublesson->id,

                    'title' =>
                        $sublesson->title,
                ],

                'flashcards' =>
                    $flashcards
                        ->map(
                            fn ($flashcard) =>
                                $this->toResponseArray(
                                    $flashcard,
                                    $sublesson
                                )
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

        if (
            ! $this->teacherOwnsFlashcard(
                $teacher,
                $flashcard
            )
        ) {
            return response()->json([
                'message' =>
                    'You are not authorised to view this flashcard set.',
            ], 403);
        }

        $flashcard->load('sublesson');

        return response()->json([
            'success' => true,

            'data' => [
                'flashcard' =>
                    $this->toResponseArray(
                        $flashcard,
                        $flashcard->sublesson
                    ),
            ],
        ]);
    }

    /**
     * Create/save flashcards for a sublesson.
     */
    public function store(
        Request $request,
        Sublesson $sublesson
    ) {
        $teacher = $request->user();

        if (! $teacher instanceof Teacher) {
            return response()->json([
                'message' => 'Teacher access required.',
            ], 403);
        }

        $sublesson->load('lesson.course');

        if (
            ! $this->teacherOwnsSublesson(
                $teacher,
                $sublesson
            )
        ) {
            return response()->json([
                'message' =>
                    'You are not authorised to create flashcards for this sublesson.',
            ], 403);
        }

        $validated = $request->validate(
            $this->validationRules()
        );

        /*
        |--------------------------------------------------------------------------
        | Build Cards
        |--------------------------------------------------------------------------
        */

        $cards = $this->buildCards(
            $validated['cards']
        );

        /*
        |--------------------------------------------------------------------------
        | Calculate Sort Order
        |--------------------------------------------------------------------------
        */

        $maxSortOrder =
            Flashcard::where(
                'sublesson_id',
                $sublesson->id
            )->max('sort_order');

        $nextSortOrder =
            ($maxSortOrder ?? 0) + 1;

        /*
        |--------------------------------------------------------------------------
        | Create Flashcard Set
        |--------------------------------------------------------------------------
        */

        $flashcard = Flashcard::create([
            'sublesson_id' =>
                $sublesson->id,

            'title' =>
                $validated['title']
                ?? $sublesson->title . ' - Flashcards',

            'cards' =>
                $cards,

            'source_type' =>
                $validated['source_type']
                ?? 'ai',

            'sort_order' =>
                $nextSortOrder,

            'status' =>
                'draft',
        ]);

        $flashcard->load('sublesson');

        return response()->json([
            'success' => true,

            'message' =>
                'Flashcards saved successfully.',

            'data' => [
                'flashcard' =>
                    $this->toResponseArray(
                        $flashcard,
                        $flashcard->sublesson
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

        if (
            ! $this->teacherOwnsFlashcard(
                $teacher,
                $flashcard
            )
        ) {
            return response()->json([
                'message' =>
                    'You are not authorised to update this flashcard set.',
            ], 403);
        }

        $validated = $request->validate(
            $this->validationRules()
        );

        $cards = $this->buildCards(
            $validated['cards']
        );

        $flashcard->update([
            'title' =>
                $validated['title']
                ?? $flashcard->title,

            'cards' =>
                $cards,

            'source_type' =>
                $validated['source_type']
                ?? $flashcard->source_type,
        ]);

        $flashcard->load('sublesson');

        return response()->json([
            'success' => true,

            'message' =>
                'Flashcards updated successfully.',

            'data' => [
                'flashcard' =>
                    $this->toResponseArray(
                        $flashcard,
                        $flashcard->sublesson
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

        if (
            ! $this->teacherOwnsFlashcard(
                $teacher,
                $flashcard
            )
        ) {
            return response()->json([
                'message' =>
                    'You are not authorised to delete this flashcard set.',
            ], 403);
        }

        $sublessonId =
            $flashcard->sublesson_id;

        $flashcard->delete();

        return response()->json([
            'success' => true,

            'message' =>
                'Flashcard set deleted successfully.',

            'data' => [
                'sublessonId' =>
                    $sublessonId,
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

        if (
            ! $this->teacherOwnsFlashcard(
                $teacher,
                $flashcard
            )
        ) {
            return response()->json([
                'message' =>
                    'You are not authorised to publish this flashcard set.',
            ], 403);
        }

        $cards =
            $flashcard->cards ?? [];

        if (count($cards) === 0) {
            return response()->json([
                'message' =>
                    'A flashcard set must contain at least one card before publishing.',
            ], 422);
        }

        $flashcard->update([
            'status' => 'published',
        ]);

        $flashcard->load('sublesson');

        return response()->json([
            'success' => true,

            'message' =>
                'Flashcards published successfully.',

            'data' => [
                'flashcard' =>
                    $this->toResponseArray(
                        $flashcard,
                        $flashcard->sublesson
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

        if (
            ! $this->teacherOwnsFlashcard(
                $teacher,
                $flashcard
            )
        ) {
            return response()->json([
                'message' =>
                    'You are not authorised to unpublish this flashcard set.',
            ], 403);
        }

        $flashcard->update([
            'status' => 'draft',
        ]);

        $flashcard->load('sublesson');

        return response()->json([
            'success' => true,

            'message' =>
                'Flashcards moved back to draft.',

            'data' => [
                'flashcard' =>
                    $this->toResponseArray(
                        $flashcard,
                        $flashcard->sublesson
                    ),
            ],
        ]);
    }

    /**
     * Check whether the authenticated teacher
     * owns this sublesson.
     */
    private function teacherOwnsSublesson(
        Teacher $teacher,
        Sublesson $sublesson
    ): bool {
        $sublesson->loadMissing(
            'lesson.course'
        );

        if (
            ! $sublesson->lesson ||
            ! $sublesson->lesson->course
        ) {
            return false;
        }

        return
            (int) $sublesson
                ->lesson
                ->course
                ->teacher_id
            ===
            (int) $teacher->id;
    }

    /**
     * Check whether the authenticated teacher
     * owns the course containing this flashcard set.
     */
    private function teacherOwnsFlashcard(
        Teacher $teacher,
        Flashcard $flashcard
    ): bool {
        $flashcard->loadMissing(
            'sublesson.lesson.course'
        );

        if (
            ! $flashcard->sublesson ||
            ! $flashcard->sublesson->lesson ||
            ! $flashcard
                ->sublesson
                ->lesson
                ->course
        ) {
            return false;
        }

        return
            (int) $flashcard
                ->sublesson
                ->lesson
                ->course
                ->teacher_id
            ===
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
                        $card['id']
                        ?? (string) Str::uuid(),

                    'front' =>
                        trim(
                            $card['front']
                            ?? ''
                        ),

                    'back' =>
                        trim(
                            $card['back']
                            ?? ''
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
            'title' => [
                'nullable',
                'string',
                'max:255',
            ],

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
        Flashcard $flashcard,
        ?Sublesson $sublesson = null
    ): array {
        /*
         * Use supplied Sublesson first.
         *
         * Otherwise use the loaded relationship.
         */
        if (! $sublesson) {
            $sublesson =
                $flashcard->relationLoaded(
                    'sublesson'
                )
                    ? $flashcard->sublesson
                    : null;
        }

        return [
            'id' =>
                $flashcard->id,

            'sublessonId' =>
                $sublesson
                    ? [
                        'id' =>
                            $sublesson->id,

                        'title' =>
                            $sublesson->title,
                    ]
                    : $flashcard
                        ->sublesson_id,

            'title' =>
                $flashcard->title,

            'cards' =>
                $flashcard->cards ?? [],

            'totalCards' =>
                count(
                    $flashcard->cards ?? []
                ),

            'sourceType' =>
                $flashcard->source_type,

            'sortOrder' =>
                $flashcard->sort_order,

            'status' =>
                $flashcard->status,

            'createdAt' =>
                $flashcard
                    ->created_at
                    ?->toIso8601String(),

            'updatedAt' =>
                $flashcard
                    ->updated_at
                    ?->toIso8601String(),
        ];
    }
}