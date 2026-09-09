<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class QuizAttempt extends Model
{
    protected $fillable = [ 'quiz_id', 'user_id', 'attempt_number', 'correct_count', 'total_questions', 'score', 'user_answers', 'completed_at', ]; 
    protected $casts = [ 'user_answers' => 'array', 'completed_at' => 'datetime', 'score' => 'integer', 'correct_count' => 'integer', 'total_questions' => 'integer', 'attempt_number' => 'integer', ]; 
    public function quiz(): BelongsTo { return $this->belongsTo(Quiz::class); } 
    public function user(): BelongsTo { return $this->belongsTo(User::class); }
}
