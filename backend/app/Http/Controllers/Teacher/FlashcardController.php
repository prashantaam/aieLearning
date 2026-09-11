<?php

namespace App\Http\Controllers\Teacher;

use App\Http\Controllers\Controller;
use App\Models\Flashcard;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class FlashcardController extends Controller
{
    /**
     * GET /api/flashcards (all sets for the user)
     */
    public function indexAll(Request $request)
    {
        $sets = Flashcard::with('document')
            ->where('user_id', $request->user()->id)
            ->orderByDesc('created_at')
            ->get();

        return response()->json([
            'success' => true,
            'count' => $sets->count(),
            'data' => $sets->map->toResponseArray()->values(),
        ]);
    }

    /**
     * GET /api/flashcards/{documentId} (sets for a specific document)
     */
    public function indexForDocument(Request $request, int $documentId)
    {
        $sets = Flashcard::with('document')
            ->where('user_id', $request->user()->id)
            ->where('document_id', $documentId)
            ->orderByDesc('created_at')
            ->get();

        return response()->json([
            'success' => true,
            'count' => $sets->count(),
            'data' => $sets->map->toResponseArray()->values(),
        ]);
    }

    /**
     * POST /api/flashcards/{cardId}/review
     */
    public function review(Request $request, string $cardId)
    {
        $set = $this->findSetByCardId($request, $cardId);

        if (! $set) {
            return $this->cardNotFound();
        }

        $cards = $set->cards;
        foreach ($cards as &$card) {
            if ($card['id'] === $cardId) {
                $card['lastReviewed'] = now()->toIso8601String();
                $card['reviewCount'] = ($card['reviewCount'] ?? 0) + 1;
                break;
            }
        }
        unset($card);

        $set->cards = $cards;
        $set->save();

        return response()->json([
            'success' => true,
            'data' => $set->toResponseArray(),
            'message' => 'Flashcard reviewed successfully',
        ]);
    }

    /**
     * PUT /api/flashcards/{cardId}/star
     */
    public function toggleStar(Request $request, string $cardId)
    {
        $set = $this->findSetByCardId($request, $cardId);

        if (! $set) {
            return $this->cardNotFound();
        }

        $cards = $set->cards;
        $isStarredNow = false;

        foreach ($cards as &$card) {
            if ($card['id'] === $cardId) {
                $card['isStarred'] = ! ($card['isStarred'] ?? false);
                $isStarredNow = $card['isStarred'];
                break;
            }
        }
        unset($card);

        $set->cards = $cards;
        $set->save();

        return response()->json([
            'success' => true,
            'data' => $set->toResponseArray(),
            'message' => 'Flashcard '.($isStarredNow ? 'starred' : 'unstarred'),
        ]);
    }

    /**
     * DELETE /api/flashcards/{id}
     */
    public function destroy(Request $request, int $id)
    {
        $set = Flashcard::where('id', $id)
            ->where('user_id', $request->user()->id)
            ->first();

        if (! $set) {
            return response()->json([
                'success' => false,
                'error' => 'Flashcard set not found',
                'statusCode' => 404,
            ], 404);
        }

        $set->delete();

        return response()->json([
            'success' => true,
            'message' => 'Flashcard set deleted successfully',
        ]);
    }

    private function findSetByCardId(Request $request, string $cardId): ?Flashcard
    {
        return Flashcard::where('user_id', $request->user()->id)
            ->get()
            ->first(fn (Flashcard $set) => collect($set->cards)->contains(fn ($c) => ($c['id'] ?? null) === $cardId));
    }

    private function cardNotFound()
    {
        return response()->json([
            'success' => false,
            'error' => 'Flashcard set or card not found',
            'statusCode' => 404,
        ], 404);
    }
}
