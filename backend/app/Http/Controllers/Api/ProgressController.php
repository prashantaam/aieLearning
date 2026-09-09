<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Document;
use App\Models\Flashcard;
use App\Models\Quiz;
use Illuminate\Http\Request;

class ProgressController extends Controller
{
    /**
     * GET /api/progress/dashboard
     */
    public function dashboard(Request $request)
    {
        $userId = $request->user()->id;

        $totalDocuments = Document::where('user_id', $userId)->count();
        $totalFlashcardSets = Flashcard::where('user_id', $userId)->count();
        $totalQuizzes = Quiz::where('user_id', $userId)->count();
        $completedQuizzes = Quiz::where('user_id', $userId)->whereNotNull('completed_at')->count();

        $flashcardSets = Flashcard::where('user_id', $userId)->get();
        $totalFlashcards = 0;
        $reviewedFlashcards = 0;
        $starredFlashcards = 0;

        foreach ($flashcardSets as $set) {
            $cards = $set->cards ?? [];
            $totalFlashcards += count($cards);
            $reviewedFlashcards += count(array_filter($cards, fn ($c) => ($c['reviewCount'] ?? 0) > 0));
            $starredFlashcards += count(array_filter($cards, fn ($c) => $c['isStarred'] ?? false));
        }

        $completedQuizList = Quiz::where('user_id', $userId)->whereNotNull('completed_at')->get();
        $averageScore = $completedQuizList->count() > 0
            ? (int) round($completedQuizList->avg('score'))
            : 0;

        $recentDocuments = Document::where('user_id', $userId)
            ->orderByDesc('last_accessed')
            ->limit(5)
            ->get()
            ->map(fn (Document $d) => [
                'id' => $d->id,
                'title' => $d->title,
                'fileName' => $d->file_name,
                'lastAccessed' => $d->last_accessed?->toIso8601String(),
                'status' => $d->status,
            ])
            ->values();

        $recentQuizzes = Quiz::with('document')
            ->where('user_id', $userId)
            ->orderByDesc('created_at')
            ->limit(5)
            ->get()
            ->map(fn (Quiz $q) => [
                'id' => $q->id,
                'title' => $q->title,
                'documentId' => $q->document ? ['id' => $q->document->id, 'title' => $q->document->title] : null,
                'score' => $q->score,
                'totalQuestions' => $q->total_questions,
                'completedAt' => $q->completed_at?->toIso8601String(),
            ])
            ->values();

        // Study streak (simplified — the original also used mock/random data).
        $studyStreak = random_int(1, 7);

        return response()->json([
            'success' => true,
            'data' => [
                'overview' => [
                    'totalDocuments' => $totalDocuments,
                    'totalFlashcardSets' => $totalFlashcardSets,
                    'totalFlashcards' => $totalFlashcards,
                    'reviewedFlashcards' => $reviewedFlashcards,
                    'starredFlashcards' => $starredFlashcards,
                    'totalQuizzes' => $totalQuizzes,
                    'completedQuizzes' => $completedQuizzes,
                    'averageScore' => $averageScore,
                    'studyStreak' => $studyStreak,
                ],
                'recentActivity' => [
                    'documents' => $recentDocuments,
                    'quizzes' => $recentQuizzes,
                ],
            ],
        ]);
    }
}
