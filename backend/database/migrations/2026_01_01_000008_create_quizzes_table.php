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
            $table->foreignId('sublesson_id')->constrained('sublessons')->cascadeOnDelete();
            $table->string('title');
            $table->json('questions');
            $table->unsignedInteger('total_questions')->default(0);
            $table->unsignedInteger('sort_order')->default(1);
            $table->string('source_type')->default('ai');
            $table->string('status')->default('draft');
            $table->timestamps();

            $table->index(['sublesson_id', 'sort_order']);
            $table->index(['sublesson_id', 'status']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('quizzes');
    }
};
