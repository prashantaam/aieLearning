<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('flashcards', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('document_id')->constrained()->cascadeOnDelete();
            // Each element: { id, question, answer, difficulty, lastReviewed, reviewCount, isStarred }
            $table->json('cards')->nullable();
            $table->timestamps();

            $table->index(['user_id', 'document_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('flashcards');
    }
};
