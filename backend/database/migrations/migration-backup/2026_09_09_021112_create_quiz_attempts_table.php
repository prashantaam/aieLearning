<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('quiz_attempts', function (Blueprint $table) {
            $table->id();

            $table->foreignId('quiz_id')
                ->constrained('quizzes')
                ->cascadeOnDelete();

            $table->foreignId('user_id')
                ->constrained('users')
                ->cascadeOnDelete();

            $table->unsignedInteger('attempt_number');

            $table->unsignedInteger('correct_count')->default(0);

            $table->unsignedInteger('total_questions')->default(0);

            $table->unsignedInteger('score')->default(0);

            $table->json('user_answers')->nullable();

            $table->timestamp('completed_at')->nullable();

            $table->timestamps();

            $table->unique(['quiz_id', 'attempt_number']);
            $table->index(['user_id', 'quiz_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('quiz_attempts');
    }
};

