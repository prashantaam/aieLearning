<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Exercise extends Model
{
    use HasFactory;

    protected $fillable = [
        'sublesson_id',
        'created_by',
        'title',
        'instructions',
        'exercise_type',
        'language',
        'starter_code',
        'solution_code',
        'expected_output',
        'settings',
        'sort_order',
        'source_type',
        'status',
    ];

    protected function casts(): array
    {
        return [
            'settings' => 'array',
            'sort_order' => 'integer',
        ];
    }

    public function sublesson()
    {
        return $this->belongsTo(
            Sublesson::class
        );
    }

    public function teacher()
    {
        return $this->belongsTo(
            Teacher::class,
            'created_by'
        );
    }
}