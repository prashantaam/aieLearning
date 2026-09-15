<?php

namespace App\Http\Controllers\Teacher;

use App\Http\Controllers\Controller;
use App\Models\ChatHistory;
use App\Models\Document;
use App\Models\Quiz;
use App\Models\Sublesson;
use App\Models\Teacher;
use App\Services\GeminiService;
use App\Services\TextChunkerService;
use Illuminate\Http\Request;

class AiController extends Controller
{
    public function __construct(
        private GeminiService $gemini,
        private TextChunkerService $chunker,
    ) {
    }

    /*
    |--------------------------------------------------------------------------
    | Generate Flashcards
    |--------------------------------------------------------------------------
    |
    | POST /api/teacher/ai/generate-flashcards
    |
    | Generates a preview only.
    | Nothing is saved to the database here.
    |
    */

    public function generateFlashcards(Request $request)
    {
        $teacher = $request->user();

        if (! $teacher instanceof Teacher) {
            return response()->json([
                'success' => false,
                'message' => 'Teacher access required.',
            ], 403);
        }

        $validated = $request->validate([
            'sublessonId' => [
                'required',
                'integer',
                'exists:sublessons,id',
            ],

            'numberOfCards' => [
                'nullable',
                'integer',
                'min:1',
                'max:50',
            ],
        ]);

        /*
        |--------------------------------------------------------------------------
        | Load Sublesson
        |--------------------------------------------------------------------------
        */

        $sublesson = Sublesson::with([
            'lesson.course',
            'contents',
        ])->findOrFail(
            $validated['sublessonId']
        );

        /*
        |--------------------------------------------------------------------------
        | Check Teacher Ownership
        |--------------------------------------------------------------------------
        |
        | Sublesson
        |   → Lesson
        |       → Course
        |           → Teacher
        |
        */

        if (
            ! $sublesson->lesson ||
            ! $sublesson->lesson->course
        ) {
            return response()->json([
                'success' => false,
                'message' =>
                    'Course not found for this sublesson.',
            ], 404);
        }

        if (
            (int) $sublesson
                ->lesson
                ->course
                ->teacher_id
            !==
            (int) $teacher->id
        ) {
            return response()->json([
                'success' => false,
                'message' =>
                    'You are not authorised to generate flashcards for this sublesson.',
            ], 403);
        }

        /*
        |--------------------------------------------------------------------------
        | Combine Sublesson Learning Content
        |--------------------------------------------------------------------------
        */

        $learningMaterial = $sublesson
            ->contents
            ->sortBy('sort_order')
            ->pluck('content')
            ->filter(
                fn ($content) =>
                    is_string($content) &&
                    trim($content) !== ''
            )
            ->implode("\n\n");

        if (trim($learningMaterial) === '') {
            return response()->json([
                'success' => false,
                'message' =>
                    'This sublesson does not have any learning content.',
            ], 422);
        }

        try {
            $numberOfCards =
                $validated['numberOfCards'] ?? 10;

            /*
            |--------------------------------------------------------------------------
            | Generate Flashcards Using Gemini
            |--------------------------------------------------------------------------
            */

            $cards = $this->gemini
                ->generateFlashcards(
                    $learningMaterial,
                    $numberOfCards
                );

            if (
                ! is_array($cards) ||
                count($cards) === 0
            ) {
                return response()->json([
                    'success' => false,
                    'message' =>
                        'AI did not generate any valid flashcards.',
                ], 422);
            }

            /*
            |--------------------------------------------------------------------------
            | Normalise Gemini Response
            |--------------------------------------------------------------------------
            */

            $generatedCards = collect($cards)
                ->map(function ($card) {
                    return [
                        'question' => trim(
                            $card['question'] ?? ''
                        ),

                        'answer' => trim(
                            $card['answer'] ?? ''
                        ),

                        'difficulty' =>
                            $card['difficulty']
                            ?? 'medium',
                    ];
                })
                ->filter(function ($card) {
                    return
                        $card['question'] !== '' &&
                        $card['answer'] !== '';
                })
                ->values()
                ->all();

            if (count($generatedCards) === 0) {
                return response()->json([
                    'success' => false,
                    'message' =>
                        'AI did not generate any usable flashcards.',
                ], 422);
            }

            /*
            |--------------------------------------------------------------------------
            | Return Preview
            |--------------------------------------------------------------------------
            |
            | React lets the teacher review/edit the cards.
            | They are saved separately using FlashcardController.
            |
            */

            return response()->json([
                'success' => true,

                'message' =>
                    'Flashcards generated successfully. Review them before saving.',

                'data' => [
                    'flashcards' => [
                        'title' =>
                            $sublesson->title .
                            ' - Flashcards',

                        'cards' =>
                            $generatedCards,

                        'totalCards' =>
                            count($generatedCards),

                        'sourceType' =>
                            'ai',

                        'status' =>
                            'draft',
                    ],
                ],
            ]);
        } catch (\Throwable $e) {
            logger()->error(
                'Sublesson flashcard generation failed',
                [
                    'sublesson_id' =>
                        $sublesson->id,

                    'message' =>
                        $e->getMessage(),

                    'file' =>
                        $e->getFile(),

                    'line' =>
                        $e->getLine(),
                ]
            );

            return response()->json([
                'success' => false,

                'message' =>
                    'Failed to generate flashcards.',

                'error' =>
                    $e->getMessage(),
            ], 500);
        }
    }

