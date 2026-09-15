<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Flashcard extends Model
{
    use HasFactory;

    protected $fillable = [
        'sublesson_id',
        'title',
        'cards',
        'source_type',
        'sort_order',
        'status',
    ];

    protected function casts(): array
    {
        return [
            'cards' => 'array',
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

    /*
    |--------------------------------------------------------------------------
    | API Response
    |--------------------------------------------------------------------------
    */

    public function toResponseArray(
        ?Sublesson $sublesson = null
    ): array {
        $sublesson ??=
            $this->relationLoaded('sublesson')
                ? $this->sublesson
                : null;

        return [
            'id' => $this->id,

            'sublessonId' =>
                $sublesson
                    ? [
                        'id' =>
                            $sublesson->id,

                        'title' =>
                            $sublesson->title,
                    ]
                    : $this->sublesson_id,

            'title' =>
                $this->title,

            'cards' =>
                $this->cards ?? [],

            'totalCards' =>
                count(
                    $this->cards ?? []
                ),

            'sourceType' =>
                $this->source_type,

            'sortOrder' =>
                $this->sort_order,

            'status' =>
                $this->status,

            'createdAt' =>
                $this->created_at
                    ?->toIso8601String(),

            'updatedAt' =>
                $this->updated_at
                    ?->toIso8601String(),
        ];
    }
}