<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Str;

class Quiz extends Model
{
    use HasFactory;

    protected $fillable = [
        'lesson_id',
        'title',
        'questions',
        'total_questions',
        'source_type',
        'status',
    ];

    protected function casts(): array
    {
        return [
            'questions' => 'array',
            'total_questions' => 'integer',
        ];
    }

    /**
     * Quiz belongs to a lesson.
     */
    public function lesson(): BelongsTo
    {
        return $this->belongsTo(Lesson::class);
    }

    /**
     * Student attempts for this quiz.
     */
    public function attempts(): HasMany
    {
        return $this->hasMany(QuizAttempt::class);
    }

    /**
     * Normalise AI-generated questions into
     * the structure stored in the quizzes table.
     */
    public static function buildQuestions(array $rawQuestions): array
    {
        return array_map(function (array $q) {
            return [
                'id' => (string) Str::uuid(),

                'question' => $q['question'] ?? '',

                'options' => array_values(
                    $q['options'] ?? []
                ),

                'correctAnswer' =>
                    $q['correctAnswer'] ?? null,

                'explanation' =>
                    $q['explanation'] ?? '',

                'difficulty' =>
                    $q['difficulty'] ?? 'medium',
            ];
        }, $rawQuestions);
    }

    /**
     * API response structure for teacher/student UI.
     */
    public function toResponseArray(?Lesson $lesson = null): array
    {
        $lesson ??= $this->relationLoaded('lesson')
            ? $this->lesson
            : null;

        return [
            'id' => $this->id,

            'lessonId' => $lesson
                ? [
                    'id' => $lesson->id,
                    'title' => $lesson->title,
                ]
                : $this->lesson_id,

            'title' => $this->title,

            'questions' =>
                $this->questions ?? [],

            'totalQuestions' =>
                $this->total_questions,

            'sourceType' =>
                $this->source_type,

            'status' =>
                $this->status,

            'createdAt' =>
                $this->created_at?->toIso8601String(),

            'updatedAt' =>
                $this->updated_at?->toIso8601String(),
        ];
    }
}