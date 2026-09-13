<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('chapters', function (Blueprint $table) {
            $table->id();

            $table->foreignId('subject_id')
                ->constrained('subjects')
                ->cascadeOnDelete();

            $table->string('title');
            $table->text('description')->nullable();

            $table->unsignedInteger('chapter_order')
                ->default(1);

            $table->string('status')
                ->default('draft');

            $table->timestamps();

            $table->index(['subject_id', 'chapter_order']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('chapters');
    }
};