<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ChatHistory;
use App\Models\Document;
use App\Models\Flashcard;
use App\Models\Quiz;
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

    /**
     * POST /api/ai/generate-flashcards
     */
    public function generateFlashcards(Request $request)
    {
        $validated = $request->validate([
            'chapterId' => ['required', 'integer', 'exists:chapters,id'],
            'count' => ['nullable', 'integer', 'min:1', 'max:50'],
        ]);

        $chapter = \App\Models\Chapter::with([
            'subject',
            'contents',
        ])->findOrFail($validated['chapterId']);

        /*
        * Check teacher owns the subject.
        */
        if ($chapter->subject->teacher_id !== $request->user()->id) {
            return response()->json([
                'success' => false,
                'message' => 'You are not authorised to generate flashcards for this chapter.',
            ], 403);
        }

        /*
        * Combine all chapter learning content.
        */
        $learningMaterial = $chapter->contents
            ->pluck('content')
            ->filter()
            ->implode("\n\n");

        if (trim($learningMaterial) === '') {
            return response()->json([
                'success' => false,
                'message' => 'This chapter does not have any learning content.',
            ], 422);
        }

        try {
            $count = $validated['count'] ?? 10;

            /*
            * Step 1: Generate flashcards with Gemini.
            */
            $cards = $this->gemini->generateFlashcards(
                $learningMaterial,
                $count
            );

            if (empty($cards)) {
                return response()->json([
                    'success' => false,
                    'message' => 'AI did not generate any valid flashcards.',
                ], 422);
            }

            /*
            * Step 2: Build cards for database storage.
            */
            $builtCards = Flashcard::buildCards($cards);

            /*
            * Step 3: Save flashcard set in MySQL.
            */
            $flashcardSet = Flashcard::create([
                'user_id' => $request->user()->id,
                'chapter_id' => $chapter->id,
                'cards' => $builtCards,
            ]);

            /*
            * Step 4: Return saved flashcard set.
            */
            return response()->json([
                'success' => true,
                'data' => $flashcardSet->toResponseArray($chapter),
                'message' => 'Flashcards generated and saved successfully.',
            ], 201);

        } catch (\Throwable $e) {
            logger()->error('Chapter flashcard generation failed', [
                'chapter_id' => $chapter->id,
                'message' => $e->getMessage(),
            ]);

            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 500);
        }
    }
    /**
     * POST /api/ai/generate-quiz
     */
    public function generateQuiz(Request $request)
    {
        $validated = $request->validate([
            'chapterId' => ['required', 'integer', 'exists:chapters,id'],
            'numQuestions' => ['nullable', 'integer', 'min:1', 'max:20'],
        ]);

        $chapter = \App\Models\Chapter::with([
            'subject',
            'contents',
        ])->findOrFail($validated['chapterId']);

        /*
        * Make sure the teacher owns this subject.
        */
        if ($chapter->subject->teacher_id !== $request->user()->id) {
            return response()->json([
                'success' => false,
                'message' => 'You are not authorised to generate a quiz for this chapter.',
            ], 403);
        }

        /*
        * Combine all learning content belonging to the chapter.
        */
        $learningMaterial = $chapter->contents
            ->pluck('content')
            ->filter()
            ->implode("\n\n");

        if (trim($learningMaterial) === '') {
            return response()->json([
                'success' => false,
                'message' => 'This chapter does not have any learning content.',
            ], 422);
        }

        try {
            $numQuestions = $validated['numQuestions'] ?? 5;

            /*
            * Generate quiz questions using Gemini.
            */
            $questions = $this->gemini->generateQuiz(
                $learningMaterial,
                $numQuestions
            );

            /*
            * Make sure Gemini returned valid questions.
            */
            if (empty($questions)) {
                return response()->json([
                    'success' => false,
                    'message' => 'AI did not generate any valid quiz questions.',
                ], 422);
            }

            /*
            * Normalise the questions and add UUIDs.
            */
            $builtQuestions = Quiz::buildQuestions($questions);

            /*
            * Save quiz against the chapter.
            */
            $quiz = Quiz::create([
                'user_id' => $request->user()->id,
                'chapter_id' => $chapter->id,
                'title' => $chapter->title . ' - Quiz',
                'questions' => $builtQuestions,
                'user_answers' => [],
                'score' => 0,
                'total_questions' => count($builtQuestions),
            ]);

            /*
            * Return the saved quiz.
            */
            return response()->json([
                'success' => true,
                'data' => $quiz->toResponseArray($chapter),
                'message' => 'Quiz generated and saved successfully.',
            ], 201);

        } catch (\Throwable $e) {
            logger()->error('Chapter quiz generation failed', [
                'chapter_id' => $chapter->id,
                'message' => $e->getMessage(),
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to generate quiz.',
            ], 500);
        }
    }

    /**
     * POST /api/ai/generate-summary
     */
    public function generateSummary(Request $request)
    {
        $documentId = $request->input('documentId');

        if (! $documentId) {
            return $this->missingDocumentId();
        }

        $document = $this->findReadyDocument($request, $documentId);
        if (! $document) {
            return $this->documentNotReady();
        }

        $summary = $this->gemini->generateSummary($document->extracted_text ?? '');

        return response()->json([
            'success' => true,
            'data' => [
                'documentId' => $document->id,
                'title' => $document->title,
                'summary' => $summary,
            ],
            'message' => 'Summary generated successfully',
        ]);
    }

    /**
     * POST /api/ai/chat
     */
    public function chat(Request $request)
    {
        $documentId = $request->input('documentId');
        $question = $request->input('question');

        if (! $documentId || ! $question) {
            return response()->json([
                'success' => false,
                'error' => 'Please provide documentId and question',
                'statusCode' => 400,
            ], 400);
        }

        $document = $this->findReadyDocument($request, $documentId);
        if (! $document) {
            return $this->documentNotReady();
        }

        $relevantChunks = $this->chunker->findRelevantChunks($document->chunks ?? [], $question, 3);
        $chunkIndices = array_map(fn ($c) => $c['chunkIndex'], $relevantChunks);

        $chatHistory = ChatHistory::firstOrCreate(
            ['user_id' => $request->user()->id, 'document_id' => $document->id],
            ['messages' => []]
        );

        $answer = $this->gemini->chatWithContext($question, $relevantChunks);

        $messages = $chatHistory->messages ?? [];
        $messages[] = [
            'role' => 'user',
            'content' => $question,
            'timestamp' => now()->toIso8601String(),
            'relevantChunks' => [],
        ];
        $messages[] = [
            'role' => 'assistant',
            'content' => $answer,
            'timestamp' => now()->toIso8601String(),
            'relevantChunks' => $chunkIndices,
        ];
        $chatHistory->messages = $messages;
        $chatHistory->save();

        return response()->json([
            'success' => true,
            'data' => [
                'question' => $question,
                'answer' => $answer,
                'relevantChunks' => $chunkIndices,
                'chatHistoryId' => $chatHistory->id,
            ],
            'message' => 'Response generated successfully',
        ]);
    }

    /**
     * POST /api/ai/explain-concept
     */
    public function explainConcept(Request $request)
    {
        $documentId = $request->input('documentId');
        $concept = $request->input('concept');

        if (! $documentId || ! $concept) {
            return response()->json([
                'success' => false,
                'error' => 'Please provide documentId and concept',
                'statusCode' => 400,
            ], 400);
        }

        $document = $this->findReadyDocument($request, $documentId);
        if (! $document) {
            return $this->documentNotReady();
        }

        $relevantChunks = $this->chunker->findRelevantChunks($document->chunks ?? [], $concept, 3);
        $context = collect($relevantChunks)->pluck('content')->implode("\n\n");

        $explanation = $this->gemini->explainConcept($concept, $context);

        return response()->json([
            'success' => true,
            'data' => [
                'concept' => $concept,
                'explanation' => $explanation,
                'relevantChunks' => array_map(fn ($c) => $c['chunkIndex'], $relevantChunks),
            ],
            'message' => 'Explanation generated successfully',
        ]);
    }

    /**
     * GET /api/ai/chat-history/{documentId}
     */
    public function chatHistory(Request $request, int $documentId)
    {
        $chatHistory = ChatHistory::where('user_id', $request->user()->id)
            ->where('document_id', $documentId)
            ->first();

        if (! $chatHistory) {
            return response()->json([
                'success' => true,
                'data' => [],
                'message' => 'No chat history found for this document',
            ]);
        }

        return response()->json([
            'success' => true,
            'data' => $chatHistory->messages ?? [],
            'message' => 'Chat history retrieved successfully',
        ]);
    }

    private function findReadyDocument(Request $request, int $documentId): ?Document
    {
        return Document::where('id', $documentId)
            ->where('user_id', $request->user()->id)
            ->where('status', 'ready')
            ->first();
    }

    private function missingDocumentId()
    {
        return response()->json([
            'success' => false,
            'error' => 'Please provide documentId',
            'statusCode' => 400,
        ], 400);
    }

    private function documentNotReady()
    {
        return response()->json([
            'success' => false,
            'error' => 'Document not found or not ready',
            'statusCode' => 404,
        ], 404);
    }

    public function generateLearningContent(
        Request $request,
        GeminiService $geminiService
        ) 
    {
        $validated = $request->validate([
            'title' => ['required', 'string', 'max:255'],
        ]);

        try {
            $content = $geminiService->generateLearningContent(
                $validated['title']
            );

            return response()->json([
                'success' => true,
                'data' => [
                    'content' => $content,
                ],
            ]);
        } catch (\Throwable $e) {
            logger()->error(
                'Learning content generation failed',
                [
                    'message' => $e->getMessage(),
                ]
            );

            return response()->json([
                'success' => false,
                'message' => 'Failed to generate learning content.',
            ], 500);
        }
    }

    public function generateCourseChapters(
        Request $request,
        GeminiService $geminiService
        ) 
    {
        $validated = $request->validate([
            'title' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
        ]);

        try {
            $chapters = $geminiService->generateCourseChapters(
                $validated['title'],
                $validated['description'] ?? null
            );

            return response()->json([
                'success' => true,
                'data' => [
                    'chapters' => $chapters,
                ],
            ]);
        } catch (\Throwable $e) {
            logger()->error(
                'Course chapter generation failed',
                [
                    'message' => $e->getMessage(),
                ]
            );

            return response()->json([
                'success' => false,
                'message' => 'Failed to generate course chapters.',
            ], 500);
        }
    }
}
