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
        $documentId = $request->input('documentId');
        $count = (int) $request->input('count', 10);

        if (! $documentId) {
            return $this->missingDocumentId();
        }

        $document = $this->findReadyDocument($request, $documentId);
        if (! $document) {
            return $this->documentNotReady();
        }

        $cards = $this->gemini->generateFlashcards($document->extracted_text ?? '', $count);

        $flashcardSet = Flashcard::create([
            'user_id' => $request->user()->id,
            'document_id' => $document->id,
            'cards' => Flashcard::buildCards($cards),
        ]);

        return response()->json([
            'success' => true,
            'data' => $flashcardSet->toResponseArray($document),
            'message' => 'Flashcards generated successfully',
        ], 201);
    }

    /**
     * POST /api/ai/generate-quiz
     */
    public function generateQuiz(Request $request)
    {
        $documentId = $request->input('documentId');
        $numQuestions = (int) $request->input('numQuestions', 5);
        $title = $request->input('title');

        if (! $documentId) {
            return $this->missingDocumentId();
        }

        $document = $this->findReadyDocument($request, $documentId);
        if (! $document) {
            return $this->documentNotReady();
        }

        $questions = $this->gemini->generateQuiz($document->extracted_text ?? '', $numQuestions);
        $builtQuestions = Quiz::buildQuestions($questions);

        $quiz = Quiz::create([
            'user_id' => $request->user()->id,
            'document_id' => $document->id,
            'title' => $title ?: ($document->title.' - Quiz'),
            'questions' => $builtQuestions,
            'total_questions' => count($builtQuestions),
            'user_answers' => [],
            'score' => 0,
        ]);

        return response()->json([
            'success' => true,
            'data' => $quiz->toResponseArray($document),
            'message' => 'Quiz generated successfully',
        ], 201);
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
}
