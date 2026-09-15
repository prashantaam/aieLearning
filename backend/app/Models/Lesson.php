<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Models\Flashcard;

class Lesson extends Model
{
    use HasFactory;

    protected $fillable = [
        'course_id',
        'title',
        'description',
        'lesson_order',
        'status',
    ];

    public function sublessons()
    {
        return $this->hasMany(
            Sublesson::class
        )->orderBy('sort_order');
    }

    public function course()
    {
        return $this->belongsTo(Course::class);
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