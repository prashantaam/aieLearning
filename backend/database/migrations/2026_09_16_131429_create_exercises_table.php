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

            $table->foreignId('sublesson_id')
                ->constrained('sublessons')
                ->cascadeOnDelete();

            $table->foreignId('created_by')
                ->constrained('teachers')
                ->cascadeOnDelete();

            // Basic exercise information
            $table->string('title');

            $table->longText('instructions')
                ->nullable();

            // code / terminal / sql / project
            $table->string('exercise_type')
                ->default('code');

            // python / javascript / php / sql / bash / git / react etc.
            $table->string('language')
                ->nullable();

            // Code shown to the student initially
            $table->longText('starter_code')
                ->nullable();

            // Teacher/AI reference solution
            $table->longText('solution_code')
                ->nullable();

            // Simple output-based validation
            $table->longText('expected_output')
                ->nullable();

            // Runtime-specific configuration
            $table->json('settings')
                ->nullable();

            $table->unsignedInteger('sort_order')
                ->default(1);

            // manual / ai / upload
            $table->string('source_type')
                ->default('manual');

            // draft / published
            $table->string('status')
                ->default('draft');

            $table->timestamps();

            $table->index([
                'sublesson_id',
                'sort_order',
            ]);

            $table->index([
                'sublesson_id',
                'status',
            ]);

            $table->index([
                'exercise_type',
                'language',
            ]);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('exercises');
    }
};