    /*
    |--------------------------------------------------------------------------
    | Generate Quiz
    |--------------------------------------------------------------------------
    |
    | POST /api/teacher/ai/generate-quiz
    |
    | Generates a preview only.
    | Nothing is saved to the database here.
    |
    */

    public function generateQuiz(Request $request)
    {
        $teacher = $request->user();

        if (! $teacher instanceof Teacher) {
            return response()->json([
                'success' => false,
                'message' => 'Teacher access required.',
            ], 403);
        }

        $validated = $request->validate([
            'sublessonId' => [
                'required',
                'integer',
                'exists:sublessons,id',
            ],

            'numQuestions' => [
                'nullable',
                'integer',
                'min:1',
                'max:20',
            ],
        ]);

        /*
        |--------------------------------------------------------------------------
        | Load Sublesson
        |--------------------------------------------------------------------------
        */

        $sublesson = Sublesson::with([
            'lesson.course',
            'contents',
        ])->findOrFail(
            $validated['sublessonId']
        );

        /*
        |--------------------------------------------------------------------------
        | Check Teacher Ownership
        |--------------------------------------------------------------------------
        */

        if (
            ! $sublesson->lesson ||
            ! $sublesson->lesson->course
        ) {
            return response()->json([
                'success' => false,
                'message' =>
                    'Course not found for this sublesson.',
            ], 404);
        }

        if (
            (int) $sublesson
                ->lesson
                ->course
                ->teacher_id
            !==
            (int) $teacher->id
        ) {
            return response()->json([
                'success' => false,
                'message' =>
                    'You are not authorised to generate a quiz for this sublesson.',
            ], 403);
        }

        /*
        |--------------------------------------------------------------------------
        | Combine Sublesson Learning Content
        |--------------------------------------------------------------------------
        */

        $learningMaterial = $sublesson
            ->contents
            ->sortBy('sort_order')
            ->pluck('content')
            ->filter(
                fn ($content) =>
                    is_string($content) &&
                    trim($content) !== ''
            )
            ->implode("\n\n");

        if (trim($learningMaterial) === '') {
            return response()->json([
                'success' => false,
                'message' =>
                    'This sublesson does not have any learning content.',
            ], 422);
        }

        try {
            $numQuestions =
                $validated['numQuestions'] ?? 5;

            /*
            |--------------------------------------------------------------------------
            | Generate Quiz Using Gemini
            |--------------------------------------------------------------------------
            */

            $questions = $this->gemini
                ->generateQuiz(
                    $learningMaterial,
                    $numQuestions
                );

            if (
                ! is_array($questions) ||
                count($questions) === 0
            ) {
                return response()->json([
                    'success' => false,
                    'message' =>
                        'AI did not generate any valid quiz questions.',
                ], 422);
            }

            /*
            |--------------------------------------------------------------------------
            | Build / Normalise Questions
            |--------------------------------------------------------------------------
            |
            | This keeps the same UUID/question structure used by Quiz.
            |
            */

            $builtQuestions =
                Quiz::buildQuestions(
                    $questions
                );

            if (count($builtQuestions) === 0) {
                return response()->json([
                    'success' => false,
                    'message' =>
                        'AI did not generate any usable quiz questions.',
                ], 422);
            }

            /*
            |--------------------------------------------------------------------------
            | Return Preview
            |--------------------------------------------------------------------------
            |
            | Nothing is saved here.
            |
            | React lets the teacher edit the generated quiz.
            | QuizController::store() saves it afterwards.
            |
            */

            return response()->json([
                'success' => true,

                'message' =>
                    'Quiz generated successfully. Review it before saving.',

                'data' => [
                    'quiz' => [
                        'title' =>
                            $sublesson->title .
                            ' - Quiz',

                        'questions' =>
                            $builtQuestions,

                        'totalQuestions' =>
                            count($builtQuestions),

                        'sourceType' =>
                            'ai',

                        'status' =>
                            'draft',
                    ],
                ],
            ]);
        } catch (\Throwable $e) {
            logger()->error(
                'Sublesson quiz generation failed',
                [
                    'sublesson_id' =>
                        $sublesson->id,

                    'message' =>
                        $e->getMessage(),

                    'file' =>
                        $e->getFile(),

                    'line' =>
                        $e->getLine(),
                ]
            );

            return response()->json([
                'success' => false,

                'message' =>
                    'Failed to generate quiz.',

                'error' =>
                    $e->getMessage(),
            ], 500);
        }
    }

