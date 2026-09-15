```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Exercise extends Model
{
    use HasFactory;

    protected $fillable = [
        'sublesson_id',
        'title',
        'instructions',
        'exercise_type',
        'question',
        'starter_code',
        'solution',
        'test_cases',
        'hints',
        'settings',
        'sort_order',
        'status',
    ];

    protected function casts(): array
    {
        return [
            'test_cases' => 'array',
            'hints' => 'array',
            'settings' => 'array',
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
        return $this->belongsTo(Sublesson::class);
    }

    /*
    |--------------------------------------------------------------------------
    | Teacher/Admin Response
    |--------------------------------------------------------------------------
    |
    | Full response including solution and test cases.
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

            'instructions' =>
                $this->instructions,

            'exerciseType' =>
                $this->exercise_type,

            'question' =>
                $this->question,

            'starterCode' =>
                $this->starter_code,

            'solution' =>
                $this->solution,

            'testCases' =>
                $this->test_cases ?? [],

            'hints' =>
                $this->hints ?? [],

            'settings' =>
                $this->settings ?? [],

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

    /*
    |--------------------------------------------------------------------------
    | Student Response
    |--------------------------------------------------------------------------
    |
    | Do not expose the solution or hidden test cases to students.
    |
    */

    public function toStudentResponseArray(): array
    {
        return [
            'id' => $this->id,

            'sublessonId' =>
                $this->sublesson_id,

            'title' =>
                $this->title,

            'instructions' =>
                $this->instructions,

            'exerciseType' =>
                $this->exercise_type,

            'question' =>
                $this->question,

            'starterCode' =>
                $this->starter_code,

            'hints' =>
                $this->hints ?? [],

            'settings' =>
                $this->settings ?? [],

            'sortOrder' =>
                $this->sort_order,
        ];
    }
}
```
