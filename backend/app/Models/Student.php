<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class Student extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;

    /**
     * The attributes that are mass assignable.
     */
    protected $fillable = [
        'username',
        'email',
        'password',
        'profile_image',
        'is_active',
    ];

    /**
     * The attributes that should be hidden
     * when the model is converted to JSON.
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Attribute casts.
     */
    protected function casts(): array
    {
        return [
            'password' => 'hashed',
            'is_active' => 'boolean',
        ];
    }

    /**
     * Quiz attempts made by this student.
     */
    public function quizAttempts()
    {
        return $this->hasMany(QuizAttempt::class);
    }

    /**
     * Documents belonging to this student.
     *
     * This relationship can be removed later if
     * documents are no longer part of the student system.
     */
    public function documents()
    {
        return $this->hasMany(Document::class);
    }

    /**
     * Chat history belonging to this student.
     *
     * This relationship can be removed later if
     * AI chat history is not used by students.
     */
    public function chatHistories()
    {
        return $this->hasMany(ChatHistory::class);
    }
}