    /*
    |--------------------------------------------------------------------------
    | Generate Summary
    |--------------------------------------------------------------------------
    */

    public function generateSummary(Request $request)
    {
        $documentId =
            $request->input('documentId');

        if (! $documentId) {
            return $this->missingDocumentId();
        }

        $document =
            $this->findReadyDocument(
                $request,
                $documentId
            );

        if (! $document) {
            return $this->documentNotReady();
        }

        $summary =
            $this->gemini->generateSummary(
                $document->extracted_text ?? ''
            );

        return response()->json([
            'success' => true,

            'data' => [
                'documentId' =>
                    $document->id,

                'title' =>
                    $document->title,

                'summary' =>
                    $summary,
            ],

            'message' =>
                'Summary generated successfully',
        ]);
    }

    /*
    |--------------------------------------------------------------------------
    | Chat
    |--------------------------------------------------------------------------
    */

    public function chat(Request $request)
    {
        $documentId =
            $request->input('documentId');

        $question =
            $request->input('question');

        if (
            ! $documentId ||
            ! $question
        ) {
            return response()->json([
                'success' => false,
                'error' =>
                    'Please provide documentId and question',
                'statusCode' => 400,
            ], 400);
        }

        $document =
            $this->findReadyDocument(
                $request,
                $documentId
            );

        if (! $document) {
            return $this->documentNotReady();
        }

        $relevantChunks =
            $this->chunker
                ->findRelevantChunks(
                    $document->chunks ?? [],
                    $question,
                    3
                );

        $chunkIndices =
            array_map(
                fn ($c) =>
                    $c['chunkIndex'],
                $relevantChunks
            );

        $chatHistory =
            ChatHistory::firstOrCreate(
                [
                    'user_id' =>
                        $request->user()->id,

                    'document_id' =>
                        $document->id,
                ],
                [
                    'messages' => [],
                ]
            );

        $answer =
            $this->gemini
                ->chatWithContext(
                    $question,
                    $relevantChunks
                );

        $messages =
            $chatHistory->messages ?? [];

        $messages[] = [
            'role' => 'user',
            'content' => $question,
            'timestamp' =>
                now()->toIso8601String(),
            'relevantChunks' => [],
        ];

        $messages[] = [
            'role' => 'assistant',
            'content' => $answer,
            'timestamp' =>
                now()->toIso8601String(),
            'relevantChunks' =>
                $chunkIndices,
        ];

        $chatHistory->messages =
            $messages;

        $chatHistory->save();

        return response()->json([
            'success' => true,

            'data' => [
                'question' =>
                    $question,

                'answer' =>
                    $answer,

                'relevantChunks' =>
                    $chunkIndices,

                'chatHistoryId' =>
                    $chatHistory->id,
            ],

            'message' =>
                'Response generated successfully',
        ]);
    }

    /*
    |--------------------------------------------------------------------------
    | Explain Concept
    |--------------------------------------------------------------------------
    */

