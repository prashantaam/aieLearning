<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('exercises', function (Blueprint $table) {
            $table->id();
            $table->foreignId('sublesson_id')->constrained('sublessons')->cascadeOnDelete();
            $table->string('title');
            $table->text('instructions')->nullable();

            // Examples: multiple_choice, fill_blank, short_answer, ordering, matching, code.
            $table->string('exercise_type')->default('short_answer');

            $table->longText('question')->nullable();
            $table->longText('starter_code')->nullable();
            $table->longText('solution')->nullable();
            $table->json('test_cases')->nullable();
            $table->json('hints')->nullable();
            $table->json('settings')->nullable();

            $table->unsignedInteger('sort_order')->default(1);
            $table->string('source_type')->default('manual');
            $table->string('status')->default('draft');
            $table->timestamps();

            $table->index(['sublesson_id', 'sort_order']);
            $table->index(['sublesson_id', 'status']);
            $table->index(['sublesson_id', 'exercise_type']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('exercises');
    }
};
