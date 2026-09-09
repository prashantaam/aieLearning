<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Quiz extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'chapter_id',
        'title',
        'questions',
        'user_answers',
        'score',
        'total_questions',
        'completed_at',
    ];

    public function attempts(): HasMany
    {
        return $this->hasMany(QuizAttempt::class);
    }


    protected function casts(): array
    {
        return [
            'questions' => 'array',
            'user_answers' => 'array',
            'completed_at' => 'datetime',
        ];
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function chapter()
    {
        return $this->belongsTo(Chapter::class);
    }

    /**
     * Normalise generated questions into the full shape, assigning
     * each one a stable id (mirrors MongoDB subdocument `_id`s).
     */
    public static function buildQuestions(array $rawQuestions): array
    {
        return array_map(function (array $q) {
            return [
                'id' => (string) Str::uuid(),
                'question' => $q['question'],
                'options' => array_values($q['options']),
                'correctAnswer' => $q['correctAnswer'],
                'explanation' => $q['explanation'] ?? '',
                'difficulty' => $q['difficulty'] ?? 'medium',
            ];
        }, $rawQuestions);
    }

    public function toResponseArray(?Chapter $chapter = null): array
    {
        $chapter ??= $this->relationLoaded('chapter') ? $this->chapter : null;

        return [
            'id' => $this->id,
            'userId' => $this->user_id,
            'chapterId' => $chapter
                ? ['id' => $chapter->id, 'title' => $chapter->title]
                : $this->chapter_id,
            'title' => $this->title,
            'questions' => $this->questions ?? [],
            'userAnswers' => $this->user_answers ?? [],
            'score' => $this->score,
            'totalQuestions' => $this->total_questions,
            'completedAt' => $this->completed_at?->toIso8601String(),
            'createdAt' => $this->created_at?->toIso8601String(),
            'updatedAt' => $this->updated_at?->toIso8601String(),
        ];
    }

    public function chapter()
    {
        return $this->belongsTo(Chapter::class);
    }
}