    public function explainConcept(Request $request)
    {
        $documentId =
            $request->input('documentId');

        $concept =
            $request->input('concept');

        if (
            ! $documentId ||
            ! $concept
        ) {
            return response()->json([
                'success' => false,
                'error' =>
                    'Please provide documentId and concept',
                'statusCode' => 400,
            ], 400);
        }

        $document =
            $this->findReadyDocument(
                $request,
                $documentId
            );

        if (! $document) {
            return $this->documentNotReady();
        }

        $relevantChunks =
            $this->chunker
                ->findRelevantChunks(
                    $document->chunks ?? [],
                    $concept,
                    3
                );

        $context =
            collect($relevantChunks)
                ->pluck('content')
                ->implode("\n\n");

        $explanation =
            $this->gemini
                ->explainConcept(
                    $concept,
                    $context
                );

        return response()->json([
            'success' => true,

            'data' => [
                'concept' =>
                    $concept,

                'explanation' =>
                    $explanation,

                'relevantChunks' =>
                    array_map(
                        fn ($c) =>
                            $c['chunkIndex'],
                        $relevantChunks
                    ),
            ],

            'message' =>
                'Explanation generated successfully',
        ]);
    }

    /*
    |--------------------------------------------------------------------------
    | Chat History
    |--------------------------------------------------------------------------
    */

    public function chatHistory(
        Request $request,
        int $documentId
    ) {
        $chatHistory =
            ChatHistory::where(
                'user_id',
                $request->user()->id
            )
                ->where(
                    'document_id',
                    $documentId
                )
                ->first();

        if (! $chatHistory) {
            return response()->json([
                'success' => true,
                'data' => [],
                'message' =>
                    'No chat history found for this document',
            ]);
        }

        return response()->json([
            'success' => true,

            'data' =>
                $chatHistory->messages ?? [],

            'message' =>
                'Chat history retrieved successfully',
        ]);
    }

    /*
    |--------------------------------------------------------------------------
    | Document Helpers
    |--------------------------------------------------------------------------
    */

    private function findReadyDocument(
        Request $request,
        int $documentId
    ): ?Document {
        return Document::where(
            'id',
            $documentId
        )
            ->where(
                'user_id',
                $request->user()->id
            )
            ->where(
                'status',
                'ready'
            )
            ->first();
    }

    private function missingDocumentId()
    {
        return response()->json([
            'success' => false,
            'error' =>
                'Please provide documentId',
            'statusCode' => 400,
        ], 400);
    }

    private function documentNotReady()
    {
        return response()->json([
            'success' => false,
            'error' =>
                'Document not found or not ready',
            'statusCode' => 404,
        ], 404);
    }

    /*
    |--------------------------------------------------------------------------
    | Generate Learning Content
    |--------------------------------------------------------------------------
    */

    public function generateLearningContent(
        Request $request,
        GeminiService $geminiService
    ) {
        $validated =
            $request->validate([
                'title' => [
                    'required',
                    'string',
                    'max:255',
                ],
            ]);

        try {
            $content =
                $geminiService
                    ->generateLearningContent(
                        $validated['title']
                    );

            return response()->json([
                'success' => true,

                'data' => [
                    'content' =>
                        $content,
                ],
            ]);
        } catch (\Throwable $e) {
            logger()->error(
                'Learning content generation failed',
                [
                    'message' =>
                        $e->getMessage(),
                ]
            );

            return response()->json([
                'success' => false,

                'message' =>
                    'Failed to generate learning content.',
            ], 500);
        }
    }

    /*
    |--------------------------------------------------------------------------
    | Generate Course Lessons
    |--------------------------------------------------------------------------
    */

    public function generateCourseLessons(
        Request $request,
        GeminiService $geminiService
    ) {
        $validated =
            $request->validate([
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

        try {
            $lessons =
                $geminiService
                    ->generateCourseLessons(
                        $validated['title'],
                        $validated['description']
                            ?? null
                    );

            return response()->json([
                'success' => true,

                'data' => [
                    'lessons' =>
                        $lessons,
                ],
            ]);
        } catch (\Throwable $e) {
            logger()->error(
                'Course lesson generation failed',
                [
                    'message' =>
                        $e->getMessage(),

                    'file' =>
                        $e->getFile(),

                    'line' =>
                        $e->getLine(),
                ]
            );

            return response()->json([
                'success' => false,

                'message' =>
                    'Failed to generate course lessons.',

                'file' =>
                    $e->getFile(),

                'line' =>
                    $e->getLine(),
            ], 500);
        }
    }
}