<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('quizzes', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('document_id')->constrained()->cascadeOnDelete();
            $table->string('title');
            // Each element: { id, question, options[4], correctAnswer, explanation, difficulty }
            $table->json('questions')->nullable();
            // Each element: { questionIndex, selectedAnswer, isCorrect, answeredAt }
            $table->json('user_answers')->nullable();
            $table->unsignedTinyInteger('score')->default(0);
            $table->unsignedInteger('total_questions');
            $table->timestamp('completed_at')->nullable();
            $table->timestamps();

            $table->index(['user_id', 'document_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('quizzes');
    }
};
