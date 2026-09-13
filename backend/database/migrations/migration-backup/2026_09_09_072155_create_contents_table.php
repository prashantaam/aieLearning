<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('contents', function (Blueprint $table) {
            $table->id();

            $table->foreignId('chapter_id')
                ->constrained('chapters')
                ->cascadeOnDelete();

            $table->foreignId('created_by')
                ->constrained('users')
                ->cascadeOnDelete();

            $table->string('title');

            $table->longText('content');

            $table->string('source_type')
                ->default('text');

            $table->string('original_file_name')->nullable();
            $table->string('original_file_path')->nullable();

            $table->string('status')
                ->default('published');

            $table->timestamps();

            $table->index(['chapter_id', 'status']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('contents');
    }
};