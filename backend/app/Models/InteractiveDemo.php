<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class InteractiveDemo extends Model
{
    use HasFactory;

   protected $fillable = [
    'sublesson_id',
    'created_by',
    'title',
    'instruction',
    'code',
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