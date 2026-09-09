<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Document extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'title',
        'file_name',
        'file_path',
        'file_size',
        'extracted_text',
        'chunks',
        'upload_date',
        'last_accessed',
        'status',
    ];

    protected function casts(): array
    {
        return [
            'chunks' => 'array',
            'upload_date' => 'datetime',
            'last_accessed' => 'datetime',
        ];
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function flashcards()
    {
        return $this->hasMany(Flashcard::class);
    }

    public function quizzes()
    {
        return $this->hasMany(Quiz::class);
    }

    public function chatHistory()
    {
        return $this->hasOne(ChatHistory::class);
    }

    /**
     * List-view shape (no extractedText / chunks) — matches the
     * original `getDocuments` aggregation response.
     */
    public function toListArray(): array
    {
        return [
            'id' => $this->id,
            'userId' => $this->user_id,
            'title' => $this->title,
            'fileName' => $this->file_name,
            'filePath' => $this->file_path,
            'fileSize' => $this->file_size,
            'uploadDate' => $this->upload_date?->toIso8601String(),
            'lastAccessed' => $this->last_accessed?->toIso8601String(),
            'status' => $this->status,
            'flashcardCount' => $this->flashcards_count ?? $this->flashcards()->count(),
            'quizCount' => $this->quizzes_count ?? $this->quizzes()->count(),
            'createdAt' => $this->created_at?->toIso8601String(),
            'updatedAt' => $this->updated_at?->toIso8601String(),
        ];
    }

    /**
     * Detail-view shape (includes counts, excludes raw chunks to keep
     * payloads light — matches the original `getDocument` response).
     */
    public function toDetailArray(): array
    {
        return array_merge($this->toListArray(), [
            'extractedText' => $this->extracted_text,
        ]);
    }
}
