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
        'sublesson_id',
        'title',
        'questions',
        'total_questions',
        'source_type',
        'sort_order',
        'status',
    ];

    protected function casts(): array
    {
        return [
            'questions' => 'array',
            'total_questions' => 'integer',
            'sort_order' => 'integer',
        ];
    }

    /*
    |--------------------------------------------------------------------------
    | Relationships
    |--------------------------------------------------------------------------
    */

    public function sublesson(): BelongsTo
    {
        return $this->belongsTo(
            Sublesson::class
        );
    }

    public function attempts(): HasMany
    {
        return $this->hasMany(
            QuizAttempt::class
        );
    }

    /*
    |--------------------------------------------------------------------------
    | Build Questions
    |--------------------------------------------------------------------------
    |
    | Normalise AI-generated questions into the structure stored
    | inside the quizzes.questions JSON column.
    |
    */

    public static function buildQuestions(
        array $rawQuestions
    ): array {
        return array_map(
            function (array $question) {
                return [
                    'id' => (string) Str::uuid(),

                    'question' =>
                        $question['question'] ?? '',

                    'options' => array_values(
                        $question['options'] ?? []
                    ),

                    'correctAnswer' =>
                        $question['correctAnswer'] ?? null,

                    'explanation' =>
                        $question['explanation'] ?? '',

                    'difficulty' =>
                        $question['difficulty'] ?? 'medium',
                ];
            },
            $rawQuestions
        );
    }

    /*
    |--------------------------------------------------------------------------
    | API Response
    |--------------------------------------------------------------------------
    |
    | Standard response structure used by the teacher/student frontend.
    |
    */

    public function toResponseArray(
        ?Sublesson $sublesson = null
    ): array {
        $sublesson ??= $this->relationLoaded('sublesson')
            ? $this->sublesson
            : null;

        return [
            'id' => $this->id,

            'sublessonId' => $sublesson
                ? [
                    'id' => $sublesson->id,
                    'title' => $sublesson->title,
                ]
                : $this->sublesson_id,

            'title' => $this->title,

            'questions' =>
                $this->questions ?? [],

            'totalQuestions' =>
                $this->total_questions,

            'sourceType' =>
                $this->source_type,

            'sortOrder' =>
                $this->sort_order,

            'status' =>
                $this->status,

            'createdAt' =>
                $this->created_at?->toIso8601String(),

            'updatedAt' =>
                $this->updated_at?->toIso8601String(),
        ];
    }
}
