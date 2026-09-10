<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Content extends Model
{
    use HasFactory;

    protected $fillable = [
        'chapter_id',
        'created_by',
        'content',
        'source_type',
        'original_file_name',
        'original_file_path',
        'status',
    ];

    public function chapter()
    {
        return $this->belongsTo(Chapter::class);
    }

    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }
}