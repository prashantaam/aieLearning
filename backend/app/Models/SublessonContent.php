<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class SublessonContent extends Model
{
    use HasFactory;

    protected $fillable = [
        'sublesson_id',
        'created_by',
        'type',
        'content',
        'settings',
        'sort_order',
        'source_type',
        'original_file_name',
        'original_file_path',
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