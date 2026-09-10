<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Models\Flashcard;

class Chapter extends Model
{
    use HasFactory;

    protected $fillable = [
        'subject_id',
        'title',
        'description',
        'chapter_order',
        'status',
    ];

    public function subject()
    {
        return $this->belongsTo(Subject::class);
    }

    public function contents()
    {
        return $this->hasMany(Content::class);
    }

    public function quizzes()
    {
        return $this->hasMany(Quiz::class);
    }

    public function flashcards()
    {
        return $this->hasMany(Flashcard::class);
    }
}