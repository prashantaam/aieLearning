<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Sublesson extends Model
{
    use HasFactory;

    protected $fillable = [
        'lesson_id',
        'title',
        'description',
        'sort_order',
        'status',
    ];

    protected function casts(): array
    {
        return [
            'sort_order' => 'integer',
        ];
    }

    public function lesson()
    {
        return $this->belongsTo(Lesson::class);
    }

    public function contents()
    {
        return $this->hasMany(
            SublessonContent::class
        )->orderBy('sort_order');
    }

    public function exercises()
    {
        return $this->hasMany(
            Exercise::class
        )->orderBy('sort_order');
    }

    

    public function quizzes()
    {
        return $this->hasMany(
            Quiz::class
        )->orderBy('sort_order');
    }

    public function flashcards()
    {
        return $this->hasMany(
            Flashcard::class
        )->orderBy('sort_order');
    }
}