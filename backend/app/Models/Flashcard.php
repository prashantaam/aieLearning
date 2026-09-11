<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class Flashcard extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'lesson_id',
        'cards',
    ];

    protected function casts(): array
    {
        return [
            'cards' => 'array',
        ];
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function lesson()
    {
        return $this->belongsTo(Lesson::class);
    }

    /**
     * Normalise a raw list of {question, answer, difficulty} into the
     * full card shape, giving each card a stable id the same way
     * MongoDB auto-assigns an `_id` to every subdocument.
     */
    public static function buildCards(array $rawCards): array
    {
        return array_map(function (array $card) {
            return [
                'id' => (string) Str::uuid(),
                'question' => $card['question'],
                'answer' => $card['answer'],
                'difficulty' => $card['difficulty'] ?? 'medium',
                'lastReviewed' => null,
                'reviewCount' => 0,
                'isStarred' => false,
            ];
        }, $rawCards);
    }

    public function toResponseArray(?Lesson $lesson = null): array
    {
        $lesson ??= $this->relationLoaded('lesson')
            ? $this->lesson
            : null;

        return [
            'id' => $this->id,
            'userId' => $this->user_id,
            'lessonId' => $lesson
                ? [
                    'id' => $lesson->id,
                    'title' => $lesson->title,
                ]
                : $this->lesson_id,
            'cards' => $this->cards ?? [],
            'createdAt' => $this->created_at?->toIso8601String(),
            'updatedAt' => $this->updated_at?->toIso8601String(),
        ];
    }
}
