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
            $table->foreignId('sublesson_id')->constrained('sublessons')->cascadeOnDelete();
            $table->string('title')->nullable();
            $table->json('cards')->nullable();
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
        Schema::dropIfExists('flashcards');
    }
};
