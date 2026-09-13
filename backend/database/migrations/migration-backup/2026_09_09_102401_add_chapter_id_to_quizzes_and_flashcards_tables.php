<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('quizzes', function (Blueprint $table) {
            $table->foreignId('chapter_id')
                ->nullable()
                ->after('document_id')
                ->constrained('chapters')
                ->cascadeOnDelete();
        });

        Schema::table('flashcards', function (Blueprint $table) {
            $table->foreignId('chapter_id')
                ->nullable()
                ->after('document_id')
                ->constrained('chapters')
                ->cascadeOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table('quizzes', function (Blueprint $table) {
            $table->dropConstrainedForeignId('chapter_id');
        });

        Schema::table('flashcards', function (Blueprint $table) {
            $table->dropConstrainedForeignId('chapter_id');
        });
    }
};